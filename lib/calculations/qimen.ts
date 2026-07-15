import { Solar, Lunar } from 'lunar-typescript';

// 奇门遁甲九宫格数据
export const QIMEN_GONGS = ['坎一宫', '坤二宫', '震三宫', '巽四宫', '中五宫', '乾六宫', '兑七宫', '艮八宫', '离九宫'];

// 八门
export const BA_MEN = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];

// 九星
export const JIU_XING = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心', '天禽'];

// 八神
export const BA_SHEN = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];

// 天干
export const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
export const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

export interface QimenGong {
  position: number; // 1-9
  name: string;
  gongWei: string; // 坎、坤、震等
  tianPan?: string; // 天盘
  diPan?: string; // 地盘
  men?: string; // 八门
  xing?: string; // 九星
  shen?: string; // 八神
}

export interface QimenResult {
  juShu: number; // 局数 (1-9)
  yinYang: '阳遁' | '阴遁';
  zhiFuXing: string; // 值符星
  zhiShiMen: string; // 值使门
  gongs: QimenGong[];
  solar: Date;
  jieQi: string;
  dunJiaMethod: string;
  juXing: string; // 局型，如「阳遁一局」
  riGan: string; // 日干，如「甲」
  shiGan: string; // 时干，如「乙」
}

/**
 * 起奇门遁甲局（拆补法简化版）
 * @param date - 起局时间
 * @param method - 起局方法: 'chaibu'(拆补), 'zhirun'(置闰), 'maoshan'(茅山)
 */
export function calculateQimen(
  date: Date,
  method: 'chaibu' | 'zhirun' | 'maoshan' = 'chaibu'
): QimenResult {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  // 获取节气
  const jieQi = lunar.getJieQi() || '冬至';

  // 确定阴阳遁
  const yangDunJieQi = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种'];
  const yinDunJieQi = ['夏至', '小暑', '大暑', '立秋', '处暑', '白露', '秋分', '寒露', '霜降', '立冬', '小雪', '大雪'];

  let yinYang: '阳遁' | '阴遁';
  if (yangDunJieQi.includes(jieQi)) {
    yinYang = '阳遁';
  } else {
    yinYang = '阴遁';
  }

  // 简化的局数计算（根据节气）
  const juShuMap: Record<string, number> = {
    '冬至': 1, '小寒': 2, '大寒': 3,
    '立春': 8, '雨水': 9, '惊蛰': 1,
    '春分': 3, '清明': 4, '谷雨': 5,
    '立夏': 4, '小满': 5, '芒种': 6,
    '夏至': 9, '小暑': 8, '大暑': 7,
    '立秋': 2, '处暑': 1, '白露': 9,
    '秋分': 7, '寒露': 6, '霜降': 5,
    '立冬': 6, '小雪': 5, '大雪': 4,
  };

  const juShu = juShuMap[jieQi] || 1;

  // 生成九宫格
  const gongs: QimenGong[] = QIMEN_GONGS.map((name, index) => ({
    position: index + 1,
    name,
    gongWei: name.charAt(0),
    tianPan: undefined,
    diPan: undefined,
    men: undefined,
    xing: undefined,
    shen: undefined,
  }));

  // 地盘（固定）
  // 阳遁顺布六仪逆布三奇，阴遁逆布六仪顺布三奇
  const diPanStems = generateDiPan(yinYang, juShu);
  gongs.forEach((gong, i) => {
    gong.diPan = diPanStems[i];
  });

  // 简化的排盘逻辑（实际应用需要更复杂的计算）
  // 值符星和值使门根据旬首确定
  const zhiFuXing = JIU_XING[0]; // 简化：天蓬为值符
  const zhiShiMen = BA_MEN[0]; // 简化：休门为值使

  const juXing = `${yinYang}${juShu}局`; // 局型，如「阳遁一局」
  const riGan = lunar.getDayGan(); // 日干
  const shiGan = lunar.getGan(); // 时干

  return {
    juShu,
    yinYang,
    zhiFuXing,
    zhiShiMen,
    gongs,
    solar: date,
    jieQi,
    dunJiaMethod: method,
    juXing,
    riGan,
    shiGan,
  };
}

/**
 * 生成地盘天干
 */
function generateDiPan(yinYang: '阳遁' | '阴遁', juShu: number): string[] {
  const liuYi = ['戊', '己', '庚', '辛', '壬', '癸'];
  const sanQi = ['丁', '丙', '乙'];

  const result: string[] = [];

  if (yinYang === '阳遁') {
    // 阳遁：顺布六仪，逆布三奇
    // 从坎一宫开始，按 戊、己、庚、辛、壬、癸、丁、丙、乙 顺序
    const sequence = [...liuYi, ...sanQi.reverse()];
    // 根据局数确定起始位置
    const startIndex = (juShu - 1) % sequence.length;
    for (let i = 0; i < 9; i++) {
      const idx = (startIndex + i) % sequence.length;
      result.push(sequence[idx]);
    }
  } else {
    // 阴遁：逆布六仪，顺布三奇
    const sequence = [...liuYi.reverse(), ...sanQi];
    const startIndex = (9 - juShu) % sequence.length;
    for (let i = 0; i < 9; i++) {
      const idx = (startIndex + i) % sequence.length;
      result.push(sequence[idx]);
    }
  }

  return result;
}

/**
 * 获取宫位信息
 */
export function getGongInfo(position: number): { direction: string; element: string; color: string } {
  const info: Record<number, { direction: string; element: string; color: string }> = {
    1: { direction: '北', element: '水', color: '#3B82F6' },
    2: { direction: '西南', element: '土', color: '#92400E' },
    3: { direction: '东', element: '木', color: '#10B981' },
    4: { direction: '东南', element: '木', color: '#10B981' },
    5: { direction: '中', element: '土', color: '#92400E' },
    6: { direction: '西北', element: '金', color: '#F59E0B' },
    7: { direction: '西', element: '金', color: '#F59E0B' },
    8: { direction: '东北', element: '土', color: '#92400E' },
    9: { direction: '南', element: '火', color: '#EF4444' },
  };

  return info[position] || { direction: '中', element: '土', color: '#92400E' };
}
