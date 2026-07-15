'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Copy, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toPng } from 'html-to-image';
import { ShareCard } from './share-card';

interface AIInterpretationProps {
  content: string;
  isLoading?: boolean;
  isStreaming?: boolean;
  error?: Error | null;
  onRegenerate?: () => void;
  title?: string;
  /** 功能名，用于分享卡片配色与标签，默认取 title */
  feature?: string;
  /** 主体信息（用户提问 / 命主 / 缘主等），用于分享卡片 */
  subject?: string;
  /** subject 前的小标签，默认「问」 */
  subjectLabel?: string;
}

export function AIInterpretation({
  content,
  isLoading = false,
  isStreaming = false,
  error,
  onRegenerate,
  title = 'AI 解读',
  feature,
  subject,
  subjectLabel = '问',
}: AIInterpretationProps) {
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [imgCopied, setImgCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async (mode: 'download' | 'copy') => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#0f172a',
      });
      if (mode === 'download') {
        const link = document.createElement('a');
        link.download = `askfate-${(feature || title).replace(/\s+/g, '')}-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
        return;
      }
      const blob = await (await fetch(dataUrl)).blob();
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setImgCopied(true);
        setTimeout(() => setImgCopied(false), 2000);
      }
    } catch (err) {
      console.error('分享卡片生成失败:', err);
    }
  };

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (error) {
    return (
      <div className="clean-card border-red-300 dark:border-red-500/30 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
          <Sparkles className="w-5 h-5" />
          <span className="font-semibold">解读出错</span>
        </div>
        <p className="text-red-600/80 dark:text-red-400/80 text-sm mb-4">{error.message}</p>
        {onRegenerate && (
          <Button
            onClick={onRegenerate}
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            重试
          </Button>
        )}
      </div>
    );
  }

  return (
    <>
    <div className="clean-card rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-100 bg-cyan-50/50 dark:border-slate-700 dark:bg-slate-800/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
            <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{title}</span>
          {isStreaming && (
            <span className="ml-2 flex items-center gap-1 text-xs text-cyan-600 dark:text-cyan-400">
              <span className="w-1.5 h-1.5 bg-cyan-600 dark:bg-cyan-400 rounded-full animate-pulse" />
              生成中
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {content && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="text-slate-500 hover:text-slate-700 hover:bg-cyan-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          )}
          {content && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShare(true)}
              title="生成分享卡片"
              className="text-slate-500 hover:text-slate-700 hover:bg-cyan-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
          {onRegenerate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRegenerate}
              disabled={isLoading || isStreaming}
              className="text-slate-500 hover:text-slate-700 hover:bg-cyan-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {isLoading && !content ? (
          <div className="space-y-3">
            <Skeleton className="h-4 bg-cyan-100 dark:bg-slate-700 w-3/4" />
            <Skeleton className="h-4 bg-cyan-100 dark:bg-slate-700 w-full" />
            <Skeleton className="h-4 bg-cyan-100 dark:bg-slate-700 w-5/6" />
            <Skeleton className="h-4 bg-cyan-100 dark:bg-slate-700 w-2/3" />
          </div>
        ) : content ? (
          <div className="prose dark:prose-invert max-w-none">
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {content}
              {isStreaming && (
                <span className="inline-block w-2 h-5 ml-1 bg-cyan-500 dark:bg-cyan-400 animate-pulse" />
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p>点击开始获取 AI 解读</p>
          </div>
        )}
      </div>
    </div>

    {showShare && content && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
        onClick={() => setShowShare(false)}
      >
        <div
          className="max-h-[92vh] overflow-auto flex flex-col items-center gap-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="rounded-3xl">
            <ShareCard
              ref={cardRef}
              feature={feature || title}
              subject={subject}
              subjectLabel={subjectLabel}
              content={content}
            />
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button onClick={() => handleShare('download')} className="bg-primary hover:bg-primary/90">
              下载图片
            </Button>
            <Button
              variant="outline"
              onClick={() => handleShare('copy')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              {imgCopied ? '已复制 ✓' : '复制图片'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowShare(false)}
              className="text-white/80 hover:bg-white/10"
            >
              关闭
            </Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// Typewriter effect hook
export function useTypewriter(text: string, speed: number = 30) {
  const [displayText, setDisplayText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayText('');
    setIsComplete(false);
    indexRef.current = 0;

    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return { displayText, isComplete };
}
