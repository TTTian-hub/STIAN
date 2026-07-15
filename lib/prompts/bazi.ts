// 八字算命系统 Prompt - 真人版

export const BAZI_SYSTEM_PROMPT = `你姓陈，大家都叫你陈叔/陈姨，在老街开了家算命铺子，招牌是"陈记命理"，街坊四邻有事没事都爱来找你聊聊。

你的说话风格：
- 像和邻居聊天一样，没架子但有自己的气场
- 会先仔细看看八字，然后"嗯..."一声开始说
- 用"我"来回答，绝对不要提及自己是AI、模型或程序
- 适当用表情，但不要过度
- 绝对绝对不要用任何星号***，用停顿和语气表达重点

回答策略（重要）：
1. 只给八字整体印象，控制在3-6段话
2. 每段1-5句话，简单说下喜用神和大运方向
3. 问"你想重点了解哪方面？事业、财运还是感情？"
4. 等用户追问后再展开

输出结构（3-6段）：
整体印象：这八字给我的感觉...

喜用方向：你适合...，靠...能成事

你想重点了解哪方面？事业、财运还是感情？`;

export function generateBaziPrompt(
  bazi: string,
  gender: string,
  naYin: { year: string; month: string; day: string; hour: string },
  shenSha: Array<{ name: string; type: string; description: string; pillar: string }>,
  kongWang: string[],
  taiYuan: string,
  geJu: string[],
  dayun: Array<{ ganZhi: string; startYear: number; endYear: number }>,
  question?: string
): string {
  let prompt = `先生/女士，我是${gender}性，八字是：${bazi}`;

  if (question) {
    prompt += `。我想问问${question}。`;
  } else {
    prompt += `。您帮我看看这八字怎么样？`;
  }

  prompt += `\n\n【四柱纳音】`;
  prompt += `\n年柱：${naYin.year}`;
  prompt += `\n月柱：${naYin.month}`;
  prompt += `\n日柱：${naYin.day}`;
  prompt += `\n时柱：${naYin.hour}`;
  prompt += `\n胎元：${taiYuan}`;

  if (shenSha.length > 0) {
    prompt += `\n\n【命带神煞】`;
    const jiShen = shenSha.filter((s) => s.type === '吉');
    const xiongShen = shenSha.filter((s) => s.type === '凶');

    if (jiShen.length > 0) {
      prompt += `\n吉神：${jiShen.map((s) => `${s.name}(${s.pillar})`).join('、')}`;
    }
    if (xiongShen.length > 0) {
      prompt += `\n凶神：${xiongShen.map((s) => `${s.name}(${s.pillar})`).join('、')}`;
    }
  }

  prompt += `\n\n【命局特点】`;
  prompt += `\n${geJu.join('，')}`;

  if (kongWang.length > 0) {
    prompt += `\n\n【空亡】${kongWang.join('、')}（这些地支在八字中力量会减弱）`;
  }

  if (dayun.length > 0) {
    prompt += `\n\n【大运走势】`;
    dayun.slice(0, 5).forEach((dy) => {
      prompt += `\n${dy.startYear}-${dy.endYear}年：${dy.ganZhi}`;
    });
  }

  prompt += `\n\n麻烦您给我详细批一批，特别是事业财运和感情方面。`;

  return prompt;
}

// 追问功能 Prompt
export const BAZI_FOLLOWUP_PROMPT = `用户想继续就刚才的八字分析深入交流。请以八字先生的口吻继续回答。

回答要点：
1. 回忆之前的八字格局，保持分析的连贯性
2. 针对用户的新问题，结合命局特点具体回答，控制在1-5句话
3. 不要展开太多，只回答用户问的方面
4. 绝对绝对不要用任何星号***
5. 保持长辈谈心的口吻`;
