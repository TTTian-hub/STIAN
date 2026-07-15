import { Lunar, Solar } from 'lunar-typescript';
import { getGanZhiHour } from './lunar';

// 天干
export const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
export const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 五行
export const WUXING = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// 阴阳
export const YINYANG = {
  '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳',
  '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴',
  '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴', '辰': '阳',
  '巳': '阴', '午': '阳', '未': '阴', '申': '阳', '酉': '阴',
  '戌': '阳', '亥': '阴',
};

export interface BaziPillar {
  gan: string;      // 天干
  zhi: string;      // 地支
  ganWuxing: string; // 天干五行
  zhiWuxing: string; // 地支五行
  ganYinYang: string; // 天干阴阳
  zhiYinYang: string; // 地支阴阳
  cangGan: string[];  // 藏干
}

export interface BaziResult {
  year: BaziPillar;
  month: BaziPillar;
  day: BaziPillar;
  hour: BaziPillar | null;  // 时间不确定时为 null
  zodiac: string;     // 生肖
  solar: Date;
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  timeUnknown: boolean;  // 标记时间是否不确定
}

/**
 * Calculate BaZi (Four Pillars of Destiny) from birth date and time
 * @param birthDate - Birth date
 * @param hour - Birth hour (0-23), -1 表示时间不确定
 * @param isEarlyZi - If true, treats 23:00-00:00 as previous day (早子时)
 * @param timeUnknown - If true, hour pillar will be null
 */
export function calculateBazi(
  birthDate: Date,
  hour: number,
  isEarlyZi: boolean = false,
  timeUnknown: boolean = false
): BaziResult {
  // Handle zi hour (23:00-00:59)
  let adjustedDate = new Date(birthDate);
  let adjustedHour = hour;

  if (!timeUnknown && hour >= 23 && isEarlyZi) {
    // 早子时：23:00-00:00 算作当天
    adjustedHour = 0;
  } else if (!timeUnknown && hour < 1) {
    // 晚子时或正常凌晨：00:00-00:59
    adjustedHour = 0;
  }

  const solar = Solar.fromDate(adjustedDate);
  const lunar = solar.getLunar();

  const yearGanZhi = lunar.getYearInGanZhi();
  const monthGanZhi = lunar.getMonthInGanZhi();
  const dayGanZhi = lunar.getDayInGanZhi();

  const createPillar = (ganZhi: string): BaziPillar => {
    const gan = ganZhi.charAt(0);
    const zhi = ganZhi.charAt(1);

    return {
      gan,
      zhi,
      ganWuxing: WUXING[gan as keyof typeof WUXING],
      zhiWuxing: WUXING[zhi as keyof typeof WUXING],
      ganYinYang: YINYANG[gan as keyof typeof YINYANG],
      zhiYinYang: YINYANG[zhi as keyof typeof YINYANG],
      cangGan: getCangGan(zhi),
    };
  };

  // 如果时间不确定，时柱为 null
  let hourPillar: BaziPillar | null = null;
  if (!timeUnknown && hour >= 0) {
    const hourGanZhi = getGanZhiHour(dayGanZhi, adjustedHour);
    hourPillar = createPillar(hourGanZhi);
  }

  return {
    year: createPillar(yearGanZhi),
    month: createPillar(monthGanZhi),
    day: createPillar(dayGanZhi),
    hour: hourPillar,
    zodiac: lunar.getYearShengXiao(),
    solar: adjustedDate,
    lunarYear: lunar.getYear(),
    lunarMonth: lunar.getMonth(),
    lunarDay: lunar.getDay(),
    timeUnknown: timeUnknown || hour < 0,
  };
}

/**
 * Get hidden stems (藏干) for a branch
 */
function getCangGan(zhi: string): string[] {
  const cangGanMap: Record<string, string[]> = {
    '子': ['癸'],
    '丑': ['己', '癸', '辛'],
    '寅': ['甲', '丙', '戊'],
    '卯': ['乙'],
    '辰': ['戊', '乙', '癸'],
    '巳': ['丙', '庚', '戊'],
    '午': ['丁', '己'],
    '未': ['己', '丁', '乙'],
    '申': ['庚', '壬', '戊'],
    '酉': ['辛'],
    '戌': ['戊', '辛', '丁'],
    '亥': ['壬', '甲'],
  };
  return cangGanMap[zhi] || [];
}

/**
 * Format BaZi as string
 */
export function formatBazi(bazi: BaziResult): string {
  const year = `${bazi.year.gan}${bazi.year.zhi}`;
  const month = `${bazi.month.gan}${bazi.month.zhi}`;
  const day = `${bazi.day.gan}${bazi.day.zhi}`;
  const hour = bazi.hour ? `${bazi.hour.gan}${bazi.hour.zhi}` : "??";
  return `${year} ${month} ${day} ${hour}`;
}
