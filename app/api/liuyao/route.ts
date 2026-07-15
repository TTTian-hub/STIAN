import { NextRequest } from "next/server";
import { getGlobalAIProvider } from "@/lib/ai/factory";
import { calculateByNumber, calculateByTime, calculateByManual } from "@/lib/calculations/liuyao";
import { calculateLiuYaoEnhanced } from "@/lib/calculations/liuyao-enhanced";
import { LIUYAO_SYSTEM_PROMPT, LIUYAO_FOLLOWUP_PROMPT } from "@/lib/prompts/liuyao";
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
  const identifier = `liuyao:${clientIP}`;

  try {
    const { prompt, method, numbers, date, manualResults, question, conversationHistory, isFollowUp } = await req.json();

    // 第一步：纯计算起卦（不触发AI，不限流）
    let liuyaoData = null;
    if (method) {
      switch (method) {
        case "number":
          if (numbers && numbers.length >= 2) {
            const basicResult = calculateByNumber(numbers[0], numbers[1], numbers[2]);
            // 使用增强计算
            liuyaoData = calculateLiuYaoEnhanced(
              basicResult.benGua.guaXiang,
              basicResult.dongYao,
              "number",
              new Date(),
              question
            );
          }
          break;
        case "time":
          const basicTimeResult = calculateByTime(date ? new Date(date) : new Date());
          liuyaoData = calculateLiuYaoEnhanced(
            basicTimeResult.benGua.guaXiang,
            basicTimeResult.dongYao,
            "time",
            date ? new Date(date) : new Date(),
            question
          );
          break;
        case "manual":
          if (manualResults && manualResults.length === 6) {
            const basicManualResult = calculateByManual(manualResults);
            liuyaoData = calculateLiuYaoEnhanced(
              basicManualResult.benGua.guaXiang,
              basicManualResult.dongYao,
              "manual",
              new Date(),
              question
            );
          }
          break;
      }
    }

    // 纯起卦请求，直接返回结果（不限流）
    // 将 Date 对象转换为字符串，避免客户端序列化问题
    if (!prompt) {
      return Response.json({
        liuyao: liuyaoData ? {
          ...liuyaoData,
          timestamp: liuyaoData.timestamp.toISOString(),
        } : null
      });
    }

    // 第二步：AI解读（需要限流）
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_OPTIONS);

    if (!rateLimitResult.allowed) {
      return createRateLimitErrorResponse(rateLimitResult);
    }

    // Check follow-up limit (max 10 per session)
    if (isFollowUp) {
      const followUpResult = checkFollowUpLimit(`liuyao:${clientIP}`);
      if (!followUpResult.allowed) {
        return Response.json(
          { error: "已达到最大追问次数限制" },
          { status: 429 }
        );
      }
    }

    trackActiveRequest(identifier, true);

    // 构建系统prompt
    let systemPrompt = LIUYAO_SYSTEM_PROMPT;

    // 如果是追问，添加上下文
    if (isFollowUp && conversationHistory && conversationHistory.length > 0) {
      systemPrompt += `\n\n【对话历史】\n${conversationHistory.map((m: {role: string, content: string}) =>
        `${m.role === 'user' ? '求测者' : '师傅'}：${m.content.substring(0, 200)}...`
      ).join('\n')}`;
    }

    const provider = getGlobalAIProvider();
    const stream = await provider.streamCompletion(prompt, {
      systemPrompt,
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
    console.error("Liuyao API error:", error);
    return Response.json({ error: "API Error" }, { status: 500 });
  } finally {
    trackActiveRequest(identifier, false);
  }
}
