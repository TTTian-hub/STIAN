"use client";

import { BaziResult, BaziPillar } from "@/lib/calculations/bazi";
import { getWuxingColor } from "@/lib/calculations/wuxing";

interface BaziChartProps {
  bazi: BaziResult | null;
}

export function BaziChart({ bazi }: BaziChartProps) {
  if (!bazi) return null;

  const pillars = [
    { key: "year", label: "年柱", data: bazi.year },
    { key: "month", label: "月柱", data: bazi.month },
    { key: "day", label: "日柱", data: bazi.day },
    ...(bazi.hour ? [{ key: "hour", label: "时柱", data: bazi.hour }] : []),
  ];

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">八字命盘</h3>
        <span className="text-sm text-muted-foreground">
          生肖：{bazi.zodiac}
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

      {/* Heavenly Stems (天干) Row */}
      <div className="grid grid-cols-5 gap-2 text-center">
        <div className="text-sm text-muted-foreground flex items-center justify-center">
          天干
        </div>
        {pillars.map((p) => (
          <StemCell key={`${p.key}-gan`} pillar={p.data} type="gan" />
        ))}
      </div>

      {/* Earthly Branches (地支) Row */}
      <div className="grid grid-cols-5 gap-2 text-center">
        <div className="text-sm text-muted-foreground flex items-center justify-center">
          地支
        </div>
        {pillars.map((p) => (
          <StemCell key={`${p.key}-zhi`} pillar={p.data} type="zhi" />
        ))}
      </div>

      {/* Hidden Stems (藏干) Row */}
      <div className="grid grid-cols-5 gap-2 text-center">
        <div className="text-sm text-muted-foreground flex items-center justify-center">
          藏干
        </div>
        {pillars.map((p) => (
          <div
            key={`${p.key}-cang`}
            className="flex flex-col items-center justify-center gap-1"
          >
            {p.data.cangGan.length > 0 ? (
              p.data.cangGan.map((gan, idx) => (
                <span
                  key={idx}
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{
                    backgroundColor: `${getWuxingColor(
                      getWuxingForStem(gan)
                    )}20`,
                    color: getWuxingColor(getWuxingForStem(gan)),
                  }}
                >
                  {gan}
                </span>
              ))
            ) : (
              <span className="text-xs text-muted-foreground">-</span>
            )}
          </div>
        ))}
      </div>

      {/* Na Yin (纳音) Info */}
      <div className="pt-4 border-t border-border">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">农历：</span>
            <span>
              {bazi.lunarYear}年{bazi.lunarMonth}月{bazi.lunarDay}日
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">公历：</span>
            <span>{new Date(bazi.solar).toLocaleDateString("zh-CN")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StemCell({
  pillar,
  type,
}: {
  pillar: BaziPillar;
  type: "gan" | "zhi";
}) {
  const value = type === "gan" ? pillar.gan : pillar.zhi;
  const wuxing = type === "gan" ? pillar.ganWuxing : pillar.zhiWuxing;
  const yinyang = type === "gan" ? pillar.ganYinYang : pillar.zhiYinYang;
  const color = getWuxingColor(wuxing);

  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className="text-2xl font-bold w-10 h-10 flex items-center justify-center rounded-lg"
        style={{
          backgroundColor: `${color}20`,
          color: color,
        }}
      >
        {value}
      </span>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>{wuxing}</span>
        <span>·</span>
        <span>{yinyang}</span>
      </div>
    </div>
  );
}

function getWuxingForStem(stem: string): string {
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
  return map[stem] || "木";
}
