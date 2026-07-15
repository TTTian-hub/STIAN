import type { AIProvider, AIOptions } from '../types';

/** Promise 硬超时：超过 ms 即 reject，避免下游无限挂起 */
function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`[Fallback] ${label} 超时（${ms}ms）`));
    }, ms);
    if (timer.unref) timer.unref();
    p.then(
      (v) => {
        clearTimeout(timer);
        resolve(v);
      },
      (e) => {
        clearTimeout(timer);
        reject(e);
      }
    );
  });
}

/**
 * 兜底 Provider：优先 primary（CodeBuddy）；当 primary 在沙箱等环境「连不上
 * 网关、握手后不吐字、无限挂起」时，自动切到 secondary（DeepSeek 公网直连）。
 *
 * 设计：先在外层「试读」primary 的首字节（首字节竞速），成功就包成 primary 流
 * 直出；失败（超时/抛错）则直接返回 secondary 的流。secondary 也失败则返回一个
 * 友好的错误提示文本并干净关闭（HTTP 200 + 正常 EOF，不会让连接挂死）。
 *
 * 状态缓存：一旦判定 primary 不可用，后续请求直接走 secondary，不再白等。
 */
export class FallbackProvider implements AIProvider {
  private primaryOk: boolean | null = null; // null=未知 true=可用 false=不可用
  private readonly firstChunkMs = Number(process.env.FALLBACK_FIRST_CHUNK_MS || 6000);
  private readonly secondaryMs = Number(process.env.FALLBACK_SECONDARY_MS || 25000);

  constructor(
    private readonly primary: AIProvider,
    private readonly secondary: AIProvider,
    private readonly tag = 'fallback'
  ) {}

  async streamCompletion(prompt: string, options?: AIOptions): Promise<ReadableStream> {
    // 已知状态 -> 直接走对应 provider，零额外等待
    if (this.primaryOk === false) return this.safeSecondary(prompt, options);
    if (this.primaryOk === true) return this.primary.streamCompletion(prompt, options);

    // 未知 -> 试读 primary 首字节，跑完即缓存结论
    try {
      const ps = await this.primary.streamCompletion(prompt, options);
      const reader = ps.getReader();
      const { value, done } = await withTimeout(reader.read(), this.firstChunkMs, 'primary 首字节');
      if (done || !value || value.length === 0) throw new Error('primary 无首字节');
      this.primaryOk = true;
      console.log(`[${this.tag}] primary 正常，后续直连`);
      // 把已读到的首字节 + 余下内容包成一个完整流
      return this.wrapAfterFirst(reader, value);
    } catch (e) {
      this.primaryOk = false;
      console.warn(`[${this.tag}] primary 不可用（${(e as Error)?.message || e}），永久切 secondary`);
      return this.safeSecondary(prompt, options);
    }
  }

  /** 把已经读到首字节的 reader 续写成完整流 */
  private wrapAfterFirst(
    reader: ReadableStreamDefaultReader<Uint8Array>,
    first: Uint8Array
  ): ReadableStream<Uint8Array> {
    let sentFirst = false;
    return new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          if (!sentFirst) {
            sentFirst = true;
            controller.enqueue(first);
            return;
          }
          const { value, done } = await reader.read();
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
        } catch (err) {
          controller.error(err);
        }
      },
      cancel() {
        reader.cancel().catch(() => {});
      },
    });
  }

  /** 调用 secondary，失败时返回友好提示流（干净关闭，避免连接挂死） */
  private async safeSecondary(prompt: string, options?: AIOptions): Promise<ReadableStream> {
    try {
      return await withTimeout(this.secondary.streamCompletion(prompt, options), this.secondaryMs, 'secondary');
    } catch (e) {
      const reason = (e as Error)?.message || String(e);
      console.warn(`[${this.tag}] secondary 也失败（${reason}），返回友好提示`);
      const msg =
        '⚠️ 当前环境无法连接 AI 服务（CodeBuddy 网关不可达，且备用通道失败：' +
        reason +
        '）。请在可联网的机器上运行以获得真实解读。';
      const enc = new TextEncoder();
      return new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(enc.encode(msg));
          controller.close();
        },
      });
    }
  }

  async complete(prompt: string, options?: AIOptions): Promise<string> {
    try {
      return await withTimeout(this.primary.complete(prompt, options), this.firstChunkMs + 5000, 'primary.complete');
    } catch (e) {
      console.warn(`[${this.tag}] primary complete 失败，切 secondary ->`, (e as Error)?.message);
      return this.secondary.complete(prompt, options);
    }
  }
}
