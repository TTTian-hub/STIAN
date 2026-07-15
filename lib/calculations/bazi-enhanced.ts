import { BaziResult, BaziPillar, WUXING, YINYANG } from './bazi';
import { Lunar, Solar } from 'lunar-typescript';

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 纳音五行
const NA_YIN: Record<string, string> = {
  '甲子': '海中金', '乙丑': '海中金', '丙寅': '炉中火', '丁卯': '炉中火',
  '戊辰': '大林木', '己巳': '大林木', '庚午': '路旁土', '辛未': '路旁土',
  '壬申': '剑锋金', '癸酉': '剑锋金', '甲戌': '山头火', '乙亥': '山头火',
  '丙子': '涧下水', '丁丑': '涧下水', '戊寅': '城头土', '己卯': '城头土',
  '庚辰': '白蜡金', '辛巳': '白蜡金', '壬午': '杨柳木', '癸未': '杨柳木',
  '甲申': '泉中水', '乙酉': '泉中水', '丙戌': '屋上土', '丁亥': '屋上土',
  '戊子': '霹雳火', '己丑': '霹雳火', '庚寅': '松柏木', '辛卯': '松柏木',
  '壬辰': '长流水', '癸巳': '长流水', '甲午': '砂中金', '乙未': '砂中金',
  '丙申': '山下火', '丁酉': '山下火', '戊戌': '平地木', '己亥': '平地木',
  '庚子': '壁上土', '辛丑': '壁上土', '壬寅': '金箔金', '癸卯': '金箔金',
  '甲辰': '覆灯火', '乙巳': '覆灯火', '丙午': '天河水', '丁未': '天河水',
  '戊申': '大驿土', '己酉': '大驿土', '庚戌': '钗钏金', '辛亥': '钗钏金',
  '壬子': '桑柘木', '癸丑': '桑柘木', '甲寅': '大溪水', '乙卯': '大溪水',
  '丙辰': '沙中土', '丁巳': '沙中土', '戊午': '天上火', '己未': '天上火',
  '庚申': '石榴木', '辛酉': '石榴木', '壬戌': '大海水', '癸亥': '大海水',
};

// 神煞定义
export interface ShenSha {
  name: string;
  type: '吉' | '凶' | '中';
  description: string;
  pillar: '年' | '月' | '日' | '时';
}

// 吉神
const JI_SHEN: Record<string, (ganZhi: string) => boolean> = {
  '天乙贵人': (gz) => {
    const map: Record<string, string[]> = {
      '甲': ['丑', '未'], '戊': ['丑', '未'], '庚': ['丑', '未'],
      '乙': ['子', '申'], '己': ['子', '申'],
      '丙': ['亥', '酉'], '丁': ['亥', '酉'],
      '壬': ['卯', '巳'], '癸': ['卯', '巳'],
      '辛': ['寅', '午'],
    };
    const gan = gz.charAt(0);
    const zhi = gz.charAt(1);
    return map[gan]?.includes(zhi) || false;
  },
  '文昌贵人': (gz) => {
    const map: Record<string, string> = {
      '甲': '巳', '乙': '午', '丙': '申', '丁': '酉', '戊': '申',
      '己': '酉', '庚': '亥', '辛': '子', '壬': '寅', '癸': '卯',
    };
    return gz.charAt(1) === map[gz.charAt(0)];
  },
  '太极贵人': (gz) => {
    const map: Record<string, string[]> = {
      '甲': ['子', '午'], '乙': ['子', '午'],
      '丙': ['卯', '酉'], '丁': ['卯', '酉'],
      '戊': ['辰', '戌', '丑', '未'],
      '己': ['辰', '戌', '丑', '未'],
      '庚': ['寅', '亥'], '辛': ['寅', '亥'],
      '壬': ['巳', '申'], '癸': ['巳', '申'],
    };
    return map[gz.charAt(0)]?.includes(gz.charAt(1)) || false;
  },
  '天德贵人': (gz) => {
    // 根据月份判断
    return false; // 简化处理
  },
  '月德贵人': (gz) => {
    const map: Record<string, string[]> = {
      '甲': ['丙'], '乙': ['甲', '庚'], '丙': ['壬'], '丁': ['壬'],
      '戊': ['甲'], '己': ['甲'], '庚': ['丙'], '辛': ['丙'],
      '壬': ['戊'], '癸': ['戊'],
    };
    return map[gz.charAt(0)]?.includes(gz.charAt(0)) || false;
  },
  '福星贵人': (gz) => {
    const map: Record<string, string> = {
      '甲': '寅', '乙': '丑', '丙': '子', '丁': '酉', '戊': '申',
      '己': '未', '庚': '午', '辛': '巳', '壬': '辰', '癸': '卯',
    };
    return gz.charAt(1) === map[gz.charAt(0)];
  },
  '驿马': (gz) => {
    const map: Record<string, string[]> = {
      '申': ['寅'], '子': ['寅'], '辰': ['寅'],
      '寅': ['申'], '午': ['申'], '戌': ['申'],
      '亥': ['巳'], '卯': ['巳'], '未': ['巳'],
      '巳': ['亥'], '酉': ['亥'], '丑': ['亥'],
    };
    return map[gz.charAt(1)]?.includes(gz.charAt(1)) || false;
  },
};

