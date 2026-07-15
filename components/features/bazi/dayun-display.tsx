"use client";

import { Dayun } from "@/lib/calculations/dayun";
import { getWuxingColor } from "@/lib/calculations/wuxing";

interface DayunDisplayProps {
  dayun: Dayun[] | null;
  currentAge?: number;
}

export function DayunDisplay({ dayun, currentAge }: DayunDisplayProps) {
  if (!dayun || dayun.length === 0) return null;

  const getGanWuxing = (gan: string): string => {
    const map: Record<string, string> = {
      甲: "木",
      乙: "木",
      丙: "火",
      丁: "火",
      戊: "土",
      己: "土",
      庚: "金",
      辛: "金",
      壬: "水",
      癸: "水",
    };
    return map[gan] || "木";
  };

  const getZhiWuxing = (zhi: string): string => {
    const map: Record<string, string> = {
      子: "水",
      丑: "土",
      寅: "木",
      卯: "木",
      辰: "土",
      巳: "火",
      午: "火",
      未: "土",
      申: "金",
      酉: "金",
      戌: "土",
      亥: "水",
    };
    return map[zhi] || "土";
  };

  const isCurrentDayun = (d: Dayun): boolean => {
    if (currentAge === undefined) return false;
    return currentAge >= d.ageStart && currentAge <= d.ageEnd;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">大运流年</h3>
        {currentAge !== undefined && (
          <span className="text-sm text-muted-foreground">
            当前年龄：{currentAge}岁
          </span>
        )}
      </div>

      {/* Dayun List */}
      <div className="space-y-2">
        {dayun.map((d, index) => {
          const ganWuxing = getGanWuxing(d.gan);
          const zhiWuxing = getZhiWuxing(d.zhi);
          const isCurrent = isCurrentDayun(d);

          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                isCurrent
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              {/* Age Range */}
              <div className="w-20 text-center">
                <div className="text-sm font-medium">
                  {d.ageStart}-{d.ageEnd}岁
                </div>
                <div className="text-xs text-muted-foreground">
                  {d.yearStart}-{d.yearEnd}
                </div>
              </div>

              {/* GanZhi */}
              <div className="flex items-center gap-1">
                <span
                  className="w-8 h-8 flex items-center justify-center rounded font-bold text-lg"
                  style={{
                    backgroundColor: `${getWuxingColor(ganWuxing)}20`,
                    color: getWuxingColor(ganWuxing),
                  }}
                >
                  {d.gan}
                </span>
                <span
                  className="w-8 h-8 flex items-center justify-center rounded font-bold text-lg"
                  style={{
                    backgroundColor: `${getWuxingColor(zhiWuxing)}20`,
                    color: getWuxingColor(zhiWuxing),
                  }}
                >
                  {d.zhi}
                </span>
              </div>

              {/* GanZhi Text */}
              <div className="flex-1">
                <span className="font-medium">{d.ganZhi}</span>
              </div>

              {/* Current Indicator */}
              {isCurrent && (
                <span className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded">
                  当前大运
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      <div className="pt-4 border-t border-border text-sm text-muted-foreground">
        <p>
          大运是八字命理中推算人生运势的重要方法。每十年为一大运，从出生起计算。
          当前高亮显示的是您所处的大运周期。
        </p>
      </div>
    </div>
  );
}
