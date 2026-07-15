import { BaziResult, BaziPillar, WUXING } from './bazi';

export const WUXING_NAMES = ['金', '木', '水', '火', '土'];

export interface WuxingStat {
  name: string;
  count: number;
  ganCount: number;
  zhiCount: number;
  cangGanCount: number;
  percentage: number;
}

export interface WuxingAnalysis {
  stats: WuxingStat[];
  dominant: string;
  weak: string;
  dayMasterWuxing: string;
  balance: 'balanced' | 'strong' | 'weak';
}

/**
 * Count Wuxing elements in a BaZi chart
 */
export function countWuxing(bazi: BaziResult): WuxingAnalysis {
  const counts: Record<string, { gan: number; zhi: number; cangGan: number }> = {
    '金': { gan: 0, zhi: 0, cangGan: 0 },
    '木': { gan: 0, zhi: 0, cangGan: 0 },
    '水': { gan: 0, zhi: 0, cangGan: 0 },
    '火': { gan: 0, zhi: 0, cangGan: 0 },
    '土': { gan: 0, zhi: 0, cangGan: 0 },
  };

  // Count year pillar
  countInPillar(bazi.year, counts);
  // Count month pillar
  countInPillar(bazi.month, counts);
  // Count day pillar
  countInPillar(bazi.day, counts);
  // Count hour pillar (if available)
  if (bazi.hour) {
    countInPillar(bazi.hour, counts);
  }

  const total = Object.values(counts).reduce(
    (sum, c) => sum + c.gan + c.zhi + c.cangGan,
    0
  );

  const stats: WuxingStat[] = WUXING_NAMES.map(name => {
    const count = counts[name];
    const totalCount = count.gan + count.zhi + count.cangGan;
    return {
      name,
      count: totalCount,
      ganCount: count.gan,
      zhiCount: count.zhi,
      cangGanCount: count.cangGan,
      percentage: total > 0 ? Math.round((totalCount / total) * 100) : 0,
    };
  });

  // Sort by count descending
  stats.sort((a, b) => b.count - a.count);

  const dominant = stats[0].name;
  const weak = stats[stats.length - 1].name;

  // Determine balance
  const dayMasterWuxing = WUXING[bazi.day.gan as keyof typeof WUXING];

  // Calculate if day master is strong or weak
  // Simplified: check if supporting elements are dominant
  const supportMap: Record<string, string[]> = {
    '金': ['土', '金'],
    '木': ['水', '木'],
    '水': ['金', '水'],
    '火': ['木', '火'],
    '土': ['火', '土'],
  };

  const supportElements = supportMap[dayMasterWuxing];
  const supportCount = stats
    .filter(s => supportElements.includes(s.name))
    .reduce((sum, s) => sum + s.count, 0);

  const totalCount = stats.reduce((sum, s) => sum + s.count, 0);
  const supportRatio = totalCount > 0 ? supportCount / totalCount : 0;

  let balance: 'balanced' | 'strong' | 'weak';
  if (supportRatio > 0.6) {
    balance = 'strong';
  } else if (supportRatio < 0.4) {
    balance = 'weak';
  } else {
    balance = 'balanced';
  }

  return {
    stats,
    dominant,
    weak,
    dayMasterWuxing,
    balance,
  };
}

function countInPillar(
  pillar: BaziPillar,
  counts: Record<string, { gan: number; zhi: number; cangGan: number }>
) {
  // Count stem
  const ganWuxing = WUXING[pillar.gan as keyof typeof WUXING];
  if (ganWuxing) {
    counts[ganWuxing].gan++;
  }

  // Count branch
  const zhiWuxing = WUXING[pillar.zhi as keyof typeof WUXING];
  if (zhiWuxing) {
    counts[zhiWuxing].zhi++;
  }

  // Count hidden stems
  pillar.cangGan.forEach(gan => {
    const cangGanWuxing = WUXING[gan as keyof typeof WUXING];
    if (cangGanWuxing) {
      counts[cangGanWuxing].cangGan++;
    }
  });
}

/**
 * Get Wuxing color for visualization
 */
export function getWuxingColor(wuxing: string): string {
  const colors: Record<string, string> = {
    '金': '#F59E0B', // Amber
    '木': '#10B981', // Emerald
    '水': '#3B82F6', // Blue
    '火': '#EF4444', // Red
    '土': '#92400E', // Brown
  };
  return colors[wuxing] || '#6B7280';
}

/**
 * Get Wuxing description
 */
export function getWuxingDescription(wuxing: string): string {
  const descriptions: Record<string, string> = {
    '金': '刚毅果断，重义气，有决断力',
    '木': '仁慈正直，有上进心，善于规划',
    '水': '聪明灵活，善于应变，有智慧',
    '火': '热情礼貌，积极进取，有领导力',
    '土': '诚实守信，稳重踏实，有包容心',
  };
  return descriptions[wuxing] || '';
}
