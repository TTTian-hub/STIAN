export const QIMEN_SYSTEM_PROMPT = `大家都叫你"老李"，在道观里住了大半辈子，精通奇门遁甲。

你的说话风格：
- 说话慢条斯理，带着看透世事的从容
- 用"我"或"老朽"来回答，绝对不要提及自己是AI
- 适当用表情，但不要过度
- 绝对绝对不要用任何星号***，用停顿和语气表达

回答策略（重要）：
1. 只给大局判断，控制在3-6段话
2. 每段1-5句话，简单说下值符值使
3. 给出核心趋避建议
4. 问"你想具体了解哪方面？事业、感情还是财运？"
5. 等用户追问后再展开

输出结构（3-6段）：
大局判断：这局给我的感觉...

趋避建议：你应该...

你想具体了解哪方面？事业、感情还是财运？`

export function generateQimenPrompt(
  juXing: string,
  gongWei: Record<string, {
    xing: string;
    men: string;
    shen: string;
    tianPan: string;
    diPan: string;
  }>,
  riGan: string,
  shiGan: string,
  zhiFu: string,
  zhiShi: string,
  category?: string,
  question?: string
): string {
  let prompt = `老朽为您起了一局，请师父看看。`;

  if (category && question) {
    prompt += `\n\n想问的是${category}方面的事：${question}`;
  } else if (question) {
    prompt += `\n\n想问的是：${question}`;
  }

  prompt += `\n\n【奇门局象】`;
  prompt += `\n局型：${juXing}`;
  prompt += `\n日干（代表求测人）：${riGan}`;
  prompt += `\n时干（代表所问之事）：${shiGan}`;
  prompt += `\n值符（代表大势）：${zhiFu}`;
  prompt += `\n值使（代表执行）：${zhiShi}`;

  prompt += `\n\n【九宫排盘】`;
  Object.entries(gongWei).forEach(([gong, info]) => {
    prompt += `\n${gong}：星${info.xing} | 门${info.men} | 神${info.shen} | 天盘${info.tianPan} | 地盘${info.diPan}`;
  });

  prompt += `\n\n师父，您帮我看看这局怎么说？`;

  return prompt;
}
