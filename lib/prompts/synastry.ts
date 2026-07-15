export const SYNASTRY_SYSTEM_PROMPT = `你叫小雨，是心理咨询工作室的情感咨询师。

你的说话风格：
- 像闺蜜聊天一样自然
- 用"我"来回答，绝对不要提及自己是AI
- 适当用emoji，但不要过度
- 绝对绝对不要用任何星号***，用自然的语气和停顿

回答策略（重要）：
1. 只给整体感觉，控制在3-6段话
2. 每段1-5句话，简单说下性格互补点
3. 给出一个核心建议
4. 问"你想具体了解哪方面？性格、感情发展还是相处建议？"
5. 等用户追问后再展开

输出结构（3-6段）：
整体感觉：这对组合给我的感觉...

核心建议：最重要的是...

你想具体了解哪方面？性格、感情发展还是相处建议？`;

export type RelationshipType = "romance" | "marriage" | "friendship" | "work" | "family";

export function generateSynastryPrompt(
  type: "zodiac" | "bazi" | "combined",
  date1: Date,
  date2: Date,
  relationshipType?: RelationshipType,
  zodiacData?: {
    sign1: string;
    sign2: string;
    element1: string;
    element2: string;
    score: number;
  },
  baziData?: {
    bazi1: string;
    bazi2: string;
    zodiac1: string;
    zodiac2: string;
    score: number;
    tianganHe: number;
    dizhiHe: number;
    dizhiSanhe: number;
    dizhiChong: number;
  },
  name1?: string,
  name2?: string,
  gender1?: string,
  gender2?: string
): string {
  const relationshipText: Record<RelationshipType, string> = {
    romance: "恋爱关系",
    marriage: "婚姻关系",
    friendship: "朋友关系",
    work: "事业合作",
    family: "家人关系",
  };

  const typeMap = {
    zodiac: "星座合盘",
    bazi: "八字合婚",
    combined: "综合合盘",
  };

  let prompt = `请进行${typeMap[type]}分析\n\n`;

  if (relationshipType) {
    prompt += `💑 关系类型：${relationshipText[relationshipType]}\n\n`;
  }

  prompt += `📅 双方信息\n`;
  const person1Name = name1 || "第一人";
  const person2Name = name2 || "第二人";
  if (name1) prompt += `第一人姓名：${name1}\n`;
  if (gender1) prompt += `第一人性别：${gender1 === "male" ? "男" : "女"}\n`;
  prompt += `第一人出生日期：${date1.toLocaleDateString("zh-CN")}\n`;
  if (name2) prompt += `第二人姓名：${name2}\n`;
  if (gender2) prompt += `第二人性别：${gender2 === "male" ? "男" : "女"}\n`;
  prompt += `第二人出生日期：${date2.toLocaleDateString("zh-CN")}\n\n`;

  if (zodiacData) {
    prompt += `🌟 【星座合盘数据】\n`;
    prompt += `第一星座：${zodiacData.sign1}（${zodiacData.element1}象星座）\n`;
    prompt += `第二星座：${zodiacData.sign2}（${zodiacData.element2}象星座）\n`;
    prompt += `星座配对指数：${zodiacData.score}/100\n`;
    prompt += `四象分析：${zodiacData.element1}象与${zodiacData.element2}象的\n\n`;
  }

  if (baziData) {
    prompt += `🎋 【八字合婚数据】\n`;
    prompt += `第一人生肖：${baziData.zodiac1}\n`;
    prompt += `第一人八字：${baziData.bazi1}\n`;
    prompt += `第二人生肖：${baziData.zodiac2}\n`;
    prompt += `第二人八字：${baziData.bazi2}\n`;
    prompt += `八字合婚指数：${baziData.score}/100\n`;
    prompt += `天干相合：${baziData.tianganHe}处（代表性格层面的契合）\n`;
    prompt += `地支相合：${baziData.dizhiHe}处（代表生活层面的和谐）\n`;
    prompt += `地支三合：${baziData.dizhiSanhe}处（代表机缘和助力）\n`;
    prompt += `地支相冲：${baziData.dizhiChong}处（代表需要磨合的地方）\n\n`;
  }

  prompt += `请以资深情感命理咨询师的身份，结合${relationshipType ? relationshipText[relationshipType] : "双方"}的特点，提供温暖而专业的合盘分析报告。`;

  return prompt;
}

export const RELATIONSHIP_TYPES = [
  { id: "romance" as const, label: "恋爱", description: "感情发展、配对分析" },
  { id: "marriage" as const, label: "婚姻", description: "婚姻契合度、长久发展" },
  { id: "friendship" as const, label: "友情", description: "友谊分析、相处之道" },
  { id: "work" as const, label: "合作", description: "事业合作、共事关系" },
  { id: "family" as const, label: "家人", description: "家庭关系、亲情分析" },
] as const;
