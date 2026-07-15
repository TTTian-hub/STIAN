"use client";

import { WuxingAnalysis } from "@/lib/calculations/wuxing";
import { getWuxingColor } from "@/lib/calculations/wuxing";

interface WuxingChartProps {
  wuxing: WuxingAnalysis | null;
}

export function WuxingChart({ wuxing }: WuxingChartProps) {
  if (!wuxing) return null;

  const { stats, dominant, weak, dayMasterWuxing, balance } = wuxing;

  const getBalanceLabel = (balance: string) => {
    switch (balance) {
      case "strong":
        return { label: "身强", color: "#10B981" };
      case "weak":
        return { label: "身弱", color: "#EF4444" };
      default:
        return { label: "平和", color: "#3B82F6" };
    }
  };

  const balanceInfo = getBalanceLabel(balance);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">五行分析</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">日主五行:</span>
          <span
            className="font-medium px-2 py-0.5 rounded"
            style={{
              backgroundColor: `${getWuxingColor(dayMasterWuxing)}20`,
              color: getWuxingColor(dayMasterWuxing),
            }}
          >
            {dayMasterWuxing}
          </span>
          <span
            className="px-2 py-0.5 rounded text-xs"
            style={{
              backgroundColor: `${balanceInfo.color}20`,
              color: balanceInfo.color,
            }}
          >
            {balanceInfo.label}
          </span>
        </div>
      </div>

      {/* Wuxing Bars */}
      <div className="space-y-3">
        {stats.map((stat) => {
          const color = getWuxingColor(stat.name);
          const isDominant = stat.name === dominant;
          const isWeak = stat.name === weak;

          return (
            <div key={stat.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span
                    className="w-6 h-6 flex items-center justify-center rounded font-bold"
                    style={{
                      backgroundColor: `${color}20`,
                      color: color,
                    }}
                  >
                    {stat.name}
                  </span>
                  {isDominant && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                      旺
                    </span>
                  )}
                  {isWeak && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                      弱
                    </span>
                  )}
                </div>
                <span className="text-muted-foreground">
                  {stat.count}个 ({stat.percentage}%)
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${stat.percentage}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>天干: {stat.ganCount}</span>
                <span>地支: {stat.zhiCount}</span>
                <span>藏干: {stat.cangGanCount}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analysis Summary */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-2">五行分析</h4>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <span className="text-foreground">五行最旺：</span>
            <span
              className="font-medium"
              style={{ color: getWuxingColor(dominant) }}
            >
              {dominant}
            </span>
            ，代表您的性格中带有较多的
            {getWuxingTrait(dominant)}特质。
          </p>
          <p>
            <span className="text-foreground">五行最弱：</span>
            <span
              className="font-medium"
              style={{ color: getWuxingColor(weak) }}
            >
              {weak}
            </span>
            ，建议在生活和事业中适当补充
            {weak}元素以达到平衡。
          </p>
          <p>
            <span className="text-foreground">日主强弱：</span>
            日主为
            <span
              className="font-medium"
              style={{ color: getWuxingColor(dayMasterWuxing) }}
            >
              {dayMasterWuxing}
            </span>
            ，{balance === "strong"
              ? "身强喜克泄，忌生扶"
              : balance === "weak"
              ? "身弱喜生扶，忌克泄"
              : "五行平和，运势较为顺遂"}
            。
          </p>
        </div>
      </div>
    </div>
  );
}

function getWuxingTrait(wuxing: string): string {
  const traits: Record<string, string> = {
    金: "刚毅果断、重义气",
    木: "仁慈正直、有上进心",
    水: "聪明灵活、善于应变",
    火: "热情礼貌、积极进取",
    土: "诚实守信、稳重踏实",
  };
  return traits[wuxing] || "";
}
