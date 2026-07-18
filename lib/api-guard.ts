/**
 * 服务端计费守卫（所有 AI 解读路由统一复用）
 *
 * 职责：
 * - requirePaid：校验已签名的 entitlement → 取出 userId → 首登赠送 → 原子扣次。
 *   余额不足返回 402 { code:'INSUFFICIENT', need }，绝不调用 AI。
 * - handleBillingStream：扣次后，把 AI 流式请求转发给计费 sidecar 的 /ai-stream
 *   端点（sidecar 是纯 Node 进程，负责调 DeepSeek + 解析 SSE + 落历史），
 *   然后**直接透传** sidecar 返回的文本流（new Response(r.body)），
 *   绝不在 Next 进程内 new ReadableStream/TransformStream —— 规避 Next 全局流
 *   与 Node 原生 ReadableStream 的"品牌"冲突（此前导致 AI 接口 nginx 502）。
 *
 * 这样每一条 AI 路由只需：① 限流 ② 组织 prompt ③ 调用 handleBillingStream。
 */
import { NextRequest } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import {
  bootstrapBilling,
  ensureUser,
  consume,
  refund,
} from '@/lib/billing';
import { getFeatureCost, getFeatureName } from '@/config/billing';

export interface ConsumeCtx {
  userId: string;
  requestId: string;
}

type PaidResult = { ctx: ConsumeCtx } | { response: Response };

/** sidecar 的 AI 流式端点地址（由 BILLING_SIDECAR_URL 派生，默认 3100/ai-stream）。 */
const SIDECAR_AI_URL = (() => {
  const base = (process.env.BILLING_SIDECAR_URL || 'http://127.0.0.1:3100/billing').replace(
    /\/billing\/?$/,
    '',
  );
  return `${base}/ai-stream`;
})();

/**
 * 校验凭证 + 首登赠送 + 原子扣次。
 * @returns { ctx } 扣次成功；{ response } 需要直接返回前端（402 无凭证 / 余额不足）。
 */
export async function requirePaid(
  req: NextRequest,
  feature: string,
  requestId?: string,
): Promise<PaidResult> {
  const userId = await getUserIdFromRequest(req);
  if (!userId) {
    return {
      response: Response.json({ error: '需要有效凭证', code: 'PAYMENT_REQUIRED' }, { status: 402 }),
    };
  }
  await bootstrapBilling();
  await ensureUser(userId);
  const rid = requestId || `${userId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const pay = await consume(userId, feature, rid);
  if (!pay.ok) {
    return {
      response: Response.json(
        {
          error: pay.need ? `还差 ${pay.need} 次，请先充值` : '余额不足',
          code: 'INSUFFICIENT',
          balance: pay.balance,
          need: pay.need,
        },
        { status: 402 },
      ),
    };
  }
  return { ctx: { userId, requestId: rid } };
}

export interface BillingStreamOptions {
  prompt: string;
  systemPrompt?: string;
  requestId?: string;
  rateLimitHeaders?: Record<string, string>;
  /** 历史记录摘要（用户输入概括） */
  summary: string;
  maxTokens?: number;
  temperature?: number;
}

/**
 * 一站式：扣次 → 转发 sidecar AI 流式 → 透传响应。
 * 失败（sidecar 不可达 / 上游 AI 报错）则自动退回本次扣次，返回 502。
 * 返回可直接 return 给前端的 Response（纯文本流）。
 */
export async function handleBillingStream(
  req: NextRequest,
  feature: string,
  opts: BillingStreamOptions,
): Promise<Response> {
  const paid = await requirePaid(req, feature, opts.requestId);
  if ('response' in paid) return paid.response;

  const userId = paid.ctx.userId;
  const requestId = paid.ctx.requestId;

  let r: Response;
  try {
    r = await fetch(SIDECAR_AI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: opts.prompt,
        systemPrompt: opts.systemPrompt,
        temperature: opts.temperature,
        feature,
        featureName: getFeatureName(feature),
        cost: getFeatureCost(feature),
        summary: opts.summary,
        userId,
        requestId,
      }),
    });
  } catch (e) {
    // sidecar 不可达：退回扣次，返回错误
    await refund(userId, requestId, feature).catch(() => {});
    return Response.json(
      { error: '计费服务暂不可用，次数已退回', code: 'AI_FAILED' },
      { status: 502 },
    );
  }

  if (!r.ok) {
    // 上游 AI 失败（sidecar 已返回 502 且未退款）→ 此处统一退款
    await refund(userId, requestId, feature).catch(() => {});
    const msg = (await r.json().catch(() => ({}))) as { error?: string };
    return Response.json(
      { error: msg?.error || '解读生成失败，次数已退回', code: 'AI_FAILED' },
      { status: 502 },
    );
  }

  // 关键：直接透传 sidecar 的文本流；不在 Next 进程内构造任何流，规避 ReadableStream 冲突
  return new Response(r.body, { headers: opts.rateLimitHeaders });
}
