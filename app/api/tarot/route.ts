import { NextRequest } from "next/server";
import { getGlobalAIProvider } from "@/lib/ai/factory";
import { TAROT_SYSTEM_PROMPT, TAROT_FOLLOWUP_PROMPT } from "@/lib/prompts/tarot";
import { checkRateLimit, checkFollowUpLimit, getClientIP, createRateLimitHeaders, trackActiveRequest, createRateLimitErrorResponse } from "@/lib/rate-limit";

// Strict rate limit: 5 requests per minute per IP, max 1 concurrent
const RATE_LIMIT_OPTIONS = {
  maxRequests: 5,
  windowMs: 60 * 1000,
  maxConcurrent: 1,
  minIntervalMs: 3000,
};

export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req);
  const identifier = `tarot:${clientIP}`;

  try {
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
      const followUpResult = checkFollowUpLimit(`tarot:${sessionId}`);
      if (!followUpResult.allowed) {
        return Response.json(
          { error: "已达到最大追问次数限制" },
          { status: 429 }
        );
      }
    }

    trackActiveRequest(identifier, true);

    // Determine system prompt based on whether it's a follow-up
    let finalSystemPrompt = TAROT_SYSTEM_PROMPT;
    if (isFollowUp) {
      finalSystemPrompt = TAROT_SYSTEM_PROMPT + "\n\n" + TAROT_FOLLOWUP_PROMPT;
    }

    const provider = getGlobalAIProvider();
    const stream = await provider.streamCompletion(prompt, {
      systemPrompt: finalSystemPrompt,
      temperature: 0.7,
      maxTokens: 8192,
    });

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
    console.error("Tarot API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  } finally {
    trackActiveRequest(identifier, false);
  }
}
