"use client";

import { ShishenInfo } from "@/lib/calculations/shishen";
import { BaziResult } from "@/lib/calculations/bazi";

interface ShishenDisplayProps {
  bazi: BaziResult | null;
  shishen: {
    year: ShishenInfo;
    month: ShishenInfo;
    day: ShishenInfo;
    hour?: ShishenInfo;
    dayMaster: string;
  } | null;
}

export function ShishenDisplay({ bazi, shishen }: ShishenDisplayProps) {
  if (!bazi || !shishen) return null;

  const pillars = [
    { key: "year", label: "年柱", data: bazi.year, shishen: shishen.year },
    { key: "month", label: "月柱", data: bazi.month, shishen: shishen.month },
    { key: "day", label: "日柱", data: bazi.day, shishen: shishen.day },
    ...(bazi.hour && shishen.hour ? [{ key: "hour", label: "时柱", data: bazi.hour, shishen: shishen.hour }] : []),
  ];

  const getShishenColor = (name: string): string => {
    const colorMap: Record<string, string> = {
      比肩: "#3B82F6", // blue
      劫财: "#3B82F6", // blue
      食神: "#10B981", // emerald
      伤官: "#10B981", // emerald
      偏财: "#F59E0B", // amber
      正财: "#F59E0B", // amber
      七杀: "#EF4444", // red
      正官: "#EF4444", // red
      偏印: "#8B5CF6", // violet
      正印: "#8B5CF6", // violet
      日主: "#6B7280", // gray
    };
    return colorMap[name] || "#6B7280";
  };

  const getShishenDescription = (name: string): string => {
    const descMap: Record<string, string> = {
      比肩: "同我者，同性相助",
      劫财: "同我者，异性相夺",
      食神: "我生者，泄秀聪慧",
      伤官: "我生者，才华横溢",
      偏财: "我克者，意外之财",
      正财: "我克者，正当收入",
      七杀: "克我者，偏夫偏官",
      正官: "克我者，丈夫官职",
      偏印: "生我者，偏母学问",
      正印: "生我者，母亲学问",
      日主: "自身命主",
    };
    return descMap[name] || "";
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">十神信息</h3>
        <span className="text-sm text-muted-foreground">
          日主：
          <span className="font-medium text-foreground">{shishen.dayMaster}</span>
        </span>
      </div>

      {/* Header Row */}
      <div className="grid grid-cols-5 gap-2 text-center text-sm text-muted-foreground">
        <div></div>
        {pillars.map((p) => (
          <div key={p.key} className="font-medium">
            {p.label}
          </div>
        ))}
      </div>

      {/* Heavenly Stems Row with Shishen */}
      <div className="grid grid-cols-5 gap-2 text-center">
        <div className="text-sm text-muted-foreground flex items-center justify-center">
          天干
        </div>
        {pillars.map((p) => (
          <div key={`${p.key}-gan`} className="flex flex-col items-center gap-1">
            <span
              className="text-lg font-bold w-10 h-10 flex items-center justify-center rounded-lg"
              style={{
                backgroundColor: `${getShishenColor(p.shishen.name)}20`,
                color: getShishenColor(p.shishen.name),
              }}
            >
              {p.data.gan}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{
                backgroundColor: `${getShishenColor(p.shishen.name)}15`,
                color: getShishenColor(p.shishen.name),
              }}
            >
              {p.shishen.name}
            </span>
          </div>
        ))}
      </div>

      {/* Earthly Branches Row */}
      <div className="grid grid-cols-5 gap-2 text-center">
        <div className="text-sm text-muted-foreground flex items-center justify-center">
          地支
        </div>
        {pillars.map((p) => (
          <div key={`${p.key}-zhi`} className="flex flex-col items-center gap-1">
            <span className="text-lg font-bold w-10 h-10 flex items-center justify-center rounded-lg bg-muted">
              {p.data.zhi}
            </span>
          </div>
        ))}
      </div>

      {/* Shishen Legend */}
      <div className="pt-4 border-t border-border">
        <h4 className="text-sm font-medium mb-3">十神说明</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {["比肩", "劫财", "食神", "伤官", "偏财", "正财", "七杀", "正官", "偏印", "正印"].map(
            (name) => (
              <div key={name} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: getShishenColor(name) }}
                />
                <span className="font-medium">{name}</span>
                <span className="text-muted-foreground">
                  {getShishenDescription(name)}
                </span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
