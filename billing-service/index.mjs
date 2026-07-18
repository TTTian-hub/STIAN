/**
 * AskFate 计费 sidecar（独立纯 Node 进程）
 * 监听 127.0.0.1（仅容器内可达），由 Next 路由经 RPC 调用。
 *
 * 负责：
 *  ① 计费/数据库 RPC（/billing）—— 避免 @cloudbase/node-sdk 与 Next 全局流冲突；
 *  ② AI 流式代理（/ai-stream）—— 纯 Node 调 DeepSeek + 解析 SSE 成纯文本流 + 落历史，
 *     同样把"创建流"的动作隔离在 Next 之外的纯净 Node 运行时，彻底规避
 *     Next 全局 ReadableStream 与原生 ReadableStream 的"品牌"冲突（该冲突曾导致
 *     AI 解读接口返回 nginx 502）。
 */
import http from 'node:http';
import { handleBilling, saveHistory, refund } from './billing.impl.mjs';

const PORT = Number(process.env.BILLING_PORT || 3100);
const HOST = process.env.BILLING_HOST || '127.0.0.1';

const DEEPSEEK_BASE = (process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com').replace(/\/$/, '');
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY || '';
const DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL || 'deepseek-chat';
const AI_TIMEOUT = Number(process.env.DEEPSEEK_TIMEOUT_MS || 60000);

/** 解析 DeepSeek 的 SSE 流，逐块回调纯文本片段（跳过 [DONE] 与非 JSON 行）。 */
async function parseSSE(body, onText) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() || '';
    for (const line of lines) {
      const s = line.trim();
      if (!s.startsWith('data:')) continue;
      const data = s.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const j = JSON.parse(data);
        const c = j.choices?.[0]?.delta?.content;
        if (c) await onText(c);
      } catch {
        /* 跳过非 JSON 片段（如注释行） */
      }
    }
  }
}

async function handleAiStream(req, res) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  let p;
  try {
    p = JSON.parse(raw || '{}');
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'invalid json' }));
    return;
  }
  const { prompt, systemPrompt, temperature, feature, featureName, cost, summary, userId, requestId } = p;
  if (!prompt || !userId) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'missing prompt/userId' }));
    return;
  }

  const url = `${DEEPSEEK_BASE}/chat/completions`;
  let upstream;
  try {
    upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${DEEPSEEK_KEY}` },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: prompt },
        ],
        max_tokens: 8192,
        temperature: typeof temperature === 'number' ? temperature : 0.7,
        stream: true,
      }),
      signal: AbortSignal.timeout(AI_TIMEOUT),
    });
  } catch (e) {
    // 网络/超时：交给 Next 侧统一退款（返回 502 JSON）
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'AI 网络错误，请稍后重试' }));
    return;
  }

  if (!upstream.ok) {
    const txt = await upstream.text().catch(() => '');
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: `AI 返回错误: ${upstream.status} ${txt.slice(0, 200)}` }));
    return;
  }

  // 流式输出纯文本（Node http 在 write 后自动 chunked）
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  let full = '';
  try {
    await parseSSE(upstream.body, async (t) => {
      full += t;
      res.write(t);
    });
  } catch (e) {
    // 流中途失败：已发 200 无法改状态码 → 提示并退款
    try {
      res.write('\n[解读中断，次数已退回]');
    } catch {}
    try {
      await refund(userId, requestId, feature);
    } catch {}
    res.end();
    return;
  }
  res.end();

  // 流正常结束 → 落历史
  try {
    await saveHistory({
      user_id: userId,
      feature,
      feature_name: featureName || feature,
      summary: summary || '',
      result: {},
      ai_text: full,
      cost: Number(cost) || 1,
      request_id: requestId,
      created_at: Date.now(),
    });
  } catch (e) {
    console.error('[ai-stream] saveHistory failed:', e);
  }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && (req.url === '/billing' || req.url === '/billing/')) {
    let body = '';
    try {
      for await (const chunk of req) body += chunk;
      const { op, args } = JSON.parse(body || '{}');
      if (op === 'health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, data: { health: 'ok' } }));
        return;
      }
      const data = await handleBilling(op, Array.isArray(args) ? args : []);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, data }));
    } catch (e) {
      const msg = e && e.message ? e.message : String(e);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: msg }));
    }
    return;
  }

  if (req.method === 'POST' && (req.url === '/ai-stream' || req.url === '/ai-stream/')) {
    try {
      await handleAiStream(req, res);
    } catch (e) {
      console.error('[ai-stream] fatal:', e);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(e?.message || e) }));
      } else {
        res.end();
      }
    }
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: false, error: 'not found' }));
});

server.listen(PORT, HOST, () => {
  console.log(`[billing-sidecar] listening on http://${HOST}:${PORT} (billing + ai-stream)`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => {
    server.close(() => process.exit(0));
  });
}
