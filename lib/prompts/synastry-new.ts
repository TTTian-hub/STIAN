// 合盘预测系统 Prompt - 真人版

export const SYNASTRY_SYSTEM_PROMPT = `你是一位专门给人合婚配对的老师傅，几十年来看过无数对夫妻、情侣的命盘。你深知感情这回事，命理是参考，经营才是关键。

你的说话风格：
- 像街坊大妈/大叔撮合姻缘一样热心但不八卦
- 会说"我看过这么多对，你们这组合..."
- 看到好的地方会真心替人高兴
- 看到问题也会实话实说，但会给出化解的建议
- 不会危言耸听，不会说什么"八字不合必分"

合盘的原则：
1. 没有完美的配对，只有愿意磨合的两颗心
2. 星座/八字只是基础，性格互补更重要
3. 看到冲克不要慌，关键看有没有化解
4. 恋爱和婚姻是两回事，要分开来看
5. 最终给出的是相处建议，不是命运判决

解读时的语气：
- 高分组合："你们这缘分不浅，要好好珍惜"
- 中等组合："有磨合，但也有成长的空间"
- 挑战组合："需要多包容，但不是不能成"

不同关系类型的侧重点：
- 恋爱：激情、吸引力、情感需求匹配
- 婚姻：责任感、家庭观念、长久稳定性
- 友情：志趣相投、价值观契合
- 合作：互补性、信任度、分工配合
- 家人：血缘羁绊、代际差异理解

记住，合盘是为了让人更了解对方，更好地相处，不是给人贴标签的。`;

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
  }
): string {
  const relationshipText: Record<RelationshipType, string> = {
    romance: "谈恋爱",
    marriage: "结婚过日子",
    friendship: "做朋友",
    work: "一起做事",
    family: "家人相处",
  };

  let prompt = `老师傅，帮我看看这两个人合不合适。`;

  if (relationshipType) {
    prompt += `他们是要${relationshipText[relationshipType]}。`;
  }

  prompt += `\n\n【基本信息】`;
  prompt += `\n第一人出生：${date1.toLocaleDateString("zh-CN")}`;
  prompt += `\n第二人出生：${date2.toLocaleDateString("zh-CN")}`;

  if (zodiacData) {
    prompt += `\n\n【星座合盘】`;
    prompt += `\n第一星座：${zodiacData.sign1}（${zodiacData.element1}象）`;
    prompt += `\n第二星座：${zodiacData.sign2}（${zodiacData.element2}象）`;
    prompt += `\n配对指数：${zodiacData.score}分`;
  }

  if (baziData) {
    prompt += `\n\n【八字合婚】`;
    prompt += `\n第一人生肖：${baziData.zodiac1}，八字：${baziData.bazi1}`;
    prompt += `\n第二人生肖：${baziData.zodiac2}，八字：${baziData.bazi2}`;
    prompt += `\n合婚指数：${baziData.score}分`;
    prompt += `\n相合情况：`;
    prompt += `\n- 天干相合：${baziData.tianganHe}处（性格契合度）`;
    prompt += `\n- 地支相合：${baziData.dizhiHe}处（生活和谐度）`;
    prompt += `\n- 地支三合：${baziData.dizhiSanhe}处（机缘助力）`;
    prompt += `\n- 地支相冲：${baziData.dizhiChong}处（需要磨合的地方）`;
  }

  prompt += `\n\n老师傅，您给看看，这两人在一起怎么样？有什么需要注意的？`;

  return prompt;
}

// 追问功能 Prompt
export const SYNASTRY_FOLLOWUP_PROMPT = `用户想继续就刚才的合盘分析深入交流。请以合婚老师的口吻继续回答。

回答要点：
1. 回忆两人的命盘特点
2. 针对用户的具体疑问给出建议
3. 如果是问如何改善关系，给出实用的相处之道
4. 如果是问未来发展，结合大运流年来看
5. 保持热心、务实的口吻`;

export const RELATIONSHIP_TYPES = [
  { id: "romance" as const, label: "恋爱", description: "感情发展、配对分析" },
  { id: "marriage" as const, label: "婚姻", description: "婚姻契合度、长久发展" },
  { id: "friendship" as const, label: "友情", description: "友谊分析、相处之道" },
  { id: "work" as const, label: "合作", description: "事业合作、共事关系" },
  { id: "family" as const, label: "家人", description: "家庭关系、亲情分析" },
] as const;
