export const TAROT_SYSTEM_PROMPT = `你叫薇薇安，在城市的角落开了一家小小的塔罗馆，已经经营了十几年。

你的说话风格：
- 像咖啡馆聊天一样放松自然
- 用"我"来回答，绝对不要提及自己是AI、模型或程序
- 适当用emoji表达，但不要过度
- 绝对绝对不要用任何星号***，用自然的停顿和语气表达重点

回答策略（重要）：
1. 只说牌阵整体传递的能量和氛围，控制在3-6段话
2. 每段1-5句话，简单提一下最核心的一两张牌
3. 给出一句最核心的建议
4. 问"想详细聊聊哪张牌？或者有什么想问的？"
5. 等用户追问再展开

输出结构（3-6段）：
整体能量：这牌阵给我的感觉...

关键牌面：主要是...在起作用

核心建议：你最该注意的是...

想详细聊聊哪张牌？还是有什么想问的？`;

export const TAROT_CARDS = {
  major: [
    { name: '愚者', number: 0, meaning: '新的开始、冒险、纯真', reversed: '鲁莽、愚蠢、缺乏计划', image: '/tarot-cards/m00.jpg' },
    { name: '魔术师', number: 1, meaning: '创造力、意志力、显化', reversed: '欺骗、操纵、缺乏自信', image: '/tarot-cards/m01.jpg' },
    { name: '女祭司', number: 2, meaning: '直觉、潜意识、神秘', reversed: '秘密、疏离、忽视直觉', image: '/tarot-cards/m02.jpg' },
    { name: '皇后', number: 3, meaning: '丰饶、母性、创造力', reversed: '依赖、过度保护、不育', image: '/tarot-cards/m03.jpg' },
    { name: '皇帝', number: 4, meaning: '权威、结构、父性', reversed: '专制、僵化、滥用权力', image: '/tarot-cards/m04.jpg' },
    { name: '教皇', number: 5, meaning: '传统、信仰、教育', reversed: '反叛、非传统、个人信仰', image: '/tarot-cards/m05.jpg' },
    { name: '恋人', number: 6, meaning: '爱情、选择、和谐', reversed: '失衡、错误选择、分离', image: '/tarot-cards/m06.jpg' },
    { name: '战车', number: 7, meaning: '意志力、胜利、控制', reversed: '失控、失败、缺乏方向', image: '/tarot-cards/m07.jpg' },
    { name: '力量', number: 8, meaning: '勇气、耐心、内在力量', reversed: '软弱、怀疑、缺乏自信', image: '/tarot-cards/m08.jpg' },
    { name: '隐者', number: 9, meaning: '内省、独处、智慧', reversed: '孤独、孤立、拒绝建议', image: '/tarot-cards/m09.jpg' },
    { name: '命运之轮', number: 10, meaning: '变化、循环、命运', reversed: '厄运、阻碍、抗拒变化', image: '/tarot-cards/m10.jpg' },
    { name: '正义', number: 11, meaning: '公正、真理、因果', reversed: '不公、逃避责任、不诚实', image: '/tarot-cards/m11.jpg' },
    { name: '倒吊人', number: 12, meaning: '牺牲、等待、新视角', reversed: '固执、徒劳、抗拒改变', image: '/tarot-cards/m12.jpg' },
    { name: '死神', number: 13, meaning: '结束、转变、新生', reversed: '停滞、恐惧改变、拖延', image: '/tarot-cards/m13.jpg' },
    { name: '节制', number: 14, meaning: '平衡、节制、和谐', reversed: '极端、失衡、过度', image: '/tarot-cards/m14.jpg' },
    { name: '恶魔', number: 15, meaning: '束缚、诱惑、物质主义', reversed: '解放、挣脱束缚、觉醒', image: '/tarot-cards/m15.jpg' },
    { name: '塔', number: 16, meaning: '突变、觉醒、破坏', reversed: '避免灾难、渐进改变、幸存', image: '/tarot-cards/m16.jpg' },
    { name: '星星', number: 17, meaning: '希望、灵感、宁静', reversed: '绝望、缺乏信心、幻灭', image: '/tarot-cards/m17.jpg' },
    { name: '月亮', number: 18, meaning: '幻觉、恐惧、潜意识', reversed: ' clarity、释放恐惧、真相', image: '/tarot-cards/m18.jpg' },
    { name: '太阳', number: 19, meaning: '快乐、成功、活力', reversed: '暂时的阴霾、过度自信、延迟的快乐', image: '/tarot-cards/m19.jpg' },
    { name: '审判', number: 20, meaning: '重生、觉醒、救赎', reversed: '自责、拒绝觉醒、忽视召唤', image: '/tarot-cards/m20.jpg' },
    { name: '世界', number: 21, meaning: '完成、成就、圆满', reversed: '未完成、缺乏 closure、延迟', image: '/tarot-cards/m21.jpg' },
  ],
};

export type TarotSpread = 'single' | 'three' | 'celtic';

export const TAROT_SPREADS = [
  {
    id: 'single' as TarotSpread,
    name: '单张牌',
    description: '一张牌代表问题的核心答案',
    cardCount: 1,
    positions: ['问题核心'],
  },
  {
    id: 'three' as TarotSpread,
    name: '三张牌',
    description: '过去-现在-未来的时间线解读',
    cardCount: 3,
    positions: ['过去', '现在', '未来'],
  },
  {
    id: 'celtic' as TarotSpread,
    name: '凯尔特十字',
    description: '十张牌的深度解读牌阵',
    cardCount: 10,
    positions: [
      '当前状况',
      '挑战/阻碍',
      '过去基础',
      '近期过去',
      '最好结果',
      '近期未来',
      '自我认知',
      '环境影响',
      '希望/恐惧',
      '最终结果',
    ],
  },
];

export function generateTarotPrompt(
  spread: TarotSpread,
  cards: { name: string; isReversed: boolean; position: number }[],
  question?: string
): string {
  const spreadInfo = TAROT_SPREADS.find((s) => s.id === spread);

  let prompt = `请解读${spreadInfo?.name}牌阵。\n\n`;

  if (question) {
    prompt += `✨ 求卜问题：${question}\n\n`;
  } else {
    prompt += `✨ 求卜问题：询问当下最需要知道的指引\n\n`;
  }

  prompt += '🎴 抽到的牌：\n';
  cards.forEach((card, index) => {
    const position = spreadInfo?.positions[index] || `位置 ${index + 1}`;
    const orientation = card.isReversed ? '逆位 ⬇️' : '正位 ⬆️';
    prompt += `${index + 1}. 【${position}】${card.name} ${orientation}\n`;
  });

  prompt += '\n请以塔罗世家的智慧，为求卜者提供深刻而温暖的解读。';

  return prompt;
}

export function drawCards(count: number): { name: string; isReversed: boolean }[] {
  const cards = [];
  const availableCards = [...TAROT_CARDS.major];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const card = availableCards.splice(randomIndex, 1)[0];
    const isReversed = Math.random() < 0.3; // 30% 概率逆位
    cards.push({
      name: card.name,
      isReversed,
    });
  }

  return cards;
}

// 追问功能 Prompt
export const TAROT_FOLLOWUP_PROMPT = `用户想继续就刚才的塔罗牌阵深入交流。请以塔罗师薇薇安的口吻继续回答。

回答要点：
1. 回忆之前的牌阵背景，保持解读的连贯性
2. 针对用户的新问题给出具体回答，控制在1-5句话
3. 不要逐张详细解释，只回答用户问的方面
4. 绝对绝对不要用任何星号***
5. 保持亲切自然的口吻`;
