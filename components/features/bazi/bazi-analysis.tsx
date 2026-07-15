'use client';

import { BaziResult } from "@/lib/calculations/bazi";
import { ShishenInfo } from "@/lib/calculations/shishen";
import { WuxingAnalysis } from "@/lib/calculations/wuxing";
import { Progress } from "@/components/ui/progress";
import { getWuxingColor } from "@/lib/calculations/wuxing";
import { Star, TrendingUp, Heart, Briefcase, Coins, Users } from "lucide-react";

interface BaziAnalysisProps {
  bazi: BaziResult | null;
  shishen: {
    year: ShishenInfo;
    month: ShishenInfo;
    day: ShishenInfo;
    hour?: ShishenInfo;
    dayMaster: string;
  } | null;
  wuxing: WuxingAnalysis | null;
}

// 计算五行平衡度
function calculateBalanceScore(wuxing: WuxingAnalysis): number {
  const counts = wuxing.stats.map((s) => s.count);
  const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
  const variance = counts.reduce((sum, c) => sum + Math.pow(c - avg, 2), 0) / counts.length;
  // 方差越小越平衡，满分100
  return Math.max(0, Math.min(100, 100 - variance * 20));
}

// 计算各方面运势
function calculateFortuneScores(bazi: BaziResult, wuxing: WuxingAnalysis) {
  const dayMaster = bazi.day.gan;
  const dayMasterWuxing = ['甲', '乙'].includes(dayMaster) ? '木' :
    ['丙', '丁'].includes(dayMaster) ? '火' :
    ['戊', '己'].includes(dayMaster) ? '土' :
    ['庚', '辛'].includes(dayMaster) ? '金' : '水';

  // 根据五行分布计算各领域运势
  const wuxingMap: Record<string, number> = {};
  wuxing.stats.forEach((s) => {
    wuxingMap[s.name] = s.count;
  });

  // 事业：看官星（克日主的五行）
  const careerWuxing = dayMasterWuxing === '木' ? '金' :
    dayMasterWuxing === '火' ? '水' :
    dayMasterWuxing === '土' ? '木' :
    dayMasterWuxing === '金' ? '火' : '土';
  const careerScore = Math.min(95, 60 + (wuxingMap[careerWuxing] || 0) * 15);

  // 财运：看财星（日主克的五行）
  const wealthWuxing = dayMasterWuxing === '木' ? '土' :
    dayMasterWuxing === '火' ? '金' :
    dayMasterWuxing === '土' ? '水' :
    dayMasterWuxing === '金' ? '木' : '火';
  const wealthScore = Math.min(95, 60 + (wuxingMap[wealthWuxing] || 0) * 15);

  // 感情：看桃花（子、午、卯、酉）
  const hasTaohua = ['子', '午', '卯', '酉'].includes(bazi.day.zhi) ||
    ['子', '午', '卯', '酉'].includes(bazi.year.zhi);
  const loveScore = hasTaohua ? 85 : 70;

  // 健康：看五行平衡
  const healthScore = calculateBalanceScore(wuxing);

  // 人际：看食伤（日主生的五行）
  const peopleWuxing = dayMasterWuxing === '木' ? '火' :
    dayMasterWuxing === '火' ? '土' :
    dayMasterWuxing === '土' ? '金' :
    dayMasterWuxing === '金' ? '水' : '木';
  const peopleScore = Math.min(95, 60 + (wuxingMap[peopleWuxing] || 0) * 15);

  return {
    career: Math.round(careerScore),
    wealth: Math.round(wealthScore),
    love: Math.round(loveScore),
    health: Math.round(healthScore),
    people: Math.round(peopleScore),
  };
}

// 获取日主特性
function getDayMasterCharacteristic(dayMaster: string): string {
  const characteristics: Record<string, string> = {
    '甲': '如参天大树，正直向上，有领导力',
    '乙': '如花草藤蔓，柔韧适应，善于协调',
    '丙': '如太阳之火，热情开朗，光芒四射',
    '丁': '如灯烛之火，细腻温柔，注重细节',
    '戊': '如城墙之土，稳重踏实，值得信赖',
    '己': '如田园之土，包容滋养，善于培育',
    '庚': '如剑戟之金，刚毅果断，执行力强',
    '辛': '如珠玉之金，精致优雅，追求完美',
    '壬': '如江河之水，智慧流动，善于变通',
    '癸': '如雨露之水，细腻温柔，善于渗透',
  };
  return characteristics[dayMaster] || '性格独特';
}

