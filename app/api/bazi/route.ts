import { NextRequest } from "next/server";
import { getGlobalAIProvider } from "@/lib/ai/factory";
import { calculateBazi } from "@/lib/calculations/bazi";
import { calculateBaziShishen } from "@/lib/calculations/shishen";
import { countWuxing } from "@/lib/calculations/wuxing";
import { calculateDayun } from "@/lib/calculations/dayun";
import { BAZI_SYSTEM_PROMPT, BAZI_FOLLOWUP_PROMPT } from "@/lib/prompts/bazi";
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
  const identifier = `bazi:${clientIP}`;

  try {
    const { prompt, name, birthDate, birthTime, gender, isEarlyZi, timeUnknown } = await req.json();

    // 第一步：纯计算排盘（不触发AI，不限流）
    let baziData = null;
    if (birthDate) {
      const date = new Date(birthDate);
      // 如果时间不确定，使用 -1 表示不计算时柱
      const totalHour = birthTime ? (() => {
        const hour = parseInt(birthTime.split(":")[0]);
        const minute = parseInt(birthTime.split(":")[1]);
        return hour + minute / 60;
      })() : -1;

      baziData = calculateBazi(date, totalHour, isEarlyZi ?? true, timeUnknown);

      // Calculate additional analysis
      const shishen = calculateBaziShishen(baziData);
      const wuxing = countWuxing(baziData);
      const dayun = calculateDayun(
        baziData.lunarYear,
        baziData.lunarMonth,
        baziData.lunarDay,
        gender || "male"
      );

      // 将 Date 对象转换为字符串，避免客户端序列化问题
      baziData = {
        ...baziData,
        solar: baziData.solar.toISOString(),
        shishen,
        wuxing,
        dayun,
      };
    }

    // 纯排盘请求，直接返回结果（不限流）
    if (!prompt) {
      return Response.json({ bazi: baziData });
    }

    // 第二步：AI解读（需要限流）
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_OPTIONS);

    if (!rateLimitResult.allowed) {
      return createRateLimitErrorResponse(rateLimitResult);
    }

    const { isFollowUp, sessionId } = await req.json().catch(() => ({})) || {};

    // Check follow-up limit (max 10 per session)
    if (isFollowUp && sessionId) {
      const followUpResult = checkFollowUpLimit(`bazi:${sessionId}`);
      if (!followUpResult.allowed) {
        return Response.json(
          { error: "已达到最大追问次数限制" },
          { status: 429 }
        );
      }
    }

    trackActiveRequest(identifier, true);

    // Determine system prompt based on whether it's a follow-up
    let finalSystemPrompt = BAZI_SYSTEM_PROMPT;
    if (isFollowUp) {
      finalSystemPrompt = BAZI_SYSTEM_PROMPT + "\n\n" + BAZI_FOLLOWUP_PROMPT;
    }

    const provider = getGlobalAIProvider();
    const stream = await provider.streamCompletion(prompt, {
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
    console.error("Bazi API error:", error);
    return Response.json({ error: "API Error" }, { status: 500 });
  } finally {
    trackActiveRequest(identifier, false);
  }
}
