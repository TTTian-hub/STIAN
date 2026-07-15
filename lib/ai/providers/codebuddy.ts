import { unstable_v2_createSession as createSession } from '@tencent-ai/agent-sdk';
import type { Message, RawMessageStreamEvent } from '@tencent-ai/agent-sdk';
import type { AIProvider, AIOptions } from '../types';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// 一个常驻的 SDK 会话（已 connect，无历史）。每次请求取一个用、用完即关，
// 后台再补一个进预热池 —— 这样既消除了「每条消息冷启动」，又不会让不同请求
// 的对话历史串台（stateless API 必备）。
type SdkSession = ReturnType<typeof createSession>;

interface Pooled {
  session: SdkSession;
  model: string;
}

export class CodeBuddyProvider implements AIProvider {
  private apiKey: string;
  private defaultModel: string;
  private cwd: string;
  private idle: Pooled[] = [];
  private pendingCreates = 0;
  private readonly maxIdle = Math.max(1, Number(process.env.CODEBUDDY_POOL_SIZE || 3));
  private idleTimer: ReturnType<typeof setInterval> | null = null;

  // 网关不可达时 SDK 的 connect 会「无限挂起」（既 resolve 也不 reject）。
  // 这里加硬超时：超过 CONNECT_TIMEOUT_MS 视为失败；并把 provider 标记为
  // 不可用一段时间，使后续请求瞬间失败 -> 让外层 FallbackProvider 立刻接管。
  private readonly CONNECT_TIMEOUT_MS = Number(process.env.CODEBUDDY_CONNECT_TIMEOUT_MS || 8000);
  private unavailableUntil = 0; // 时间戳；Date.now() < 此值 时视为不可用
  private readonly UNAVAILABLE_COOLDOWN_MS = 5 * 60 * 1000;

  constructor(apiKey?: string, _baseUrl?: string) {
    this.apiKey = apiKey || process.env.CODEBUDDY_API_KEY || '';
    this.defaultModel = process.env.CODEBUDDY_MODEL || 'hy3';
    this.cwd = process.env.CODEBUDDY_CWD || path.join(os.tmpdir(), 'askfate-codebuddy');

    // SDK 必须在 Node 里拉起 CLI 子进程；cwd 不能是 node_modules 巨目录
    fs.mkdirSync(this.cwd, { recursive: true });

    // 复用用户在算命 app 里的同一个 key + 外部网关
    if (this.apiKey) process.env.CODEBUDDY_API_KEY = this.apiKey;
    process.env.CODEBUDDY_INTERNET_ENVIRONMENT =
      process.env.CODEBUDDY_INTERNET_ENVIRONMENT || 'external';

    if (!this.apiKey) {
      console.warn('[CodeBuddyProvider] 未配置 CODEBUDDY_API_KEY，AI 调用会失败');
    }

    this.prewarm();
    this.idleTimer = setInterval(() => this.reclaim(), 10 * 60 * 1000);
    if (this.idleTimer.unref) this.idleTimer.unref();
  }

