import { ZODIAC_SIGNS } from "@/lib/prompts/horoscope";
import { calculateBazi, BaziResult, formatBazi } from "./bazi";

// 星座元素
const ZODIAC_ELEMENTS: Record<string, string> = {
  '白羊座': '火', '狮子座': '火', '射手座': '火',
  '金牛座': '土', '处女座': '土', '摩羯座': '土',
  '双子座': '风', '天秤座': '风', '水瓶座': '风',
  '巨蟹座': '水', '天蝎座': '水', '双鱼座': '水',
};

// 星座配对分数表 (0-100)
const ZODIAC_COMPATIBILITY: Record<string, Record<string, number>> = {
  '白羊座': {
    '白羊座': 75, '金牛座': 50, '双子座': 85, '巨蟹座': 45,
    '狮子座': 95, '处女座': 50, '天秤座': 80, '天蝎座': 60,
    '射手座': 90, '摩羯座': 55, '水瓶座': 85, '双鱼座': 55,
  },
  '金牛座': {
    '白羊座': 50, '金牛座': 80, '双子座': 50, '巨蟹座': 85,
    '狮子座': 50, '处女座': 95, '天秤座': 70, '天蝎座': 85,
    '射手座': 45, '摩羯座': 95, '水瓶座': 50, '双鱼座': 80,
  },
  '双子座': {
    '白羊座': 85, '金牛座': 50, '双子座': 75, '巨蟹座': 50,
    '狮子座': 85, '处女座': 55, '天秤座': 95, '天蝎座': 50,
    '射手座': 90, '摩羯座': 50, '水瓶座': 95, '双鱼座': 60,
  },
  '巨蟹座': {
    '白羊座': 45, '金牛座': 85, '双子座': 50, '巨蟹座': 80,
    '狮子座': 50, '处女座': 85, '天秤座': 50, '天蝎座': 95,
    '射手座': 45, '摩羯座': 80, '水瓶座': 45, '双鱼座': 95,
  },
  '狮子座': {
    '白羊座': 95, '金牛座': 50, '双子座': 85, '巨蟹座': 50,
    '狮子座': 85, '处女座': 55, '天秤座': 90, '天蝎座': 60,
    '射手座': 95, '摩羯座': 55, '水瓶座': 80, '双鱼座': 55,
  },
  '处女座': {
    '白羊座': 50, '金牛座': 95, '双子座': 55, '巨蟹座': 85,
    '狮子座': 55, '处女座': 80, '天秤座': 75, '天蝎座': 90,
    '射手座': 50, '摩羯座': 95, '水瓶座': 55, '双鱼座': 75,
  },
  '天秤座': {
    '白羊座': 80, '金牛座': 70, '双子座': 95, '巨蟹座': 50,
    '狮子座': 90, '处女座': 75, '天秤座': 80, '天蝎座': 60,
    '射手座': 85, '摩羯座': 65, '水瓶座': 95, '双鱼座': 65,
  },
  '天蝎座': {
    '白羊座': 60, '金牛座': 85, '双子座': 50, '巨蟹座': 95,
    '狮子座': 60, '处女座': 90, '天秤座': 60, '天蝎座': 85,
    '射手座': 55, '摩羯座': 90, '水瓶座': 55, '双鱼座': 95,
  },
  '射手座': {
    '白羊座': 90, '金牛座': 45, '双子座': 90, '巨蟹座': 45,
    '狮子座': 95, '处女座': 50, '天秤座': 85, '天蝎座': 55,
    '射手座': 80, '摩羯座': 50, '水瓶座': 90, '双鱼座': 60,
  },
  '摩羯座': {
    '白羊座': 55, '金牛座': 95, '双子座': 50, '巨蟹座': 80,
    '狮子座': 55, '处女座': 95, '天秤座': 65, '天蝎座': 90,
    '射手座': 50, '摩羯座': 85, '水瓶座': 60, '双鱼座': 75,
  },
  '水瓶座': {
    '白羊座': 85, '金牛座': 50, '双子座': 95, '巨蟹座': 45,
    '狮子座': 80, '处女座': 55, '天秤座': 95, '天蝎座': 55,
    '射手座': 90, '摩羯座': 60, '水瓶座': 80, '双鱼座': 65,
  },
  '双鱼座': {
    '白羊座': 55, '金牛座': 80, '双子座': 60, '巨蟹座': 95,
    '狮子座': 55, '处女座': 75, '天秤座': 65, '天蝎座': 95,
    '射手座': 60, '摩羯座': 75, '水瓶座': 65, '双鱼座': 85,
  },
};