// 凶神
const XIONG_SHEN: Record<string, (ganZhi: string) => boolean> = {
  '桃花': (gz) => {
    const map: Record<string, string[]> = {
      '申': ['酉'], '子': ['酉'], '辰': ['酉'],
      '寅': ['卯'], '午': ['卯'], '戌': ['卯'],
      '亥': ['子'], '卯': ['子'], '未': ['子'],
      '巳': ['午'], '酉': ['午'], '丑': ['午'],
    };
    return map[gz.charAt(1)]?.includes(gz.charAt(1)) || false;
  },
  '羊刃': (gz) => {
    const map: Record<string, string> = {
      '甲': '卯', '乙': '寅', '丙': '午', '丁': '巳',
      '戊': '午', '己': '巳', '庚': '酉', '辛': '申',
      '壬': '子', '癸': '亥',
    };
    return gz.charAt(1) === map[gz.charAt(0)];
  },
  '劫煞': (gz) => {
    const map: Record<string, string[]> = {
      '申': ['巳'], '子': ['巳'], '辰': ['巳'],
      '寅': ['亥'], '午': ['亥'], '戌': ['亥'],
      '亥': ['申'], '卯': ['申'], '未': ['申'],
      '巳': ['寅'], '酉': ['寅'], '丑': ['寅'],
    };
    return map[gz.charAt(1)]?.includes(gz.charAt(1)) || false;
  },
  '亡神': (gz) => {
    const map: Record<string, string[]> = {
      '申': ['亥'], '子': ['亥'], '辰': ['亥'],
      '寅': ['巳'], '午': ['巳'], '戌': ['巳'],
      '亥': ['寅'], '卯': ['寅'], '未': ['寅'],
      '巳': ['申'], '酉': ['申'], '丑': ['申'],
    };
    return map[gz.charAt(1)]?.includes(gz.charAt(1)) || false;
  },
};

// 计算纳音
export function calculateNaYin(ganZhi: string): string {
  return NA_YIN[ganZhi] || '未知';
}

// 计算神煞
export function calculateShenSha(bazi: BaziResult): ShenSha[] {
  const shensha: ShenSha[] = [];
  const pillars = [
    { name: '年', gz: `${bazi.year.gan}${bazi.year.zhi}` },
    { name: '月', gz: `${bazi.month.gan}${bazi.month.zhi}` },
    { name: '日', gz: `${bazi.day.gan}${bazi.day.zhi}` },
    ...(bazi.hour ? [{ name: '时', gz: `${bazi.hour.gan}${bazi.hour.zhi}` }] : []),
  ];

  const descriptions: Record<string, string> = {
    '天乙贵人': '遇到困难时有贵人相助，逢凶化吉',
    '文昌贵人': '聪明好学，有文采，利考试功名',
    '太极贵人': '聪明好学，对神秘文化有兴趣',
    '福星贵人': '一生福禄，衣食无忧',
    '驿马': '好动不喜静，多有远行变动',
    '桃花': '人缘好，异性缘佳，但需防感情纠葛',
    '羊刃': '性格刚强，有魄力，但易冲动',
    '劫煞': '易遇小人，财物需防损失',
    '亡神': '心机深沉，需防意外灾祸',
  };

  pillars.forEach(({ name, gz }) => {
    // 检查吉神
    Object.entries(JI_SHEN).forEach(([shenName, check]) => {
      if (check(gz)) {
        shensha.push({
          name: shenName,
          type: '吉',
          description: descriptions[shenName] || '',
          pillar: name as '年' | '月' | '日' | '时',
        });
      }
    });

    // 检查凶神
    Object.entries(XIONG_SHEN).forEach(([shenName, check]) => {
      if (check(gz)) {
        shensha.push({
          name: shenName,
          type: '凶',
          description: descriptions[shenName] || '',
          pillar: name as '年' | '月' | '日' | '时',
        });
      }
    });
  });

  return shensha;
}

