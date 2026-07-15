"use client";

import { useState } from "react";
import { QimenResult, QimenGong, getGongInfo } from "@/lib/calculations/qimen";

interface QimenPanProps {
  qimen: QimenResult | null;
}

export function QimenPan({ qimen }: QimenPanProps) {
  const [selectedGong, setSelectedGong] = useState<QimenGong | null>(null);

  if (!qimen) return null;

  const { juShu, yinYang, zhiFuXing, zhiShiMen, gongs, jieQi } = qimen;

  // Arrange gongs in 3x3 grid order (for display)
  // Traditional layout: 4 9 2
  //                     3 5 7
  //                     8 1 6
  const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  const orderedGongs = gridOrder.map((pos) =>
    gongs.find((g) => g.position === pos)
  ).filter(Boolean) as QimenGong[];

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">奇门遁甲盘</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <span>{yinYang}{juShu}局</span>
            <span>·</span>
            <span>{jieQi}</span>
            <span>·</span>
            <span>值符:{zhiFuXing}</span>
            <span>·</span>
            <span>值使:{zhiShiMen}</span>
          </div>
        </div>
      </div>

      {/* 3x3 Grid */}
      <div className="grid grid-cols-3 gap-1 aspect-square max-w-md mx-auto">
        {orderedGongs.map((gong) => {
          const info = getGongInfo(gong.position);
          const isSelected = selectedGong?.position === gong.position;

          return (
            <button
              key={gong.position}
              onClick={() => setSelectedGong(gong)}
              className={`relative border rounded-lg p-2 flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
              style={{
                backgroundColor: isSelected
                  ? `${info.color}10`
                  : `${info.color}05`,
              }}
            >
              {/* Palace Name */}
              <div className="absolute top-1 left-1 text-xs text-muted-foreground">
                {gong.name}
              </div>

              {/* Direction */}
              <div className="absolute top-1 right-1 text-xs text-muted-foreground">
                {info.direction}
              </div>

              {/* Tian Pan (Heaven Plate) */}
              {gong.tianPan && (
                <div className="text-lg font-bold text-primary">
                  {gong.tianPan}
                </div>
              )}

              {/* Star */}
              {gong.xing && (
                <div className="text-sm text-amber-600">{gong.xing}</div>
              )}

              {/* Door */}
              {gong.men && (
                <div className="text-sm text-emerald-600">{gong.men}</div>
              )}

              {/* God */}
              {gong.shen && (
                <div className="text-xs text-purple-600">{gong.shen}</div>
              )}

              {/* Di Pan (Earth Plate) */}
              {gong.diPan && (
                <div className="absolute bottom-1 text-xs text-muted-foreground">
                  地: {gong.diPan}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Gong Details */}
      {selectedGong && (
        <div className="border border-border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">
              {selectedGong.name} ({getGongInfo(selectedGong.position).direction})
            </h4>
            <button
              onClick={() => setSelectedGong(null)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              关闭
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">五行: </span>
              <span>{getGongInfo(selectedGong.position).element}</span>
            </div>
            {selectedGong.tianPan && (
              <div>
                <span className="text-muted-foreground">天盘: </span>
                <span className="font-medium">{selectedGong.tianPan}</span>
              </div>
            )}
            {selectedGong.diPan && (
              <div>
                <span className="text-muted-foreground">地盘: </span>
                <span>{selectedGong.diPan}</span>
              </div>
            )}
            {selectedGong.xing && (
              <div>
                <span className="text-muted-foreground">九星: </span>
                <span className="text-amber-600">{selectedGong.xing}</span>
              </div>
            )}
            {selectedGong.men && (
              <div>
                <span className="text-muted-foreground">八门: </span>
                <span className="text-emerald-600">{selectedGong.men}</span>
              </div>
            )}
            {selectedGong.shen && (
              <div>
                <span className="text-muted-foreground">八神: </span>
                <span className="text-purple-600">{selectedGong.shen}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