// 生肖配对分数表
const ZODIAC_ANIMAL_COMPATIBILITY: Record<string, Record<string, number>> = {
  '鼠': { '鼠': 75, '牛': 95, '虎': 70, '兔': 60, '龙': 90, '蛇': 75, '马': 55, '羊': 50, '猴': 90, '鸡': 70, '狗': 65, '猪': 85 },
  '牛': { '鼠': 95, '牛': 80, '虎': 65, '兔': 70, '龙': 60, '蛇': 95, '马': 55, '羊': 50, '猴': 75, '鸡': 90, '狗': 70, '猪': 80 },
  '虎': { '鼠': 70, '牛': 65, '虎': 75, '兔': 85, '龙': 90, '蛇': 60, '马': 95, '羊': 70, '猴': 55, '鸡': 65, '狗': 90, '猪': 85 },
  '兔': { '鼠': 60, '牛': 70, '虎': 85, '兔': 80, '龙': 65, '蛇': 70, '马': 75, '羊': 95, '猴': 60, '鸡': 55, '狗': 85, '猪': 90 },
  '龙': { '鼠': 90, '牛': 60, '虎': 90, '兔': 65, '龙': 75, '蛇': 85, '马': 80, '羊': 70, '猴': 95, '鸡': 90, '狗': 55, '猪': 75 },
  '蛇': { '鼠': 75, '牛': 95, '虎': 60, '兔': 70, '龙': 85, '蛇': 80, '马': 70, '羊': 75, '猴': 90, '鸡': 95, '狗': 65, '猪': 60 },
  '马': { '鼠': 55, '牛': 55, '虎': 95, '兔': 75, '龙': 80, '蛇': 70, '马': 75, '羊': 90, '猴': 70, '鸡': 65, '狗': 90, '猪': 70 },
  '羊': { '鼠': 50, '牛': 50, '虎': 70, '兔': 95, '龙': 70, '蛇': 75, '马': 90, '羊': 80, '猴': 70, '鸡': 65, '狗': 75, '猪': 90 },
  '猴': { '鼠': 90, '牛': 75, '虎': 55, '兔': 60, '龙': 95, '蛇': 90, '马': 70, '羊': 70, '猴': 80, '鸡': 85, '狗': 70, '猪': 65 },
  '鸡': { '鼠': 70, '牛': 90, '虎': 65, '兔': 55, '龙': 90, '蛇': 95, '马': 65, '羊': 65, '猴': 85, '鸡': 80, '狗': 75, '猪': 70 },
  '狗': { '鼠': 65, '牛': 70, '虎': 90, '兔': 85, '龙': 55, '蛇': 65, '马': 90, '羊': 75, '猴': 70, '鸡': 75, '狗': 80, '猪': 85 },
  '猪': { '鼠': 85, '牛': 80, '虎': 85, '兔': 90, '龙': 75, '蛇': 60, '马': 70, '羊': 90, '猴': 65, '鸡': 70, '狗': 85, '猪': 85 },
};

// 天干五合
const TIANGAN_HE: Record<string, string> = {
  '甲': '己', '己': '甲',
  '乙': '庚', '庚': '乙',
  '丙': '辛', '辛': '丙',
  '丁': '壬', '壬': '丁',
  '戊': '癸', '癸': '戊',
};

// 地支六合
const DIZHI_HE: Record<string, string> = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午',
};

// 地支三合
const DIZHI_SANHE: string[][] = [
  ['申', '子', '辰'],
  ['亥', '卯', '未'],
  ['寅', '午', '戌'],
  ['巳', '酉', '丑'],
];

// 地支六冲
const DIZHI_CHONG: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
};

export interface ZodiacSynastryResult {
  sign1: string;
  sign2: string;
  element1: string;
  element2: string;
  score: number;
  analysis: string;
}

export interface BaziSynastryResult {
  bazi1: string;
  bazi2: string;
  zodiac1: string;
  zodiac2: string;
  score: number;
  analysis: string;
  tianganHe: number;
  dizhiHe: number;
  dizhiSanhe: number;
  dizhiChong: number;
}

export interface SynastryResult {
  zodiac?: ZodiacSynastryResult;
  bazi?: BaziSynastryResult;
  overallScore: number;
  relationshipType?: string;
}

/**
 * Get zodiac sign from date
 */
export function getZodiacSign(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '白羊座';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '金牛座';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return '双子座';
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return '巨蟹座';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '狮子座';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '处女座';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return '天秤座';
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return '天蝎座';
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return '射手座';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '摩羯座';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '水瓶座';
  return '双鱼座';
}

/**
 * Calculate zodiac synastry
 */
export function calculateZodiacSynastry(date1: Date, date2: Date): ZodiacSynastryResult {
  const sign1 = getZodiacSign(date1);
  const sign2 = getZodiacSign(date2);
  const element1 = ZODIAC_ELEMENTS[sign1];
  const element2 = ZODIAC_ELEMENTS[sign2];
  const score = ZODIAC_COMPATIBILITY[sign1]?.[sign2] ?? 70;

  const elementCompatibility: Record<string, Record<string, string>> = {
    '火': { '火': '热情澎湃', '土': '火生土，相辅相成', '风': '火借风势，激情四溢', '水': '水火不容，需要磨合' },
    '土': { '火': '火生土，稳定踏实', '土': '厚重稳健', '风': '土克风，需要包容', '水': '土克水，有制约力' },
    '风': { '火': '风助火势，思维活跃', '土': '风动土散，需要协调', '风': '风云际会，心灵相通', '水': '风水相涵，智慧交融' },
    '水': { '火': '水火既济，互补性强', '土': '水来土掩，有控制力', '风': '水风并起，情感丰富', '水': '水到渠成，默契十足' },
  };

  const analysis = `${sign1}（${element1}）与${sign2}（${element2}）的配对指数为${score}分。元素关系：${elementCompatibility[element1]?.[element2] || '中性关系'}。`;

  return {
    sign1,
    sign2,
    element1,
    element2,
    score,
    analysis,
  };
}

