import { Lunar, Solar } from 'lunar-typescript';
import { TIANGAN, DIZHI } from './bazi';

export interface Dayun {
  ganZhi: string;
  gan: string;
  zhi: string;
  ageStart: number;
  ageEnd: number;
  yearStart: number;
  yearEnd: number;
}

/**
 * Calculate Dayun (Big Luck cycles)
 * @param birthYear - Birth year (lunar)
 * @param birthMonth - Birth month (lunar)
 * @param birthDay - Birth day (lunar)
 * @param gender - Gender: 'male' or 'female'
 * @returns Array of 10 Dayun cycles
 */
export function calculateDayun(
  birthYear: number,
  birthMonth: number,
  birthDay: number,
  gender: 'male' | 'female'
): Dayun[] {
  const lunar = Lunar.fromYmd(birthYear, birthMonth, birthDay);
  const yearGanZhi = lunar.getYearInGanZhi();
  const monthGanZhi = lunar.getMonthInGanZhi();

  const yearGan = yearGanZhi.charAt(0);
  const yearStemIndex = TIANGAN.indexOf(yearGan);
  const isYearYang = yearStemIndex % 2 === 0;

  // Determine direction: male with yang year or female with yin year = forward
  const isMale = gender === 'male';
  const goForward = (isMale && isYearYang) || (!isMale && !isYearYang);

  const monthGan = monthGanZhi.charAt(0);
  const monthZhi = monthGanZhi.charAt(1);

  const dayunList: Dayun[] = [];

  // Generate 10 Dayun cycles
  let currentGanIndex = TIANGAN.indexOf(monthGan);
  let currentZhiIndex = DIZHI.indexOf(monthZhi);

  // Calculate starting age (simplified: usually 3-4 years old)
  const startAge = 3;

  for (let i = 0; i < 10; i++) {
    // Move to next/previous
    if (goForward) {
      currentGanIndex = (currentGanIndex + 1) % 10;
      currentZhiIndex = (currentZhiIndex + 1) % 12;
    } else {
      currentGanIndex = (currentGanIndex - 1 + 10) % 10;
      currentZhiIndex = (currentZhiIndex - 1 + 12) % 12;
    }

    const gan = TIANGAN[currentGanIndex];
    const zhi = DIZHI[currentZhiIndex];

    const ageStart = startAge + i * 10;
    const ageEnd = ageStart + 9;

    const birthYearNum = Solar.fromDate(new Date()).getYear();
    const yearStart = birthYearNum - (new Date().getFullYear() - birthYear) + ageStart;

    dayunList.push({
      ganZhi: `${gan}${zhi}`,
      gan,
      zhi,
      ageStart,
      ageEnd,
      yearStart,
      yearEnd: yearStart + 9,
    });
  }

  return dayunList;
}

/**
 * Find current Dayun based on age
 */
export function getCurrentDayun(dayunList: Dayun[], age: number): Dayun | null {
  return dayunList.find(d => age >= d.ageStart && age <= d.ageEnd) || null;
}