// 计算空亡
export function calculateKongWang(dayGanZhi: string): string[] {
  const ganIndex = TIAN_GAN.indexOf(dayGanZhi.charAt(0));
  const zhiIndex = DI_ZHI.indexOf(dayGanZhi.charAt(1));

  // 空亡从日柱干支的旬首后两位开始
  const xunIndex = Math.floor(ganIndex / 2) * 2;
  const kongWangStart = (xunIndex + 10) % 12;

  return [DI_ZHI[kongWangStart], DI_ZHI[(kongWangStart + 1) % 12]];
}

// 计算胎元
export function calculateTaiYuan(monthGanZhi: string): string {
  const ganIndex = TIAN_GAN.indexOf(monthGanZhi.charAt(0));
  const zhiIndex = DI_ZHI.indexOf(monthGanZhi.charAt(1));

  // 胎元 = 月干进一、月支进三
  const taiGan = TIAN_GAN[(ganIndex + 1) % 10];
  const taiZhi = DI_ZHI[(zhiIndex + 3) % 12];

  return `${taiGan}${taiZhi}`;
}

// 计算命宫
export function calculateMingGong(monthZhi: string, hourZhi: string): string {
  const monthIndex = DI_ZHI.indexOf(monthZhi);
  const hourIndex = DI_ZHI.indexOf(hourZhi);

  // 命宫 = 14 - (月支序号 + 时支序号)
  let mingIndex = 14 - (monthIndex + hourIndex + 2);
  if (mingIndex <= 0) mingIndex += 12;
  if (mingIndex > 12) mingIndex -= 12;

  // 命宫天干需要根据年干推算（简化版）
  const mingZhi = DI_ZHI[mingIndex - 1];

  return `X${mingZhi}`; // X表示需要进一步计算
}

// 流年运势
export interface LiuNian {
  year: number;
  ganZhi: string;
  naYin: string;
  type: '吉' | '凶' | '平';
  description: string;
}

// 计算流年运势
export function calculateLiuNian(bazi: BaziResult, years: number = 10): LiuNian[] {
  const currentYear = new Date().getFullYear();
  const liuNian: LiuNian[] = [];

  const dayMaster = bazi.day.gan;
  const dayMasterWX = WUXING[dayMaster as keyof typeof WUXING];

  for (let i = 0; i < years; i++) {
    const year = currentYear + i;
    const yearGanZhi = getYearGanZhi(year);
    const yearNaYin = NA_YIN[yearGanZhi] || '未知';

    // 简单判断流年吉凶
    const yearGan = yearGanZhi.charAt(0);
    const yearWX = WUXING[yearGan as keyof typeof WUXING];

    let type: '吉' | '凶' | '平' = '平';
    let description = '';

    // 根据五行生克判断
    if (yearWX === dayMasterWX) {
      type = '平';
      description = '比劫之年，竞争较多，注意人际关系';
    } else if (
      (dayMasterWX === '木' && yearWX === '水') ||
      (dayMasterWX === '火' && yearWX === '木') ||
      (dayMasterWX === '土' && yearWX === '火') ||
      (dayMasterWX === '金' && yearWX === '土') ||
      (dayMasterWX === '水' && yearWX === '金')
    ) {
      type = '吉';
      description = '印绶之年，利于学习、提升、贵人相助';
    } else if (
      (dayMasterWX === '木' && yearWX === '火') ||
      (dayMasterWX === '火' && yearWX === '土') ||
      (dayMasterWX === '土' && yearWX === '金') ||
      (dayMasterWX === '金' && yearWX === '水') ||
      (dayMasterWX === '水' && yearWX === '木')
    ) {
      type = '平';
      description = '食伤之年，利于表达、创作，但注意健康';
    } else if (
      (dayMasterWX === '木' && yearWX === '金') ||
      (dayMasterWX === '火' && yearWX === '水') ||
      (dayMasterWX === '土' && yearWX === '木') ||
      (dayMasterWX === '金' && yearWX === '火') ||
      (dayMasterWX === '水' && yearWX === '土')
    ) {
      type = '凶';
      description = '官杀之年，压力较大，注意健康和事业变动';
    } else {
      type = '吉';
      description = '财星之年，利于求财、事业发展';
    }

    liuNian.push({
      year,
      ganZhi: yearGanZhi,
      naYin: yearNaYin,
      type,
      description,
    });
  }

  return liuNian;
}

