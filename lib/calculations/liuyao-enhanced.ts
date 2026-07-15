import {
  LIU_SI_SI_GUA,
  GUA_NAMES,
  LIU_QIN_RELATIONS,
  LIU_SHEN_CONFIG,
  DIZHI_WUXING,
  DI_ZHI_LIU_HE,
  DI_ZHI_LIU_CHONG,
  DI_ZHI_SAN_HE,
  DI_ZHI_SAN_HUI,
  NA_JIA_MAP,
  SHI_YING_POSITIONS,
} from './liuyao-data';
import { BA_GUA, LIU_SI_SI_GUA as ORIGINAL_GUA_DATA } from './liuyao';

export interface YaoInfo {
  position: number;
  isYang: boolean;
  isDong: boolean;
  isChange: boolean;
  yaoText?: string;
  xiaoXiang?: string;
  // 纳甲信息
  naZhi?: string;
  naGan?: string;
  // 六亲
  liuQin?: string;
  // 六神
  liuShen?: string;
  // 伏神
  fuShen?: {
    naZhi: string;
    liuQin: string;
    isFeiShenExists: boolean;
  };
  // 日辰月建影响
  dayEffect?: string;
  monthEffect?: string;
  // 空亡状态
  isKongWang?: boolean;
}

export interface GuaInfo {
  guaXiang: string;
  name: string;
  guaCi: string;
  xiangYue: string;
  tuanCi: string;
  wuXing: string;
  gongWei: string;
  upperGua: string;
  lowerGua: string;
  yaoList: YaoInfo[];
  naJia: string[];
  shiYao: number;
  yingYao: number;
}

export interface LiuYaoResult {
  benGua: GuaInfo;
  bianGua?: GuaInfo;
  dongYao: number[];
  shiYao: number;
  yingYao: number;
  liuQin: string[];
  liuShen: string[];
  method: 'number' | 'time' | 'manual';
  timestamp: Date;
  question?: string;
  // 起卦时间信息
  year: string;
  month: string;
  day: string;
  hour: string;
  // 日月信息
  yueJian: string; // 月建
  riChen: string;  // 日辰
  // 空亡
  kongWang: string[];
  // 用神建议
  yongShen?: string;
  xiShen?: string;
  jiShen?: string;
  chouShen?: string;
}

// 天干
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
// 地支
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

/**
 * 计算日辰和月建
 */
