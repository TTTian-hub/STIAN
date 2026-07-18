import { NextRequest } from 'next/server';
import { getGlobalAIProvider } from '@/lib/ai/factory';
import { checkRateLimit, getClientIP, createRateLimitHeaders } from '@/lib/rate-limit';
import { getUserIdFromRequest } from '@/lib/auth';
import { bootstrapBilling, ensureUser, consume, refund, saveHistory } from '@/lib/billing';

// Rate limit: 10 requests per minute per IP（与 /api/ai/complete 一致）
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

interface ReadingJSON {
  label: string;
  title: string;
  main: string;
  suitable: string;
  notice: string;
  action: string;
}

const SYSTEM_PROMPT = `你是一位温柔而富有洞察力的 AI 占卜师，融合东方命理、塔罗与星象的智慧。请用中文回复，语气温暖、积极、不迷信恐吓。你必须且只能返回一个 JSON 对象，不要包含任何额外文字、解释或 markdown 代码块标记。JSON 结构如下：
{
  "label": "给这封回信的简短标签，例如『塔罗映照 · 事业与选择』",
  "title": "标题，固定为『给此刻的你』",
  "main": "120-200 字的个性化解读正文，温暖、具体、有画面感，像朋友在轻声说话",
  "suitable": "『今天适合』的具体建议（一句话）",
  "notice": "『值得留意』的温柔提醒（一句话）",
  "action": "『小小行动』可执行的小步骤（一句话）"
}`;

function tryJson(raw: string): Record<string, unknown> | null {
  try {
    return JSON.parse(raw.trim());
  } catch {
    return null;
  }
}

function normalize(obj: Record<string, unknown>): ReadingJSON {
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
  const main = str(obj.main);
  return {
    label: str(obj.label),
    title: str(obj.title) || '给此刻的你',
    main: main || str(obj.text) || '',
    suitable: str(obj.suitable),
    notice: str(obj.notice),
    action: str(obj.action),
  };
}

function parseReading(raw: string): ReadingJSON {
  if (!raw) {
    return { label: '', title: '给此刻的你', main: '', suitable: '', notice: '', action: '' };
  }
  // 1) 直接 JSON
  const direct = tryJson(raw);
  if (direct && typeof direct === 'object') return normalize(direct);
  // 2) 提取 ```json ... ``` 代码块
  const fence = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    const fenced = tryJson(fence[1]);
    if (fenced && typeof fenced === 'object') return normalize(fenced);
  }
  // 3) 兜底：整段作为正文
  return { label: '', title: '给此刻的你', main: raw.trim(), suitable: '', notice: '', action: '' };
}

export async function POST(req: NextRequest) {
  try {
    const clientIP = getClientIP(req);
    const rateLimitResult = checkRateLimit(`reading:${clientIP}`, {
      maxRequests: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });
    const headers = createRateLimitHeaders(
      rateLimitResult.remaining,
      rateLimitResult.resetTime,
      RATE_LIMIT_MAX,
    );
    if (!rateLimitResult.allowed) {
      return Response.json(
        { error: '请求过于频繁，请稍后再试。' },
        { status: 429, headers },
      );
    }

    const body = await req.json();
    const { intent, method, theme, name, question, request_id } = body as {
      intent?: string;
      method?: string;
      theme?: string;
      name?: string;
      question?: string;
      request_id?: string;
    };

    if (!question || !question.trim()) {
      return Response.json(
        { error: '请先写下你的问题' },
        { status: 400, headers },
      );
    }

    // 服务端余额校验 + 原子扣次（幂等 request_id）
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return Response.json({ error: '需要有效凭证', code: 'PAYMENT_REQUIRED' }, { status: 402, headers });
    }
    await bootstrapBilling();
    await ensureUser(userId);
    const rid = request_id || `${userId}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    const pay = await consume(userId, 'reading', rid);
    if (!pay.ok) {
      return Response.json(
        { error: pay.need ? `还差 ${pay.need} 次，请先充值` : '余额不足', code: 'INSUFFICIENT', balance: pay.balance, need: pay.need },
        { status: 402, headers },
      );
    }

    const userPrompt = `用户选择的意图方向：${intent || '未指定'}
选择的解读方式：${method || 'AI 心语'}
关注的关键词：${theme || '未指定'}
称呼：${name || '朋友'}
用户此刻的问题：${question}
请生成符合上述结构的 JSON 回信。`;

    const provider = getGlobalAIProvider();
    let text: string;
    try {
      text = await provider.complete(userPrompt, {
        systemPrompt: SYSTEM_PROMPT,
        temperature: 0.8,
        maxTokens: 1200,
      });
    } catch (aiErr) {
      // AI 失败：自动退回次数，写退款流水
      await refund(userId, rid, 'reading');
      console.error('Reading AI failed, refunded:', aiErr);
      return Response.json({ error: '解读生成失败，次数已退回', code: 'AI_FAILED' }, { status: 502, headers });
    }

    const reading = parseReading(text);
    // 若模型未给出标签，用前端传入的 method/theme 兜底
    if (!reading.label) {
      reading.label = [method, theme].filter(Boolean).join(' · ') || '宇宙回信';
    }

    // 保存历史（不阻塞响应）
    try {
      await saveHistory({
        user_id: userId,
        feature: 'reading',
        feature_name: '宇宙回信',
        summary: `方式：${method || 'AI 心语'}｜关键词：${theme || '-'}｜问题：${question}`,
        result: reading,
        ai_text: reading.main,
        cost: 1,
        request_id: rid,
        created_at: Date.now(),
      });
    } catch (e) {
      console.error('saveHistory failed:', e);
    }

    return Response.json({ ...reading, balance: pay.balance, requestId: rid }, { headers });
  } catch (error) {
    console.error('Reading error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