// 获取年份干支
function getYearGanZhi(year: number): string {
  const ganIndex = (year - 4) % 10;
  const zhiIndex = (year - 4) % 12;
  return `${TIAN_GAN[ganIndex]}${DI_ZHI[zhiIndex]}`;
}

// 格局判断
export function calculateGeJu(bazi: BaziResult): string[] {
  const geJu: string[] = [];
  const dayMaster = bazi.day.gan;
  const monthZhi = bazi.month.zhi;

  // 简单格局判断
  // 正官格：月支本气克日干且阴阳不同
  // 七杀格：月支本气克日干且阴阳相同
  // 正印格：月支本气生日干且阴阳不同
  // 偏印格：月支本气生日干且阴阳相同

  const wuXingMap: Record<string, string[]> = {
    '木': ['金'],
    '火': ['水'],
    '土': ['木'],
    '金': ['火'],
    '水': ['土'],
  };

  const dayWX = WUXING[dayMaster as keyof typeof WUXING];
  const monthWX = WUXING[monthZhi as keyof typeof WUXING];

  // 判断从格
  // 简化判断：如果日主周围都是克泄耗，可能是从格

  // 判断身强身弱
  let supportCount = 0;
  let drainCount = 0;

  [bazi.year, bazi.month, bazi.hour].filter((p): p is NonNullable<typeof p> => p !== null).forEach(pillar => {
    const wx = WUXING[pillar.gan as keyof typeof WUXING];
    // 生我
    if (
      (dayWX === '木' && wx === '水') ||
      (dayWX === '火' && wx === '木') ||
      (dayWX === '土' && wx === '火') ||
      (dayWX === '金' && wx === '土') ||
      (dayWX === '水' && wx === '金')
    ) {
      supportCount++;
    }
    // 同我
    else if (wx === dayWX) {
      supportCount++;
    }
    // 克泄耗
    else {
      drainCount++;
    }
  });

  if (supportCount >= 3) {
    geJu.push('身旺');
  } else if (drainCount >= 3) {
    geJu.push('身弱');
  } else {
    geJu.push('中和');
  }

  return geJu;
}

// 增强的八字结果
export interface BaziEnhancedResult extends BaziResult {
  naYin: {
    year: string;
    month: string;
    day: string;
    hour?: string;
  };
  shenSha: ShenSha[];
  kongWang: string[];
  taiYuan: string;
  mingGong?: string;
  liuNian: LiuNian[];
  geJu: string[];
}

// 完整计算
export function calculateBaziEnhanced(
  birthDate: Date,
  hour: number,
  isEarlyZi: boolean = false
): BaziEnhancedResult {
  // 基础计算（复用原有逻辑）
  const { calculateBazi } = require('./bazi');
  const basicResult: BaziResult = calculateBazi(birthDate, hour, isEarlyZi);

  // 计算纳音
  const naYin = {
    year: calculateNaYin(`${basicResult.year.gan}${basicResult.year.zhi}`),
    month: calculateNaYin(`${basicResult.month.gan}${basicResult.month.zhi}`),
    day: calculateNaYin(`${basicResult.day.gan}${basicResult.day.zhi}`),
    hour: basicResult.hour ? calculateNaYin(`${basicResult.hour.gan}${basicResult.hour.zhi}`) : undefined,
  };

  // 计算神煞
  const shenSha = calculateShenSha(basicResult);

  // 计算空亡
  const kongWang = calculateKongWang(`${basicResult.day.gan}${basicResult.day.zhi}`);

  // 计算胎元
  const taiYuan = calculateTaiYuan(`${basicResult.month.gan}${basicResult.month.zhi}`);

  // 计算命宫（时间不确定时使用默认值）
  const mingGong = basicResult.hour
    ? calculateMingGong(basicResult.month.zhi, basicResult.hour.zhi)
    : undefined;

  // 计算流年
  const liuNian = calculateLiuNian(basicResult, 10);

  // 计算格局
  const geJu = calculateGeJu(basicResult);

  return {
    ...basicResult,
    naYin,
    shenSha,
    kongWang,
    taiYuan,
    mingGong,
    liuNian,
    geJu,
  };
}
