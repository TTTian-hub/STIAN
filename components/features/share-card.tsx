'use client';

import React, { forwardRef } from 'react';

/**
 * 各功能对应的主题渐变（用于分享卡片背景与配色）
 */
const ACCENTS: Record<string, [string, string]> = {
  '八字分析': ['#6366f1', '#312e81'],
  '塔罗解读': ['#a855f7', '#6d28d9'],
  '奇门解读': ['#06b6d4', '#0e7490'],
  '六爻解卦': ['#f59e0b', '#b45309'],
  'AI 运势解读': ['#3b82f6', '#1e40af'],
  '运势解读': ['#10b981', '#047857'],
  'AI 深度解读': ['#f43f5e', '#9f1239'],
};

function getAccent(feature?: string): [string, string] {
  if (feature && ACCENTS[feature]) return ACCENTS[feature];
  return ['#7c3aed', '#4c1d95'];
}

export interface ShareCardProps {
  /** 功能名，如「塔罗解读」 */
  feature: string;
  /** 用户提问 / 命主 / 缘主 等主体信息 */
  subject?: string;
  /** subject 前的小标签，默认「问」 */
  subjectLabel?: string;
  /** AI 解读正文 */
  content: string;
  /** 页脚日期，默认当天 */
  date?: string;
  /** 品牌名（可换皮） */
  brand?: string;
}

/**
 * 算命结果分享卡片 —— 纯展示组件，固定神秘风深色主题，
 * 通过 forwardRef 暴露 DOM 节点供 html-to-image 截图。
 */
export const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(
  ({ feature, subject, subjectLabel = '问', content, date, brand = '玄机阁 · AskFate' }, ref) => {
    const [c1, c2] = getAccent(feature);
    const today = date || new Date().toLocaleDateString('zh-CN');

    return (
      <div
        ref={ref}
        style={{
          width: 560,
          boxSizing: 'border-box',
          padding: 36,
          borderRadius: 28,
          background: `linear-gradient(160deg, ${c1} 0%, ${c2} 52%, #0f172a 100%)`,
          color: '#f8fafc',
          fontFamily:
            'system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Segoe UI", sans-serif',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
        }}
      >
        {/* 装饰：右上角月亮 + 星点 */}
        <svg
          width="220"
          height="220"
          viewBox="0 0 220 220"
          style={{ position: 'absolute', right: -40, top: -50, opacity: 0.18, pointerEvents: 'none' }}
          aria-hidden
        >
          <circle cx="150" cy="70" r="46" fill="#fff" />
          <circle cx="132" cy="60" r="46" fill={c2} />
          <circle cx="40" cy="150" r="2.5" fill="#fff" />
          <circle cx="80" cy="180" r="1.8" fill="#fff" />
          <circle cx="190" cy="170" r="2.2" fill="#fff" />
          <circle cx="30" cy="40" r="1.6" fill="#fff" />
          <circle cx="100" cy="30" r="2" fill="#fff" />
        </svg>

        {/* 品牌头 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 20,
              color: '#1f2937',
            }}
          >
            玄
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <div style={{ fontWeight: 700, fontSize: 17 }}>{brand}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>AI 玄学助手 · 一卜窥天机</div>
          </div>
        </div>

        {/* 功能标签 */}
        <div style={{ marginTop: 20, position: 'relative', zIndex: 1 }}>
          <span
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 999,
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.25)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            🔮 {feature}
          </span>
        </div>

        {/* 主体信息 */}
        {subject ? (
          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              borderRadius: 14,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <span style={{ fontSize: 12, opacity: 0.65, marginRight: 8 }}>{subjectLabel}</span>
            <span style={{ fontSize: 15, fontWeight: 600 }}>{subject}</span>
          </div>
        ) : null}

        {/* 分隔 */}
        <div
          style={{
            marginTop: 18,
            marginBottom: 14,
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
            position: 'relative',
            zIndex: 1,
          }}
        />

        {/* 解读正文 */}
        <div
          style={{
            fontSize: 15,
            lineHeight: 1.85,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            color: 'rgba(248,250,252,0.95)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {content}
        </div>

        {/* 页脚 */}
        <div
          style={{
            marginTop: 22,
            paddingTop: 14,
            borderTop: '1px solid rgba(255,255,255,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 12,
            opacity: 0.75,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <span>{today}</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                border: '1.5px solid rgba(255,255,255,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
              }}
            >
              QR
            </span>
            <span style={{ maxWidth: 160, lineHeight: 1.3 }}>由 AI 生成 · 仅供娱乐参考</span>
          </span>
        </div>
      </div>
    );
  }
);

ShareCard.displayName = 'ShareCard';