function calculateDayMonthInfo(date: Date): { riChen: string; yueJian: string; kongWang: string[] } {
  // 简化的计算，实际应该使用农历
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // 计算日辰（简化版）
  const dayOffset = Math.floor((date.getTime() - new Date(2000, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
  const riGanIndex = dayOffset % 10;
  const riZhiIndex = dayOffset % 12;
  const riChen = TIAN_GAN[riGanIndex] + DI_ZHI[riZhiIndex];

  // 计算月建
  const yueJianIndex = (month + 1) % 12;
  const yueJian = DI_ZHI[yueJianIndex];

  // 计算空亡（根据日柱）
  const kongWangStart = (riZhiIndex + 10) % 12;
  const kongWang = [DI_ZHI[kongWangStart], DI_ZHI[(kongWangStart + 1) % 12]];

  return { riChen, yueJian, kongWang };
}

/**
 * 获取卦宫五行
 */
function getGongWuXing(gongWei: string): string {
  const wuXingMap: Record<string, string> = {
    '乾宫': '金', '兑宫': '金',
    '离宫': '火',
    '震宫': '木', '巽宫': '木',
    '坎宫': '水',
    '艮宫': '土', '坤宫': '土',
  };
  return wuXingMap[gongWei] || '金';
}

/**
 * 计算六亲
 */
function calculateLiuQin(gongWuXing: string, naZhi: string): string {
  const zhiWuXing = DIZHI_WUXING[naZhi];
  return LIU_QIN_RELATIONS[gongWuXing]?.[zhiWuXing] || '兄弟';
}

/**
 * 计算伏神
 */
function calculateFuShen(
  position: number,
  gongWei: string,
  existingNaZhi: string[]
): { naZhi: string; liuQin: string; isFeiShenExists: boolean } | undefined {
  // 获取本宫卦（八纯卦）的纳甲
  const benGongNaJia = NA_JIA_MAP[gongWei.replace('宫', '')];
  if (!benGongNaJia) return undefined;

  const fuShenZhi = benGongNaJia[position - 1];
  if (!fuShenZhi || existingNaZhi.includes(fuShenZhi)) return undefined;

  const gongWuXing = getGongWuXing(gongWei);
  const liuQin = calculateLiuQin(gongWuXing, fuShenZhi);

  return {
    naZhi: fuShenZhi,
    liuQin,
    isFeiShenExists: existingNaZhi.includes(fuShenZhi),
  };
}

/**
 * 计算日月对爻的影响
 */
function calculateDayMonthEffect(
  naZhi: string,
  yueJian: string,
  riChen: string
): { dayEffect?: string; monthEffect?: string; isKongWang: boolean } {
  const riZhi = riChen.charAt(1);
  const kongWangStart = (DI_ZHI.indexOf(riZhi) + 10) % 12;
  const isKongWang = naZhi === DI_ZHI[kongWangStart] || naZhi === DI_ZHI[(kongWangStart + 1) % 12];

  let monthEffect: string | undefined;
  let dayEffect: string | undefined;

  // 月建影响
  if (naZhi === yueJian) {
    monthEffect = '临月建';
  } else if (DI_ZHI_LIU_CHONG[naZhi] === yueJian) {
    monthEffect = '月破';
  } else {
    const naZhiWX = DIZHI_WUXING[naZhi];
    const yueJianWX = DIZHI_WUXING[yueJian];
    if (naZhiWX === yueJianWX) {
      monthEffect = '得月扶';
    }
  }

  // 日辰影响
  if (naZhi === riZhi) {
    dayEffect = '临日辰';
  } else if (DI_ZHI_LIU_CHONG[naZhi] === riZhi) {
    dayEffect = '日冲';
  } else if (DI_ZHI_LIU_HE[naZhi] === riZhi) {
    dayEffect = '日合';
  }

  return { dayEffect, monthEffect, isKongWang };
}

/**
 * 分析用神
 */
function analyzeYongShen(question: string, liuQin: string[]): { yongShen?: string; xiShen?: string; jiShen?: string; chouShen?: string } {
  const questionLower = question.toLowerCase();

  // 根据问题类型判断用神
  if (questionLower.includes('财') || questionLower.includes('钱') || questionLower.includes('生意')) {
    const idx = liuQin.indexOf('妻财');
    return {
      yongShen: idx >= 0 ? `第${idx + 1}爻（妻财）` : '妻财',
      xiShen: '子孙（生财之源）',
      jiShen: '兄弟（克财之神）',
      chouShen: '父母（耗财之神）',
    };
  }

  if (questionLower.includes('官') || questionLower.includes('工作') || questionLower.includes('升职')) {
    const idx = liuQin.indexOf('官鬼');
    return {
      yongShen: idx >= 0 ? `第${idx + 1}爻（官鬼）` : '官鬼',
      xiShen: '妻财（生官之源）',
      jiShen: '子孙（克官之神）',
      chouShen: '父母（泄官之气）',
    };
  }

  if (questionLower.includes('感情') || questionLower.includes('婚姻') || questionLower.includes('对象')) {
    // 男测妻财，女测官鬼
    return {
      yongShen: '男看妻财，女看官鬼',
      xiShen: '应爻（对方）',
      jiShen: '兄弟（竞争者）',
      chouShen: '父母（阻碍）',
    };
  }

  if (questionLower.includes('父母') || questionLower.includes('长辈') || questionLower.includes('学业')) {
    const idx = liuQin.indexOf('父母');
    return {
      yongShen: idx >= 0 ? `第${idx + 1}爻（父母）` : '父母',
      xiShen: '官鬼（生父母之源）',
      jiShen: '妻财（克父母之神）',
      chouShen: '子孙（泄父母之气）',
    };
  }

  if (questionLower.includes('孩子') || questionLower.includes('子女') || questionLower.includes('怀孕')) {
    const idx = liuQin.indexOf('子孙');
    return {
      yongShen: idx >= 0 ? `第${idx + 1}爻（子孙）` : '子孙',
      xiShen: '兄弟（生子孙之源）',
      jiShen: '父母（克子孙之神）',
      chouShen: '官鬼（泄子孙之气）',
    };
  }

  return {
    yongShen: '世爻（自己）',
    xiShen: '应爻（对方/事情）',
    jiShen: '忌神',
    chouShen: '仇神',
  };
}

/**
 * 增强的六爻计算
 */
export function calculateLiuYaoEnhanced(
  guaXiang: string,
  dongYao: number[],
  method: 'number' | 'time' | 'manual',
  timestamp: Date = new Date(),
  question?: string
): LiuYaoResult {
  // 获取卦的详细信息
  const guaData = LIU_SI_SI_GUA[guaXiang] || {
    name: GUA_NAMES[guaXiang] || '未知卦',
    guaCi: '',
    xiangYue: '',
    tuanCi: '',
    yao: ['', '', '', '', '', ''],
    xiaoXiang: ['', '', '', '', '', ''],
    wuXing: '金',
    gongWei: '乾宫',
    shiYao: 3,
    yingYao: 6,
    naJia: NA_JIA_MAP['乾'] || ['子', '寅', '辰', '午', '申', '戌'],
  };

  const { riChen, yueJian, kongWang } = calculateDayMonthInfo(timestamp);

  // 分离上下卦
  const lowerBinary = guaXiang.substring(0, 3);
  const upperBinary = guaXiang.substring(3, 6);

  // 获取世应位置
  const shiYing = SHI_YING_POSITIONS[guaXiang] || { shi: guaData.shiYao, ying: guaData.yingYao };

  // 获取日干
  const riGan = riChen.charAt(0);
  const liuShenOrder = LIU_SHEN_CONFIG[riGan] || ['青龙', '朱雀', '勾陈', '螣蛇', '白虎', '玄武'];

  // 构建本卦
  const benGuaYaoList: YaoInfo[] = [];
  const existingNaZhi: string[] = [];

  for (let i = 0; i < 6; i++) {
    const position = i + 1;
    const isYang = guaXiang[5 - i] === '1';
    const isDong = dongYao.includes(position);
    const naZhi = guaData.naJia[i];
    existingNaZhi.push(naZhi);

    const liuQin = calculateLiuQin(guaData.wuXing, naZhi);
    const liuShen = liuShenOrder[i];
    const { dayEffect, monthEffect, isKongWang } = calculateDayMonthEffect(naZhi, yueJian, riChen);

    benGuaYaoList.push({
      position,
      isYang,
      isDong,
      isChange: isDong,
      yaoText: guaData.yao[i],
      xiaoXiang: guaData.xiaoXiang[i],
      naZhi,
      liuQin,
      liuShen,
      dayEffect,
      monthEffect,
      isKongWang,
    });
  }

  // 计算伏神
  for (let i = 0; i < 6; i++) {
    const fuShen = calculateFuShen(i + 1, guaData.gongWei, existingNaZhi);
    if (fuShen) {
      benGuaYaoList[i].fuShen = fuShen;
    }
  }

  const benGua: GuaInfo = {
    guaXiang,
    name: guaData.name,
    guaCi: guaData.guaCi,
    xiangYue: guaData.xiangYue,
    tuanCi: guaData.tuanCi,
    wuXing: guaData.wuXing,
    gongWei: guaData.gongWei,
    upperGua: BA_GUA[upperBinary]?.name || '未知',
    lowerGua: BA_GUA[lowerBinary]?.name || '未知',
    yaoList: benGuaYaoList,
    naJia: guaData.naJia,
    shiYao: shiYing.shi,
    yingYao: shiYing.ying,
  };

  // 计算变卦
  let bianGua: GuaInfo | undefined;
  if (dongYao.length > 0) {
    let bianGuaXiang = '';
    for (let i = 5; i >= 0; i--) {
      const position = 6 - i;
      if (dongYao.includes(position)) {
        bianGuaXiang += guaXiang[i] === '1' ? '0' : '1';
      } else {
        bianGuaXiang += guaXiang[i];
      }
    }

    const bianGuaData = LIU_SI_SI_GUA[bianGuaXiang] || {
      name: GUA_NAMES[bianGuaXiang] || '未知卦',
      guaCi: '',
      xiangYue: '',
      tuanCi: '',
      yao: ['', '', '', '', '', ''],
      xiaoXiang: ['', '', '', '', '', ''],
      wuXing: '金',
      gongWei: '乾宫',
      shiYao: 3,
      yingYao: 6,
      naJia: guaData.naJia,
    };

    const bianLowerBinary = bianGuaXiang.substring(0, 3);
    const bianUpperBinary = bianGuaXiang.substring(3, 6);

    const bianYaoList: YaoInfo[] = [];
    for (let i = 0; i < 6; i++) {
      bianYaoList.push({
        position: i + 1,
        isYang: bianGuaXiang[5 - i] === '1',
        isDong: false,
        isChange: false,
        yaoText: bianGuaData.yao[i],
        xiaoXiang: bianGuaData.xiaoXiang[i],
      });
    }

    bianGua = {
      guaXiang: bianGuaXiang,
      name: bianGuaData.name,
      guaCi: bianGuaData.guaCi,
      xiangYue: bianGuaData.xiangYue,
      tuanCi: bianGuaData.tuanCi,
      wuXing: bianGuaData.wuXing,
      gongWei: bianGuaData.gongWei,
      upperGua: BA_GUA[bianUpperBinary]?.name || '未知',
      lowerGua: BA_GUA[bianLowerBinary]?.name || '未知',
      yaoList: bianYaoList,
      naJia: bianGuaData.naJia,
      shiYao: 3,
      yingYao: 6,
    };
  }

  // 分析用神
  const yongShenAnalysis = question ? analyzeYongShen(question, benGuaYaoList.map(y => y.liuQin || '')) : undefined;

  return {
    benGua,
    bianGua,
    dongYao,
    shiYao: shiYing.shi,
    yingYao: shiYing.ying,
    liuQin: benGuaYaoList.map(y => y.liuQin || '兄弟'),
    liuShen: benGuaYaoList.map(y => y.liuShen || '青龙'),
    method,
    timestamp,
    question,
    year: timestamp.getFullYear().toString(),
    month: (timestamp.getMonth() + 1).toString(),
    day: timestamp.getDate().toString(),
    hour: timestamp.getHours().toString(),
    yueJian,
    riChen,
    kongWang,
    ...yongShenAnalysis,
  };
}
