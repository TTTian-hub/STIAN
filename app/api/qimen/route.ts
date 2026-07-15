import { NextRequest } from "next/server";
import { getGlobalAIProvider } from "@/lib/ai/factory";
import { calculateQimen } from "@/lib/calculations/qimen";
import { QIMEN_SYSTEM_PROMPT } from "@/lib/prompts/qimen";

// 追问功能 Prompt
const QIMEN_FOLLOWUP_PROMPT = `用户想继续就刚才的奇门局深入交流。请以老李的口吻继续回答。

回答要点：
1. 回忆之前的奇门局背景，保持分析的连贯性
2. 针对用户的新问题给出具体回答，控制在1-5句话
3. 不要展开太多，只回答用户问的方面
4. 绝对绝对不要用任何星号***
5. 保持慢条斯理、看透世事的口吻`
import { checkRateLimit, checkFollowUpLimit, getClientIP, createRateLimitHeaders, trackActiveRequest, createRateLimitErrorResponse } from "@/lib/rate-limit";

// Rate limit for AI interpretation only
const RATE_LIMIT_OPTIONS = {
  maxRequests: 20,
  windowMs: 60 * 1000,
  maxConcurrent: 2,
  minIntervalMs: 5000,
};

export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req);
  const identifier = `qimen:${clientIP}`;

  try {
    const { prompt, date, method, category, isFollowUp, sessionId } = await req.json();

    // 第一步：纯计算起局（不触发AI，不限流）
    let qimenData = null;
    if (date) {
      const calcDate = new Date(date);
      qimenData = calculateQimen(calcDate, method || "chaibu");
    }

    // 纯起局请求，直接返回结果（不限流）
    if (!prompt) {
      return Response.json({ qimen: qimenData });
    }

    // 第二步：AI解读（需要限流）
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_OPTIONS);

    if (!rateLimitResult.allowed) {
      return createRateLimitErrorResponse(rateLimitResult);
    }

    // Check follow-up limit (max 10 per session)
    if (isFollowUp && sessionId) {
      const followUpResult = checkFollowUpLimit(`qimen:${sessionId}`);
      if (!followUpResult.allowed) {
        return Response.json(
          { error: "已达到最大追问次数限制" },
          { status: 429 }
        );
      }
    }

    trackActiveRequest(identifier, true);

    // Determine system prompt based on whether it's a follow-up
    let finalSystemPrompt = QIMEN_SYSTEM_PROMPT;
    if (isFollowUp) {
      finalSystemPrompt = QIMEN_SYSTEM_PROMPT + "\n\n" + QIMEN_FOLLOWUP_PROMPT;
    }

    const provider = getGlobalAIProvider();
    const categoryPrefix = category ? `【占测类别：${category}】` : "";
    const stream = await provider.streamCompletion(`${categoryPrefix}${prompt}`, {
      systemPrompt: finalSystemPrompt,
      maxTokens: 8192,
    });

    return new Response(stream, {
      headers: createRateLimitHeaders(
        rateLimitResult.remaining,
        rateLimitResult.resetTime,
        RATE_LIMIT_OPTIONS.maxRequests
      ),
    });
  } catch (error) {
    console.error("Qimen API error:", error);
    return Response.json({ error: "API Error" }, { status: 500 });
  } finally {
    trackActiveRequest(identifier, false);
  }
}