/**
 * Calculate BaZi synastry
 */
export function calculateBaziSynastry(
  date1: Date,
  date2: Date,
  hour1: number = 12,
  hour2: number = 12
): BaziSynastryResult {
  const bazi1 = calculateBazi(date1, hour1);
  const bazi2 = calculateBazi(date2, hour2);

  // 天干相合分析
  let tianganHe = 0;
  const tg1 = [bazi1.year.gan, bazi1.month.gan, bazi1.day.gan, ...(bazi1.hour ? [bazi1.hour.gan] : [])];
  const tg2 = [bazi2.year.gan, bazi2.month.gan, bazi2.day.gan, ...(bazi2.hour ? [bazi2.hour.gan] : [])];

  for (const g1 of tg1) {
    if (TIANGAN_HE[g1] && tg2.includes(TIANGAN_HE[g1])) {
      tianganHe++;
    }
  }

  // 地支相合分析
  let dizhiHe = 0;
  const dz1 = [bazi1.year.zhi, bazi1.month.zhi, bazi1.day.zhi, ...(bazi1.hour ? [bazi1.hour.zhi] : [])];
  const dz2 = [bazi2.year.zhi, bazi2.month.zhi, bazi2.day.zhi, ...(bazi2.hour ? [bazi2.hour.zhi] : [])];

  for (const z1 of dz1) {
    if (DIZHI_HE[z1] && dz2.includes(DIZHI_HE[z1])) {
      dizhiHe++;
    }
  }

  // 地支三合分析
  let dizhiSanhe = 0;
  for (const sanhe of DIZHI_SANHE) {
    const hasIn1 = sanhe.filter(z => dz1.includes(z)).length;
    const hasIn2 = sanhe.filter(z => dz2.includes(z)).length;
    if (hasIn1 > 0 && hasIn2 > 0 && hasIn1 + hasIn2 >= 2) {
      dizhiSanhe++;
    }
  }

  // 地支六冲分析
  let dizhiChong = 0;
  for (const z1 of dz1) {
    if (DIZHI_CHONG[z1] && dz2.includes(DIZHI_CHONG[z1])) {
      dizhiChong++;
    }
  }

  // 生肖配对分数
  const zodiacScore = ZODIAC_ANIMAL_COMPATIBILITY[bazi1.zodiac]?.[bazi2.zodiac] ?? 70;

  // 计算总分 (基础分 + 相合加分 - 相冲扣分)
  let score = zodiacScore;
  score += tianganHe * 3;
  score += dizhiHe * 4;
  score += dizhiSanhe * 5;
  score -= dizhiChong * 5;
  score = Math.max(0, Math.min(100, score));

  const analysis = `两人八字分析：天干相合${tianganHe}处，地支相合${dizhiHe}处，地支三合${dizhiSanhe}处，地支相冲${dizhiChong}处。生肖配对${bazi1.zodiac}与${bazi2.zodiac}相合度${zodiacScore}分。`;

  return {
    bazi1: formatBazi(bazi1),
    bazi2: formatBazi(bazi2),
    zodiac1: bazi1.zodiac,
    zodiac2: bazi2.zodiac,
    score,
    analysis,
    tianganHe,
    dizhiHe,
    dizhiSanhe,
    dizhiChong,
  };
}

/**
 * Calculate combined synastry
 */
export function calculateSynastry(
  date1: Date,
  date2: Date,
  type: 'zodiac' | 'bazi' | 'combined' = 'combined',
  hour1?: number,
  hour2?: number
): SynastryResult {
  let zodiac: ZodiacSynastryResult | undefined;
  let bazi: BaziSynastryResult | undefined;

  if (type === 'zodiac' || type === 'combined') {
    zodiac = calculateZodiacSynastry(date1, date2);
  }

  if (type === 'bazi' || type === 'combined') {
    bazi = calculateBaziSynastry(date1, date2, hour1, hour2);
  }

  // 计算综合分数
  let overallScore = 0;
  if (zodiac && bazi) {
    overallScore = Math.round((zodiac.score + bazi.score) / 2);
  } else if (zodiac) {
    overallScore = zodiac.score;
  } else if (bazi) {
    overallScore = bazi.score;
  }

  return {
    zodiac,
    bazi,
    overallScore,
  };
}