export function BaziAnalysis({ bazi, shishen, wuxing }: BaziAnalysisProps) {
  if (!bazi || !shishen || !wuxing) return null;

  const scores = calculateFortuneScores(bazi, wuxing);
  const balanceScore = calculateBalanceScore(wuxing);
  const dayMasterDesc = getDayMasterCharacteristic(bazi.day.gan);

  const fortuneItems = [
    { icon: Briefcase, label: '事业运', score: scores.career, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Coins, label: '财运', score: scores.wealth, color: 'text-amber-600', bg: 'bg-amber-50' },
    { icon: Heart, label: '感情运', score: scores.love, color: 'text-rose-600', bg: 'bg-rose-50' },
    { icon: TrendingUp, label: '健康运', score: scores.health, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Users, label: '人际运', score: scores.people, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-4">
      {/* 综合评分 */}
      <div className="bg-white rounded-xl border border-cyan-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-slate-800">八字综合分析</h3>
        </div>

        <div className="text-center mb-4">
          <div className="text-4xl font-bold text-cyan-600 mb-1">
            {Math.round((scores.career + scores.wealth + scores.love + scores.health + scores.people) / 5)}
          </div>
          <p className="text-sm text-slate-500">综合运势评分</p>
        </div>

        <div className="space-y-3">
          {fortuneItems.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span className={`text-sm font-medium ${item.color}`}>{item.score}分</span>
                </div>
                <Progress value={item.score} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 日主分析 */}
      <div className="bg-white rounded-xl border border-cyan-100 p-4">
        <h3 className="font-semibold text-slate-800 mb-3">日主特性</h3>
        <div className="flex items-start gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold"
            style={{
              backgroundColor: `${getWuxingColor(wuxing.stats[0].name)}20`,
              color: getWuxingColor(wuxing.stats[0].name),
            }}
          >
            {bazi.day.gan}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-700 mb-1">
              {bazi.day.gan}日主 · {wuxing.dayMasterWuxing}命
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">{dayMasterDesc}</p>
          </div>
        </div>
      </div>

      {/* 五行平衡 */}
      <div className="bg-white rounded-xl border border-cyan-100 p-4">
        <h3 className="font-semibold text-slate-800 mb-3">五行分布</h3>
        <div className="space-y-2">
          {wuxing.stats.map((stat) => (
            <div key={stat.name} className="flex items-center gap-3">
              <span
                className="w-6 text-center text-sm font-medium"
                style={{ color: getWuxingColor(stat.name) }}
              >
                {stat.name}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(stat.count / 8) * 100}%`,
                        backgroundColor: getWuxingColor(stat.name),
                      }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-6 text-right">{stat.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">五行平衡度</span>
            <span className={`text-sm font-medium ${balanceScore >= 70 ? 'text-green-600' : balanceScore >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
              {balanceScore >= 70 ? '良好' : balanceScore >= 50 ? '一般' : '失衡'} ({Math.round(balanceScore)}%)
            </span>
          </div>
        </div>
      </div>

      {/* 十神分析 */}
      <div className="bg-white rounded-xl border border-cyan-100 p-4">
        <h3 className="font-semibold text-slate-800 mb-3">十神分布</h3>
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-slate-400 mb-1">年柱</p>
            <p className="font-medium text-slate-700">{shishen.year.name}</p>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg">
            <p className="text-slate-400 mb-1">月柱</p>
            <p className="font-medium text-slate-700">{shishen.month.name}</p>
          </div>
          <div className="p-2 bg-cyan-50 rounded-lg border border-cyan-100">
            <p className="text-cyan-600 mb-1">日柱(日主)</p>
            <p className="font-medium text-cyan-700">{shishen.day.name}</p>
          </div>
          {shishen.hour ? (
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-slate-400 mb-1">时柱</p>
              <p className="font-medium text-slate-700">{shishen.hour.name}</p>
            </div>
          ) : (
            <div className="p-2 bg-slate-50 rounded-lg">
              <p className="text-slate-400 mb-1">时柱</p>
              <p className="font-medium text-slate-400">未知</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
