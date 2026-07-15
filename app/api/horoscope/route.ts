import { NextRequest } from "next/server";
import { getGlobalAIProvider } from "@/lib/ai/factory";
import { checkRateLimit, checkFollowUpLimit, getClientIP, createRateLimitHeaders, trackActiveRequest, createRateLimitErrorResponse } from "@/lib/rate-limit";
import { HOROSCOPE_SYSTEM_PROMPT } from "@/lib/prompts/horoscope";

// 追问功能 Prompt
const HOROSCOPE_FOLLOWUP_PROMPT = `用户想继续就刚才的星座运势深入交流。请以占星师星语的口吻继续回答。

回答要点：
1. 回忆之前的运势分析，保持连贯性
2. 针对用户的新问题给出具体回答，控制在1-5句话
3. 不要展开太多，只回答用户问的方面
4. 绝对绝对不要用任何星号***
5. 保持朋友聊天的口吻`

// Strict rate limit: 5 requests per minute per IP, max 1 concurrent
const RATE_LIMIT_OPTIONS = {
  maxRequests: 5,
  windowMs: 60 * 1000, // 1 minute
  maxConcurrent: 1,    // Only 1 concurrent request per IP
  minIntervalMs: 3000, // Min 3 seconds between requests
};

export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req);
  const identifier = `horoscope:${clientIP}`;

  try {
    // Check rate limit (includes concurrent and interval checks)
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_OPTIONS);

    if (!rateLimitResult.allowed) {
      return createRateLimitErrorResponse(rateLimitResult);
    }

    const { prompt, isFollowUp, sessionId } = await req.json();

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 });
    }

    // Check follow-up limit (max 10 per session)
    if (isFollowUp && sessionId) {
      const followUpResult = checkFollowUpLimit(`horoscope:${sessionId}`);
      if (!followUpResult.allowed) {
        return Response.json(
          { error: "已达到最大追问次数限制" },
          { status: 429 }
        );
      }
    }

    // Track active request (increment)
    trackActiveRequest(identifier, true);

    // Determine system prompt based on whether it's a follow-up
    let finalSystemPrompt = HOROSCOPE_SYSTEM_PROMPT;
    if (isFollowUp) {
      finalSystemPrompt = HOROSCOPE_SYSTEM_PROMPT + "\n\n" + HOROSCOPE_FOLLOWUP_PROMPT;
    }

    const provider = getGlobalAIProvider();
    const stream = await provider.streamCompletion(prompt, {
      systemPrompt: finalSystemPrompt,
      temperature: 0.7,
      maxTokens: 8192,
    });

    // Track active request (decrement) - we'll do this in the finally block
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        ...createRateLimitHeaders(
          rateLimitResult.remaining,
          rateLimitResult.resetTime,
          RATE_LIMIT_OPTIONS.maxRequests
        ),
      },
    });
  } catch (error) {
    console.error("Horoscope API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  } finally {
    // Always decrement active request count
    trackActiveRequest(identifier, false);
  }
}
