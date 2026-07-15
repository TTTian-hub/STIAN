"use client";

import { Briefcase, Heart, Coins, Activity, Search, HelpCircle } from "lucide-react";

type DivinationType = "career" | "love" | "wealth" | "health" | "lost" | "general";

interface DivinationTypeSelectorProps {
  selected: DivinationType;
  onSelect: (type: DivinationType) => void;
}

const divinationTypes: { id: DivinationType; label: string; icon: React.ElementType; description: string }[] = [
  { id: "career", label: "事业", icon: Briefcase, description: "工作、升职、创业、求职" },
  { id: "love", label: "感情", icon: Heart, description: "姻缘、感情发展、婚姻" },
  { id: "wealth", label: "求财", icon: Coins, description: "投资、财运、生意" },
  { id: "health", label: "健康", icon: Activity, description: "身体状况、疾病" },
  { id: "lost", label: "寻物", icon: Search, description: "失物、寻人、寻找" },
  { id: "general", label: "综合", icon: HelpCircle, description: "其他事项" },
];

export function DivinationTypeSelector({ selected, onSelect }: DivinationTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">占测类别</label>
      <div className="grid grid-cols-3 gap-2">
        {divinationTypes.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
              selected === id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/50"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{label}</span>
            <span className={`text-xs ${selected === id ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
              {description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export type { DivinationType };
