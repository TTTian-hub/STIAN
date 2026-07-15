import { BaziPillar, BaziResult, TIANGAN } from './bazi';

// 十神名称
export const SHISHEN_NAMES = {
  '比肩': '比肩',
  '劫财': '劫财',
  '食神': '食神',
  '伤官': '伤官',
  '偏财': '偏财',
  '正财': '正财',
  '七杀': '七杀',
  '正官': '正官',
  '偏印': '偏印',
  '正印': '正印',
};

export interface ShishenInfo {
  name: string;
  type: 'bi' | 'jie' | 'shi' | 'shang' | 'pian' | 'zheng' | 'qi' | 'guan' | 'pianyin' | 'zhengyin';
  relation: string;
}

/**
 * Calculate Shishen (Ten Gods) for a given stem based on day master
 * @param dayMaster - Day stem (日干)
 * @param targetStem - Target stem to calculate relationship
 * @returns Shishen info
 */
export function calculateShishen(dayMaster: string, targetStem: string): ShishenInfo {
  const dayMasterWuxing = getWuxing(dayMaster);
  const targetWuxing = getWuxing(targetStem);

  const dayMasterYinYang = getYinYang(dayMaster);
  const targetYinYang = getYinYang(targetStem);

  const isSameYinYang = dayMasterYinYang === targetYinYang;
  const wuxingRelation = getWuxingRelation(dayMasterWuxing, targetWuxing);

  let name: string;
  let type: ShishenInfo['type'];

  switch (wuxingRelation) {
    case 'same':
      if (isSameYinYang) {
        name = '比肩';
        type = 'bi';
      } else {
        name = '劫财';
        type = 'jie';
      }
      break;
    case 'generates':
      if (isSameYinYang) {
        name = '食神';
        type = 'shi';
      } else {
        name = '伤官';
        type = 'shang';
      }
      break;
    case 'overcome':
      if (isSameYinYang) {
        name = '偏财';
        type = 'pian';
      } else {
        name = '正财';
        type = 'zheng';
      }
      break;
    case 'overcomeBy':
      if (isSameYinYang) {
        name = '七杀';
        type = 'qi';
      } else {
        name = '正官';
        type = 'guan';
      }
      break;
    case 'generatedBy':
      if (isSameYinYang) {
        name = '偏印';
        type = 'pianyin';
      } else {
        name = '正印';
        type = 'zhengyin';
      }
      break;
    default:
      name = '比肩';
      type = 'bi';
  }

  const relationMap: Record<string, string> = {
    '比肩': '同我者',
    '劫财': '同我者',
    '食神': '我生者',
    '伤官': '我生者',
    '偏财': '我克者',
    '正财': '我克者',
    '七杀': '克我者',
    '正官': '克我者',
    '偏印': '生我者',
    '正印': '生我者',
  };

  return {
    name,
    type,
    relation: relationMap[name],
  };
}

/**
 * Calculate all Shishen for a BaZi result
 */
export function calculateBaziShishen(bazi: BaziResult): {
  year: ShishenInfo;
  month: ShishenInfo;
  day: ShishenInfo;
  hour?: ShishenInfo;
  dayMaster: string;
} {
  const dayMaster = bazi.day.gan;

  const result: {
    year: ShishenInfo;
    month: ShishenInfo;
    day: ShishenInfo;
    hour?: ShishenInfo;
    dayMaster: string;
  } = {
    year: calculateShishen(dayMaster, bazi.year.gan),
    month: calculateShishen(dayMaster, bazi.month.gan),
    day: { name: '日主', type: 'bi', relation: '自身' },
    dayMaster,
  };

  if (bazi.hour) {
    result.hour = calculateShishen(dayMaster, bazi.hour.gan);
  }

  return result;
}

/**
 * Get Shishen for hidden stems in branches
 */
export function calculateCangGanShishen(
  dayMaster: string,
  cangGan: string[]
): ShishenInfo[] {
  return cangGan.map(gan => calculateShishen(dayMaster, gan));
}

function getWuxing(stem: string): string {
  const wuxingMap: Record<string, string> = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水',
  };
  return wuxingMap[stem] || '木';
}

function getYinYang(stem: string): string {
  const yinyangMap: Record<string, string> = {
    '甲': '阳', '乙': '阴',
    '丙': '阳', '丁': '阴',
    '戊': '阳', '己': '阴',
    '庚': '阳', '辛': '阴',
    '壬': '阳', '癸': '阴',
  };
  return yinyangMap[stem] || '阳';
}

function getWuxingRelation(masterWuxing: string, targetWuxing: string): string {
  if (masterWuxing === targetWuxing) {
    return 'same';
  }

  // 五行相生关系
  const generateMap: Record<string, string> = {
    '木': '火',
    '火': '土',
    '土': '金',
    '金': '水',
    '水': '木',
  };

  // 五行相克关系
  const overcomeMap: Record<string, string> = {
    '木': '土',
    '土': '水',
    '水': '火',
    '火': '金',
    '金': '木',
  };

  if (generateMap[masterWuxing] === targetWuxing) {
    return 'generates';
  }

  if (generateMap[targetWuxing] === masterWuxing) {
    return 'generatedBy';
  }

  if (overcomeMap[masterWuxing] === targetWuxing) {
    return 'overcome';
  }

  if (overcomeMap[targetWuxing] === masterWuxing) {
    return 'overcomeBy';
  }

  return 'same';
}
