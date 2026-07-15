import { NextRequest } from 'next/server';
import { getGlobalAIProvider } from '@/lib/ai/factory';
import { checkRateLimit, getClientIP, createRateLimitHeaders } from '@/lib/rate-limit';

// Rate limit: 10 requests per minute per IP
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    // Check rate limit
    const clientIP = getClientIP(req);
    const rateLimitResult = checkRateLimit(`ai-complete:${clientIP}`, {
      maxRequests: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });

    const headers = createRateLimitHeaders(
      rateLimitResult.remaining,
      rateLimitResult.resetTime,
      RATE_LIMIT_MAX
    );

    if (!rateLimitResult.allowed) {
      return Response.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429, headers }
      );
    }

    const { prompt, systemPrompt } = await req.json();

    if (!prompt) {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400, headers }
      );
    }

    const provider = getGlobalAIProvider();
    const text = await provider.complete(prompt, {
      systemPrompt: systemPrompt || '你是一个专业的AI占卜师，擅长解读星座、塔罗、八字等命理知识。请用温和、积极的语气回答用户的问题。',
      temperature: 0.7,
      maxTokens: 2048,
    });

    return Response.json({ text }, { headers });

  } catch (error) {
    console.error('AI complete error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return Response.json({ error: message }, { status: 500 });
  }
}
