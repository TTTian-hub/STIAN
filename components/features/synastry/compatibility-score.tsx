"use client";

import { Progress } from "@/components/ui/progress";

interface CompatibilityScoreProps {
  zodiacScore?: number;
  baziScore?: number;
  overallScore?: number;
}

export function CompatibilityScore({
  zodiacScore,
  baziScore,
  overallScore,
}: CompatibilityScoreProps) {
  // Calculate overall if not provided
  const calculatedOverall = overallScore ?? (
    zodiacScore && baziScore
      ? Math.round((zodiacScore + baziScore) / 2)
      : zodiacScore ?? baziScore ?? 0
  );

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#10B981"; // green
    if (score >= 60) return "#3B82F6"; // blue
    if (score >= 40) return "#F59E0B"; // amber
    return "#EF4444"; // red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return "非常契合";
    if (score >= 60) return "较为契合";
    if (score >= 40) return "一般契合";
    return "需要磨合";
  };

  const color = getScoreColor(calculatedOverall);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">配对指数</h3>
      </div>

      {/* Overall Score */}
      <div className="text-center space-y-2">
        <div
          className="text-6xl font-bold"
          style={{ color }}
        >
          {calculatedOverall}
        </div>
        <div className="text-lg font-medium" style={{ color }}>
          {getScoreLabel(calculatedOverall)}
        </div>
        <Progress
          value={calculatedOverall}
          className="h-3"
          style={{ backgroundColor: `${color}30` }}
        />
      </div>

      {/* Individual Scores */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
        {zodiacScore !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">星座合盘</span>
              <span className="font-medium">{zodiacScore}分</span>
            </div>
            <Progress
              value={zodiacScore}
              className="h-2"
              style={{
                backgroundColor: `${getScoreColor(zodiacScore)}30`,
              }}
            />
          </div>
        )}
        {baziScore !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">八字合婚</span>
              <span className="font-medium">{baziScore}分</span>
            </div>
            <Progress
              value={baziScore}
              className="h-2"
              style={{
                backgroundColor: `${getScoreColor(baziScore)}30`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
