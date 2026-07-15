import { calculateSynastry as basicSynastry, SynastryResult } from './synastry';

// 增强的合盘结果
export interface SynastryEnhancedResult extends SynastryResult {
  // 婚姻宫分析
  marriagePalace: {
    position1: string;
    position2: string;
    compatibility: string;
    analysis: string;
  };
  // 桃花分析
  peachBlossom: {
    hasPeach1: boolean;
    hasPeach2: boolean;
    analysis: string;
  };
  // 详细维度评分
  dimensions: {
    personality: number;
    emotion: number;
    values: number;
    communication: number;
    lifestyle: number;
  };
  // 相处建议
  suggestions: string[];
  // 关键年份
  keyYears: number[];
}

// 计算婚姻宫
function calculateMarriagePalace(bazi1: string, bazi2: string): { position1: string; position2: string; compatibility: string; analysis: string } {
  // 日支代表夫妻宫
  const dayBranch1 = bazi1.split(' ')[2]?.charAt(1) || '';
  const dayBranch2 = bazi2.split(' ')[2]?.charAt(1) || '';

  // 简单的合冲分析
  const liuHe: Record<string, string> = {
    '子': '丑', '丑': '子', '寅': '亥', '亥': '寅',
    '卯': '戌', '戌': '卯', '辰': '酉', '酉': '辰',
    '巳': '申', '申': '巳', '午': '未', '未': '午',
  };

  const liuChong: Record<string, string> = {
    '子': '午', '午': '子', '丑': '未', '未': '丑',
    '寅': '申', '申': '寅', '卯': '酉', '酉': '卯',
    '辰': '戌', '戌': '辰', '巳': '亥', '亥': '巳',
  };

  let compatibility = '中性';
  let analysis = '';

  if (liuHe[dayBranch1] === dayBranch2) {
    compatibility = '极佳';
    analysis = '夫妻宫相合，感情和谐，互相包容';
  } else if (liuChong[dayBranch1] === dayBranch2) {
    compatibility = '挑战';
    analysis = '夫妻宫相冲，需要更多磨合和理解';
  } else {
    compatibility = '平稳';
    analysis = '夫妻宫无明显冲合，关系稳定';
  }

  return {
    position1: dayBranch1,
    position2: dayBranch2,
    compatibility,
    analysis,
  };
}

// 计算桃花
function calculatePeachBlossom(zodiac1: string, zodiac2: string): { hasPeach1: boolean; hasPeach2: boolean; analysis: string } {
  const peachAnimals = ['鼠', '马', '兔', '鸡'];
  const hasPeach1 = peachAnimals.includes(zodiac1);
  const hasPeach2 = peachAnimals.includes(zodiac2);

  let analysis = '';
  if (hasPeach1 && hasPeach2) {
    analysis = '两人异性缘都不错，要注意彼此间的信任';
  } else if (hasPeach1 || hasPeach2) {
    analysis = '一方异性缘较好，需要更多安全感';
  } else {
    analysis = '两人感情比较专一，缘分稳定';
  }

  return { hasPeach1, hasPeach2, analysis };
}

// 计算详细维度
function calculateDimensions(overallScore: number): {
  personality: number;
  emotion: number;
  values: number;
  communication: number;
  lifestyle: number;
} {
  const base = overallScore;
  return {
    personality: Math.min(100, Math.max(0, base + (Math.random() * 20 - 10))),
    emotion: Math.min(100, Math.max(0, base + (Math.random() * 20 - 10))),
    values: Math.min(100, Math.max(0, base + (Math.random() * 20 - 10))),
    communication: Math.min(100, Math.max(0, base + (Math.random() * 20 - 10))),
    lifestyle: Math.min(100, Math.max(0, base + (Math.random() * 20 - 10))),
  };
}

// 生成相处建议
function generateSuggestions(score: number): string[] {
  const suggestions: string[] = [];

  if (score >= 80) {
    suggestions.push('珍惜这段缘分，互相扶持');
    suggestions.push('保持目前的相处模式');
    suggestions.push('共同规划未来');
  } else if (score >= 60) {
    suggestions.push('多沟通，理解对方的想法');
    suggestions.push('遇到分歧时冷静处理');
    suggestions.push('培养共同爱好');
  } else {
    suggestions.push('需要更多的包容和耐心');
    suggestions.push('学会换位思考');
    suggestions.push('不要强求，顺其自然');
  }

  return suggestions;
}

// 增强合盘计算
export function calculateSynastryEnhanced(
  date1: Date,
  date2: Date,
  type: 'zodiac' | 'bazi' | 'combined' = 'combined',
  hour1?: number,
  hour2?: number
): SynastryEnhancedResult {
  const basicResult = basicSynastry(date1, date2, type, hour1, hour2);

  // 计算婚姻宫
  const marriagePalace = basicResult.bazi
    ? calculateMarriagePalace(basicResult.bazi.bazi1, basicResult.bazi.bazi2)
    : { position1: '', position2: '', compatibility: '未知', analysis: '无数据' };

  // 计算桃花
  const peachBlossom = basicResult.bazi
    ? calculatePeachBlossom(basicResult.bazi.zodiac1, basicResult.bazi.zodiac2)
    : { hasPeach1: false, hasPeach2: false, analysis: '无数据' };

  // 计算详细维度
  const dimensions = calculateDimensions(basicResult.overallScore);

  // 生成建议
  const suggestions = generateSuggestions(basicResult.overallScore);

  // 关键年份（简化版）
  const currentYear = new Date().getFullYear();
  const keyYears = [currentYear + 1, currentYear + 3, currentYear + 5];

  return {
    ...basicResult,
    marriagePalace,
    peachBlossom,
    dimensions,
    suggestions,
    keyYears,
  };
}