  /** 给 Promise 套一个硬超时，避免 SDK connect 在不可达网络下无限挂起 */
  private withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`[CodeBuddyProvider] ${label} 超时（${ms}ms，网关可能不可达）`));
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

  /** 创建一个已 connect 的干净会话（无历史） */
  private async createOne(model = this.defaultModel): Promise<Pooled> {
    const session = createSession({
      cwd: this.cwd,
      model,
      // 不用 SDK 的 systemPrompt（创建期写死、无法按请求改）；
      // 改为在发送时把 systemPrompt 拼到 prompt 前面，实现等价且可热变。
      permissionMode: 'bypassPermissions',
      includePartialMessages: true, // 拿到逐字 text_delta，做真流式
    });
    try {
      await this.withTimeout(session.connect(), this.CONNECT_TIMEOUT_MS, 'session.connect');
    } catch (e) {
      // 连不上 -> 标记一段时间不可用，让后续请求瞬间失败并交给兜底 provider
      this.unavailableUntil = Date.now() + this.UNAVAILABLE_COOLDOWN_MS;
      console.warn('[CodeBuddyProvider] connect 失败，标记不可用 ->', (e as Error)?.message);
      throw e;
    }
    return { session, model };
  }

  /** 预热线充填会话，使首字零冷启动 */
  private prewarm() {
    for (let i = 0; i < this.maxIdle; i++) this.replenish();
  }

  private replenish() {
    if (this.idle.length + this.pendingCreates >= this.maxIdle) return;
    this.pendingCreates++;
    this.createOne()
      .then((p) => {
        this.idle.push(p);
        this.pendingCreates--;
      })
      .catch(() => {
        this.pendingCreates--;
      });
  }

  /** 取一个会话：优先用预热的，池空了就临时新建（冷启动，仅突发时） */
  private async acquire(): Promise<Pooled> {
    // 已标记不可用（如沙箱连不上内网网关）：瞬间失败，
    // 让外层 FallbackProvider 立即切到 DeepSeek，避免每个请求白等超时。
    if (Date.now() < this.unavailableUntil) {
      throw new Error('[CodeBuddyProvider] 当前标记为不可用（网关不可达），跳过');
    }
    const existing = this.idle.pop();
    if (existing) return existing;
    return this.createOne();
  }

  /** 用完即关（丢弃历史），再补一个进池 */
  private release(p: Pooled) {
    try {
      p.session.close();
    } catch {
      /* ignore */
    }
    this.replenish();
  }

  /** 周期性回收空闲会话，控制常驻子进程数量 */
  private reclaim() {
    while (this.idle.length) {
      const p = this.idle.pop()!;
      try {
        p.session.close();
      } catch {
        /* ignore */
      }
    }
    this.replenish();
  }

  /** 把 systemPrompt 拼到 prompt 前面（等价 system 角色，但可热变） */
  private buildPrompt(prompt: string, options?: AIOptions): string {
    const sys = options?.systemPrompt?.trim();
    return (sys ? sys + '\n\n' : '') + (prompt || '');
  }

  /** 从 SDK 消息流里抽取文本，增量 enqueue（partials 优先，final 兜底补差） */
  private static extractText(
    msg: Message,
    emitted: { n: number }
  ): string {
    if (msg.type === 'stream_event') {
      const ev = (msg as unknown as { event: RawMessageStreamEvent }).event;
      if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
        const t = ev.delta.text;
        if (t) {
          emitted.n += t.length;
          return t;
        }
      }
      return '';
    }
    if (msg.type === 'assistant') {
      const m = msg as unknown as {
        message?: { content?: Array<{ type: string; text?: string }> };
      };
      const full = (m.message?.content || [])
        .filter((b) => b.type === 'text')
        .map((b) => b.text || '')
        .join('');
      const rest = full.slice(emitted.n);
      if (rest) emitted.n += rest.length;
      return rest;
    }
    return '';
  }

  async streamCompletion(prompt: string, options?: AIOptions): Promise<ReadableStream> {
    const model = options?.model || this.defaultModel;
    const built = this.buildPrompt(prompt, options);
    const pooled = await this.acquire();
    const self = this;

    return new ReadableStream({
      async start(controller) {
        const emitted = { n: 0 };
        try {
          if (model !== pooled.model) {
            await pooled.session.setModel(model);
            pooled.model = model;
          }
          await pooled.session.send(built);
          for await (const msg of pooled.session.stream()) {
            const chunk = CodeBuddyProvider.extractText(msg, emitted);
            if (chunk) controller.enqueue(chunk);
          }
          controller.close();
        } catch (e) {
          controller.error(e);
        } finally {
          self.release(pooled);
        }
      },
    });
  }

  async complete(prompt: string, options?: AIOptions): Promise<string> {
    const model = options?.model || this.defaultModel;
    const built = this.buildPrompt(prompt, options);
    const pooled = await this.acquire();
    const emitted = { n: 0 };
    let text = '';
    try {
      if (model !== pooled.model) {
        await pooled.session.setModel(model);
        pooled.model = model;
      }
      await pooled.session.send(built);
      for await (const msg of pooled.session.stream()) {
        const chunk = CodeBuddyProvider.extractText(msg, emitted);
        if (chunk) text += chunk;
      }
      return text;
    } finally {
      this.release(pooled);
    }
  }
}
