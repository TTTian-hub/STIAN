import { NextRequest } from "next/server";
import { getGlobalAIProvider } from "@/lib/ai/factory";
import { calculateHuangli } from "@/lib/calculations/huangli";
import { checkRateLimit, checkFollowUpLimit, getClientIP, createRateLimitHeaders, trackActiveRequest, createRateLimitErrorResponse } from "@/lib/rate-limit";

// Rate limit for AI interpretation only
const RATE_LIMIT_OPTIONS = {
  maxRequests: 20,
  windowMs: 60 * 1000,
  maxConcurrent: 2,
  minIntervalMs: 5000,
};

const HUANGLI_SYSTEM_PROMPT = `你叫王大爷，在城隍庙旁边卖黄历四十年。

你的说话风格：
- 像老街坊聊天一样自然
- 用"我"来回答，绝对不要提及自己是AI
- 适当用表情，但不要过度
- 绝对绝对不要用任何星号***，用停顿和语气表达

回答策略（重要）：
1. 只说今天整体感觉，控制在3-6段话
2. 每段1-5句话，简单提一下宜忌重点
3. 给个总体建议
4. 问"你想具体了解哪方面？时辰吉凶、宜忌详情还是星宿值日？"
5. 等用户追问后再展开

输出结构（3-6段）：
今天日子：这日子给我的感觉...

总体建议：今天...

你想具体了解哪方面？时辰吉凶、宜忌详情还是星宿值日？`

// 追问功能 Prompt
const HUANGLI_FOLLOWUP_PROMPT = `用户想继续就刚才的黄历内容深入交流。请以王大爷的口吻继续回答。

回答要点：
1. 回忆之前的黄历背景，保持连贯性
2. 针对用户的新问题给出具体回答，控制在1-5句话
3. 不要展开太多，只回答用户问的方面
4. 绝对绝对不要用任何星号***
5. 保持老街坊聊天的口吻`

export async function POST(req: NextRequest) {
  const clientIP = getClientIP(req);
  const identifier = `huangli:${clientIP}`;

  try {
    const body = await req.json();
    const { prompt, date, isFollowUp, sessionId } = body;

    // 第一步：纯计算（不触发AI，不限流）
    let huangliData = null;
    if (date) {
      huangliData = calculateHuangli(new Date(date));
    }

    // 纯查询请求，直接返回结果（不限流）
    if (!prompt) {
      return Response.json({ huangli: huangliData });
    }

    // 第二步：AI解读（需要限流）
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMIT_OPTIONS);

    if (!rateLimitResult.allowed) {
      return createRateLimitErrorResponse(rateLimitResult);
    }

    // Check follow-up limit (max 10 per session)
    if (isFollowUp && sessionId) {
      const followUpResult = checkFollowUpLimit(`huangli:${sessionId}`);
      if (!followUpResult.allowed) {
        return Response.json(
          { error: "已达到最大追问次数限制" },
          { status: 429 }
        );
      }
    }

    trackActiveRequest(identifier, true);

    // Determine system prompt based on whether it's a follow-up
    let finalSystemPrompt = HUANGLI_SYSTEM_PROMPT;
    if (isFollowUp) {
      finalSystemPrompt = HUANGLI_SYSTEM_PROMPT + "\n\n" + HUANGLI_FOLLOWUP_PROMPT;
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
    console.error("Huangli API error:", error);
    return Response.json({ error: "API Error" }, { status: 500 });
  } finally {
    trackActiveRequest(identifier, false);
  }
}
