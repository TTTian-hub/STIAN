"use client";

import { Heart, Users, Handshake, Building2, Home } from "lucide-react";

type RelationshipType = "romance" | "marriage" | "friendship" | "work" | "family";

interface RelationshipTypeSelectorProps {
  selected: RelationshipType;
  onSelect: (type: RelationshipType) => void;
}

const relationshipTypes: { id: RelationshipType; label: string; icon: React.ElementType; description: string }[] = [
  { id: "romance", label: "恋爱", icon: Heart, description: "感情发展、配对分析" },
  { id: "marriage", label: "婚姻", icon: Home, description: "婚姻契合度、长久发展" },
  { id: "friendship", label: "友情", icon: Users, description: "友谊分析、相处之道" },
  { id: "work", label: "合作", icon: Handshake, description: "事业合作、共事关系" },
  { id: "family", label: "家人", icon: Building2, description: "家庭关系、亲情分析" },
];

export function RelationshipTypeSelector({ selected, onSelect }: RelationshipTypeSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">关系类型</label>
      <div className="grid grid-cols-5 gap-2">
        {relationshipTypes.map(({ id, label, icon: Icon, description }) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
              selected === id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/50"
            }`}
          >
            <Icon className="w-4 h-4" />
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

export type { RelationshipType };
