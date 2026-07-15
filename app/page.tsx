"use client";

import { FeatureCard, FeatureGrid } from "@/components/features/feature-card";
import { Sparkles, Star, LayoutGrid, Calendar, Coins, Heart, ChevronRight, ScrollText } from "lucide-react";
import Link from "next/link";
import { FadeInUp, StaggerContainer, StaggerItem, Float } from "@/components/ui/animations";

const features = [
  {
    icon: ScrollText,
    title: "老黄历",
    description: "每日宜忌查询",
    href: "/huangli",
  },
  {
    icon: Star,
    title: "星座运势",
    description: "每日运势解读",
    href: "/horoscope",
  },
  {
    icon: LayoutGrid,
    title: "塔罗牌",
    description: "AI解读牌面含义",
    href: "/tarot",
  },
  {
    icon: Calendar,
    title: "八字算命",
    description: "生成八字命盘",
    href: "/bazi",
  },
  {
    icon: Sparkles,
    title: "奇门遁甲",
    description: "九宫格吉凶解读",
    href: "/qimen",
  },
  {
    icon: Coins,
    title: "六爻预测",
    description: "起卦解卦",
    href: "/liuyao",
  },
  {
    icon: Heart,
    title: "合盘预测",
    description: "双人配对分析",
    href: "/synastry",
  },
];

export default function Home() {
  return (
    <div className="space-y-12 sm:space-y-16">
      {/* Hero Section - Minimal */}
      <section className="text-center pt-6 pb-4">
        <FadeInUp>
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border mb-6">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-foreground">AI 驱动 · 智能解读</span>
          </div>
        </FadeInUp>

        <FadeInUp delay={0.1}>
          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">
            <span className="text-foreground">问命/AskFate</span>
          </h1>
        </FadeInUp>

        <FadeInUp delay={0.2}>
          {/* Subtitle */}
          <p className="text-base text-muted-foreground mb-2">
            融合古老命理智慧与现代 AI 技术
          </p>
        </FadeInUp>

        <FadeInUp delay={0.3}>
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-6">
            全方位预测解读，指引前路
          </p>
        </FadeInUp>

        <FadeInUp delay={0.4}>
          {/* CTA Button */}
          <Link
            href="#features"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            开始探索
            <ChevronRight className="w-4 h-4" />
          </Link>
        </FadeInUp>
      </section>

      {/* Features Section */}
      <section id="features">
        <FadeInUp>
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold text-foreground mb-1">
              选择预测方式
            </h2>
            <p className="text-sm text-muted-foreground">
              六种古老智慧为你指引
            </p>
          </div>
        </FadeInUp>

        <StaggerContainer staggerDelay={0.08}>
          <FeatureGrid>
            {features.map((feature) => (
              <StaggerItem key={feature.href}>
                <FeatureCard {...feature} />
              </StaggerItem>
            ))}
          </FeatureGrid>
        </StaggerContainer>
      </section>

      {/* Features Highlights - Simplified */}
      <section className="py-6">
        <FadeInUp delay={0.5}>
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <Float>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-secondary flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                </Float>
                <h3 className="text-sm font-medium text-foreground">AI 解读</h3>
              </div>
              <div className="space-y-2">
                <Float>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-secondary flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                </Float>
                <h3 className="text-sm font-medium text-foreground">多维度</h3>
              </div>
              <div className="space-y-2">
                <Float>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-secondary flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                </Float>
                <h3 className="text-sm font-medium text-foreground">私密安全</h3>
              </div>
            </div>
          </div>
        </FadeInUp>
      </section>

      {/* Footer */}
      <footer className="text-center pt-4 pb-6">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-4" />
        <p className="text-xs text-muted-foreground">
          © 2026 问命/AskFate · 仅供娱乐参考
        </p>
      </footer>
    </div>
  );
}
