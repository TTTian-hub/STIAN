import { NextRequest } from "next/server";
import { getGlobalAIProvider } from "@/lib/ai/factory";
import { calculateSynastry } from "@/lib/calculations";
import {
  SYNASTRY_SYSTEM_PROMPT,
  generateSynastryPrompt,
  RelationshipType,
} from "@/lib/prompts/synastry";

// 追问功能 Prompt
const SYNASTRY_FOLLOWUP_PROMPT = `用户想继续就刚才的合盘分析深入交流。请以情感咨询师小雨的口吻继续回答。

回答要点：
1. 回忆之前的合盘背景，保持分析的连贯性
2. 针对用户的新问题给出具体回答，控制在1-5句话
3. 不要展开太多，只回答用户问的方面
4. 绝对绝对不要用任何星号***
5. 保持闺蜜聊天的口吻`
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
  const identifier = `synastry:${clientIP}`;

  try {
    const body = await req.json();
    const { date1, date2, type, relationshipType, hour1, hour2, prompt, name1, name2, gender1, gender2, isFollowUp, sessionId } = body;

    // 如果是AI解读请求（有prompt），需要限流
    if (prompt) {
      const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_OPTIONS);

      if (!rateLimitResult.allowed) {
        return createRateLimitErrorResponse(rateLimitResult);
      }

      // Check follow-up limit (max 10 per session)
      if (isFollowUp && sessionId) {
        const followUpResult = checkFollowUpLimit(`synastry:${sessionId}`);
        if (!followUpResult.allowed) {
          return Response.json(
            { error: "已达到最大追问次数限制" },
            { status: 429 }
          );
        }
      }

      trackActiveRequest(identifier, true);

      try {
        // Determine system prompt based on whether it's a follow-up
        let finalSystemPrompt = SYNASTRY_SYSTEM_PROMPT;
        if (isFollowUp) {
          finalSystemPrompt = SYNASTRY_SYSTEM_PROMPT + "\n\n" + SYNASTRY_FOLLOWUP_PROMPT;
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
      } finally {
        trackActiveRequest(identifier, false);
      }
    }

    // Validate required fields
    if (!date1 || !date2 || !type) {
      return Response.json(
        { error: "Missing required fields: date1, date2, type" },
        { status: 400 }
      );
    }

    // Parse dates
    const birthDate1 = new Date(date1);
    const birthDate2 = new Date(date2);

    if (isNaN(birthDate1.getTime()) || isNaN(birthDate2.getTime())) {
      return Response.json({ error: "Invalid date format" }, { status: 400 });
    }

    // Calculate synastry
    const synastryResult = calculateSynastry(
      birthDate1,
      birthDate2,
      type,
      hour1,
      hour2
    );

    // Generate prompt with calculated data
    const generatedPrompt = generateSynastryPrompt(
      type,
      birthDate1,
      birthDate2,
      relationshipType as RelationshipType,
      synastryResult.zodiac
        ? {
            sign1: synastryResult.zodiac.sign1,
            sign2: synastryResult.zodiac.sign2,
            element1: synastryResult.zodiac.element1,
            element2: synastryResult.zodiac.element2,
            score: synastryResult.zodiac.score,
          }
        : undefined,
      synastryResult.bazi
        ? {
            bazi1: synastryResult.bazi.bazi1,
            bazi2: synastryResult.bazi.bazi2,
            zodiac1: synastryResult.bazi.zodiac1,
            zodiac2: synastryResult.bazi.zodiac2,
            score: synastryResult.bazi.score,
            tianganHe: synastryResult.bazi.tianganHe,
            dizhiHe: synastryResult.bazi.dizhiHe,
            dizhiSanhe: synastryResult.bazi.dizhiSanhe,
            dizhiChong: synastryResult.bazi.dizhiChong,
          }
        : undefined,
      name1,
      name2,
      gender1,
      gender2
    );

    // Return both the calculation result and the generated prompt (纯计算，不限流)
    return Response.json({
      success: true,
      data: synastryResult,
      prompt: generatedPrompt,
    });
  } catch (error) {
    console.error("Synastry API error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
