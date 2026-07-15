"use client";

import { CompatibilityScore } from "./compatibility-score";

interface SynastryResultProps {
  zodiacData?: {
    sign1: string;
    sign2: string;
    element1: string;
    element2: string;
    score: number;
    analysis: string;
  } | null;
  baziData?: {
    bazi1: string;
    bazi2: string;
    zodiac1: string;
    zodiac2: string;
    score: number;
    analysis: string;
  } | null;
  overallScore: number;
}

export function SynastryResult({ zodiacData, baziData, overallScore }: SynastryResultProps) {
  if (!zodiacData && !baziData) return null;

  return (
    <div className="space-y-4">
      {/* Compatibility Score */}
      <CompatibilityScore
        zodiacScore={zodiacData?.score}
        baziScore={baziData?.score}
        overallScore={overallScore}
      />

      {/* Zodiac Analysis */}
      {zodiacData && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">星座合盘分析</h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-primary/10 text-primary text-sm">
                {zodiacData.sign1}
              </span>
              <span className="text-muted-foreground">×</span>
              <span className="px-2 py-1 rounded bg-primary/10 text-primary text-sm">
                {zodiacData.sign2}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">第一人的元素</div>
              <div className="font-medium">{zodiacData.element1}</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">第二人的元素</div>
              <div className="font-medium">{zodiacData.element2}</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {zodiacData.analysis}
          </div>
        </div>
      )}

      {/* Bazi Analysis */}
      {baziData && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">八字合婚分析</h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-primary/10 text-primary text-sm">
                {baziData.zodiac1}
              </span>
              <span className="text-muted-foreground">×</span>
              <span className="px-2 py-1 rounded bg-primary/10 text-primary text-sm">
                {baziData.zodiac2}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">第一人八字</div>
              <div className="font-medium text-sm">{baziData.bazi1}</div>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">第二人八字</div>
              <div className="font-medium text-sm">{baziData.bazi2}</div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            {baziData.analysis}
          </div>
        </div>
      )}
    </div>
  );
}
