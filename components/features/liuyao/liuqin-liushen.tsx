"use client";

import { LiuYaoResult, LIU_QIN, LIU_SHEN } from "@/lib/calculations/liuyao";

interface LiuqinLiushenProps {
  liuyao: LiuYaoResult | null;
}

export function LiuqinLiushen({ liuyao }: LiuqinLiushenProps) {
  if (!liuyao) return null;

  const { liuQin, liuShen, benGua } = liuyao;

  const getLiuqinColor = (name: string): string => {
    const colorMap: Record<string, string> = {
      父母: "#8B5CF6", // violet
      兄弟: "#3B82F6", // blue
      子孙: "#10B981", // emerald
      妻财: "#F59E0B", // amber
      官鬼: "#EF4444", // red
    };
    return colorMap[name] || "#6B7280";
  };

  const getLiushenColor = (name: string): string => {
    const colorMap: Record<string, string> = {
      青龙: "#10B981", // emerald - wood
      朱雀: "#EF4444", // red - fire
      勾陈: "#92400E", // brown - earth
      螣蛇: "#92400E", // brown - earth
      白虎: "#F59E0B", // amber - metal
      玄武: "#3B82F6", // blue - water
    };
    return colorMap[name] || "#6B7280";
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <h3 className="text-lg font-semibold">六亲六神</h3>

      {/* Liuqin (Six Relations) */}
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-muted-foreground">六亲配置</h4>
        <div className="space-y-2">
          {benGua.yaoList
            .slice()
            .reverse()
            .map((yao, index) => {
              const liuqin = liuQin[index] || "未知";
              return (
                <div
                  key={yao.position}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground w-8">
                      第{yao.position}爻
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-sm font-medium"
                      style={{
                        backgroundColor: `${getLiuqinColor(liuqin)}20`,
                        color: getLiuqinColor(liuqin),
                      }}
                    >
                      {liuqin}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {yao.isYang ? "阳" : "阴"}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Liushen (Six Gods) */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h4 className="font-medium text-sm text-muted-foreground">六神配置</h4>
        <div className="grid grid-cols-3 gap-2">
          {liuShen.map((shen, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted"
            >
              <span
                className="text-lg font-bold"
                style={{ color: getLiushenColor(shen) }}
              >
                {shen}
              </span>
              <span className="text-xs text-muted-foreground">
                第{6 - index}爻
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="pt-4 border-t border-border text-sm text-muted-foreground space-y-1">
        <p>
          <span className="font-medium text-foreground">六亲：</span>
          父母、兄弟、子孙、妻财、官鬼，代表与求测者的关系
        </p>
        <p>
          <span className="font-medium text-foreground">六神：</span>
          青龙、朱雀、勾陈、螣蛇、白虎、玄武，代表事情的外在环境因素
        </p>
      </div>
    </div>
  );
}
