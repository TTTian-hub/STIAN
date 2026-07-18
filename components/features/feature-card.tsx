"use client";

import Link from "next/link";
import { ArrowUpRight, type LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  tag?: string;
  recommended?: boolean;
  index?: number;
}

export function FeatureCard({ icon: Icon, title, description, href, tag, recommended, index }: FeatureCardProps) {
  return (
    <Link href={href} className={`feature-choice ${recommended ? "recommended" : ""}`}>
      <div className="feature-choice-top"><small>{String(index ?? 1).padStart(2, "0")} · {tag ?? "EXPLORE"}</small>{recommended && <em>为你推荐</em>}</div>
      <i className="feature-choice-icon"><Icon /></i>
      <h3>{title}</h3><p>{description}</p>
      <span className="feature-choice-arrow"><ArrowUpRight /></span>
    </Link>
  );
}

export function FeatureGrid({ children }: { children: React.ReactNode }) {
  return <div className="feature-choice-grid">{children}</div>;
}
