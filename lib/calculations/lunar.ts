import { Lunar, Solar } from 'lunar-typescript';

export interface LunarDate {
  year: number;
  month: number;
  day: number;
  isLeap: boolean;
}

export interface DateTimeInfo {
  solar: Date;
  lunar: LunarDate;
  ganZhiYear: string;
  ganZhiMonth: string;
  ganZhiDay: string;
  zodiac: string;
  solarTerm: string | null;
}

/**
 * Convert solar date to lunar date with gan-zhi info
 */
export function solarToLunar(date: Date): DateTimeInfo {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();

  return {
    solar: date,
    lunar: {
      year: lunar.getYear(),
      month: lunar.getMonth(),
      day: lunar.getDay(),
      isLeap: lunar.getDay() === 0, // Check if leap month
    },
    ganZhiYear: lunar.getYearInGanZhi(),
    ganZhiMonth: lunar.getMonthInGanZhi(),
    ganZhiDay: lunar.getDayInGanZhi(),
    zodiac: lunar.getYearShengXiao(),
    solarTerm: lunar.getJieQi() || null,
  };
}

/**
 * Convert lunar date to solar date
 */
export function lunarToSolar(lunarDate: LunarDate): Date {
  const lunar = Lunar.fromYmd(
    lunarDate.year,
    lunarDate.month,
    lunarDate.day
  );
  const solar = lunar.getSolar();
  return new Date(solar.getYear(), solar.getMonth() - 1, solar.getDay());
}

/**
 * Get gan-zhi for a specific hour
 * Note: In Chinese astrology, the day starts at 23:00 (zi hour)
 */
export function getGanZhiHour(
  dayGanZhi: string,
  hour: number
): string {
  // Zi hour starts at 23:00
  const adjustedHour = hour >= 23 ? 0 : hour;

  // Get the hour branch index (0-11)
  const hourBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  const hourIndex = Math.floor((adjustedHour + 1) / 2) % 12;
  const branch = hourBranches[hourIndex];

  // Calculate hour stem based on day stem
  const stems = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  const dayStem = dayGanZhi.charAt(0);
  const dayStemIndex = stems.indexOf(dayStem);

  // Hour stem formula: dayStemIndex * 2 + hourIndex (mod 10)
  const hourStemIndex = (dayStemIndex * 2 + hourIndex) % 10;
  const stem = stems[hourStemIndex];

  return `${stem}${branch}`;
}

/**
 * Check if a solar date is in a leap month
 */
export function isLeapMonth(date: Date): boolean {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  return lunar.getDay() === 0; // This indicates leap month
}

/**
 * Get solar term (节气) for a date
 */
export function getSolarTerm(date: Date): string | null {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  return lunar.getJieQi() || null;
}

/**
 * Check if two dates are in the same Chinese zodiac year
 * Note: Chinese New Year usually falls between Jan 21 and Feb 20
 */
export function getChineseZodiacYear(date: Date): number {
  const info = solarToLunar(date);
  return info.lunar.year;
}

/**
 * Get the zodiac animal for a year
 */
export function getZodiacAnimal(year: number): string {
  const animals = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
  // 2020 is year of rat (鼠)
  const baseYear = 2020;
  const index = ((year - baseYear) % 12 + 12) % 12;
  return animals[index];
}
