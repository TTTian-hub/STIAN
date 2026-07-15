"use client";

import { LiuYaoResult, GuaInfo, YaoInfo } from "@/lib/calculations/liuyao";

interface GuaDisplayProps {
  liuyao: LiuYaoResult | null;
}

export function GuaDisplay({ liuyao }: GuaDisplayProps) {
  if (!liuyao) return null;

  const { benGua, bianGua, dongYao, shiYao, yingYao } = liuyao;

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">卦象展示</h3>
        <div className="text-sm text-muted-foreground">
          世爻：第{shiYao}爻 · 应爻：第{yingYao}爻
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Ben Gua (Original Gua) */}
        <div className="space-y-3">
          <div className="text-center">
            <h4 className="font-medium">{benGua.name}</h4>
            <p className="text-sm text-muted-foreground">{benGua.guaCi}</p>
          </div>
          <div className="space-y-1">
            {benGua.yaoList
              .slice()
              .reverse()
              .map((yao) => (
                <YaoLine key={yao.position} yao={yao} isBian={false} />
              ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            {benGua.upperGua}上{benGua.lowerGua}下
          </div>
        </div>

        {/* Bian Gua (Changed Gua) */}
        {bianGua ? (
          <div className="space-y-3">
            <div className="text-center">
              <h4 className="font-medium">{bianGua.name}</h4>
              <p className="text-sm text-muted-foreground">{bianGua.guaCi}</p>
            </div>
            <div className="space-y-1">
              {bianGua.yaoList
                .slice()
                .reverse()
                .map((yao) => (
                  <YaoLine key={yao.position} yao={yao} isBian={true} />
                ))}
            </div>
            <div className="text-center text-sm text-muted-foreground">
              {bianGua.upperGua}上{bianGua.lowerGua}下
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p>无变卦</p>
              <p className="text-sm">（静卦）</p>
            </div>
          </div>
        )}
      </div>

      {/* Dong Yao Info */}
      {dongYao.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h4 className="font-medium mb-2">
            动爻：第{dongYao.join("、")}爻
          </h4>
          <div className="space-y-2">
            {dongYao.map((pos) => {
              const yao = benGua.yaoList.find((y) => y.position === pos);
              if (!yao) return null;
              return (
                <div
                  key={pos}
                  className="p-3 bg-muted rounded-lg text-sm space-y-1"
                >
                  <div className="font-medium">
                    第{pos}爻：{yao.isYang ? "阳爻" : "阴爻"}变
                    {!yao.isYang ? "阳" : "阴"}
                  </div>
                  {yao.yaoText && (
                    <div className="text-muted-foreground">{yao.yaoText}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function YaoLine({ yao, isBian }: { yao: YaoInfo; isBian: boolean }) {
  const { isYang, isDong } = yao;

  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-xs text-muted-foreground w-6">{yao.position}</span>
      <div className="flex-1 flex justify-center">
        {isYang ? (
          // Yang Yao (solid line)
          <div
            className={`w-24 h-3 rounded-full ${
              isDong && !isBian
                ? "bg-primary"
                : isDong && isBian
                ? "bg-primary/50"
                : "bg-foreground"
            }`}
          />
        ) : (
          // Yin Yao (broken line)
          <div className="flex gap-1">
            <div
              className={`w-11 h-3 rounded-full ${
                isDong && !isBian
                  ? "bg-primary"
                  : isDong && isBian
                  ? "bg-primary/50"
                  : "bg-foreground"
              }`}
            />
            <div
              className={`w-11 h-3 rounded-full ${
                isDong && !isBian
                  ? "bg-primary"
                  : isDong && isBian
                  ? "bg-primary/50"
                  : "bg-foreground"
              }`}
            />
          </div>
        )}
      </div>
      {isDong && !isBian && (
        <span className="text-xs text-primary font-medium">动</span>
      )}
      {isDong && isBian && (
        <span className="text-xs text-primary/50 font-medium">变</span>
      )}
      {!isDong && <span className="text-xs w-4" />}
    </div>
  );
}
