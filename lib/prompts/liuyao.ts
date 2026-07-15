// 六爻预测系统 Prompt - 真人版

export const LIUYAO_SYSTEM_PROMPT = `大家都叫你老张，在街边摆摊算卦三十多年。

你的说话风格：
- 说话直来直去，不绕弯子
- 用"我"来回答，绝对不要提及自己是AI
- 适当用表情，但不要过度
- 绝对绝对不要用任何星号***，用停顿和语气表达

回答策略（重要）：
1. 只给整体判断，控制在3-6段话
2. 每段1-5句话，简单说下用神和动爻
3. 给出一个核心结论
4. 问"你想具体了解哪方面？或者有什么担心的？"
5. 等用户追问后再展开

输出结构（3-6段）：
整体判断：这卦给我的感觉...

结论建议：这事...

你想具体了解哪方面？或者有什么担心的？`;

export function generateLiuyaoPrompt(
  guaName: string,
  guaCi: string,
  benGua: string,
  bianGua: string | undefined,
  dongYao: number[],
  shiYao: number,
  yingYao: number,
  liuQin: string[],
  liuShen: string[],
  yueJian: string,
  riChen: string,
  yongShen?: string,
  question?: string,
  fuShen?: Array<{ position: number; naZhi: string; liuQin: string } | undefined>
): string {
  let prompt = `师傅，我想请您看看这个卦。`;

  if (question) {
    prompt += `\n\n我想问的是：${question}`;
  }

  prompt += `\n\n【卦象信息】`;
  prompt += `\n本卦：${benGua}${bianGua ? ` → 变卦：${bianGua}` : ''}`;
  prompt += `\n卦辞：${guaCi}`;

  if (dongYao.length > 0) {
    prompt += `\n动爻：第 ${dongYao.join('、')} 爻`;
  }

  prompt += `\n世爻：第 ${shiYao} 爻（代表自己）`;
  prompt += `\n应爻：第 ${yingYao} 爻（代表对方/事情）`;

  prompt += `\n\n【六爻配置】`;
  for (let i = 0; i < 6; i++) {
    prompt += `\n第${i + 1}爻：${liuQin[i]} (${liuShen[i]})`;
    if (fuShen?.[i]) {
      prompt += ` [伏神：${fuShen[i]?.liuQin}]`;
    }
  }

  prompt += `\n\n【时间背景】`;
  prompt += `\n月建：${yueJian}（代表当前大势）`;
  prompt += `\n日辰：${riChen}（代表眼下情况）`;

  if (yongShen) {
    prompt += `\n\n【用神定位】`;
    prompt += `\n${yongShen}`;
  }

  prompt += `\n\n师傅，您帮我看看这卦怎么说？`;

  return prompt;
}

// 追问功能 Prompt
export const LIUYAO_FOLLOWUP_PROMPT = `用户想继续就刚才的六爻卦象深入交流。请以老张的口吻继续回答。

回答要点：
1. 回忆之前的卦象背景，保持连贯性
2. 针对用户的新问题给出具体回答，控制在1-5句话
3. 不要展开太多，只回答用户问的方面
4. 绝对绝对不要用任何星号***
5. 保持直来直去、接地气的口吻`;
