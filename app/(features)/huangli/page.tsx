"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AIInterpretation } from "@/components/features/ai-interpretation";
import { useAIStream } from "@/lib/ai/hooks";
import { DatePicker } from "@/components/features/date-picker";
import { Label } from "@/components/ui/label";
import { Calendar, Sparkles, Info } from "lucide-react";
import { HuangliResult } from "@/lib/calculations/huangli";
import { useConversationStore } from "@/lib/conversation/store";
import { FollowUpQuestion } from "@/components/features/follow-up-question";

export default function HuangliPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [huangliData, setHuangliData] = useState<HuangliResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { stream, isLoading: isAILoading, isStreaming, text, error, reset } = useAIStream();

  // 追问模式
  const {
    createConversation,
    addMessage,
    getCurrentConversation,
  } = useConversationStore();

  // 初始加载今日黄历
  useEffect(() => {
    handleCalculate();
  }, []);

  // 查询黄历
  const handleCalculate = async () => {
    setIsLoading(true);
    reset();
    setShowResult(false);

    try {
      const response = await fetch("/api/huangli", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.huangli) {
          setHuangliData(data.huangli);
          setShowResult(true);

          // 创建对话上下文
          createConversation("huangli", `黄历分析 - ${selectedDate.toLocaleDateString('zh-CN')}`, {
            date: selectedDate.toISOString(),
            huangli: data.huangli,
          });
        }
      }
    } catch (err) {
      console.error("Failed to calculate Huangli:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // AI解读
  const handleInterpret = async () => {
    if (!huangliData) return;

    reset();
    const prompt = `请解读${selectedDate.toLocaleDateString('zh-CN')}的黄历信息：
农历：${huangliData.lunarDate}
干支：${huangliData.ganZhi}
值日：${huangliData.zhiRi}日
星宿：${huangliData.xingXiu}（${huangliData.xingXiuLuck}）
宜：${huangliData.yi.join('、')}
忌：${huangliData.ji.join('、')}
冲煞：${huangliData.sha}方
${huangliData.jieQi ? `节气：${huangliData.jieQi}` : ''}`;

    // 记录用户提问
    const conversation = getCurrentConversation();
    if (conversation) {
      addMessage(conversation.id, 'user', prompt);
    }

    await stream(prompt, { endpoint: "/api/huangli" });
  };

  // 处理追问
  const handleFollowUp = async (question: string, history: Array<{ role: string; content: string }>) => {
    const conversation = getCurrentConversation();
    if (!conversation) return;

    // 记录用户追问
    addMessage(conversation.id, 'user', question);

    // 构建上下文感知的提示词
    const contextPrompt = `基于之前的黄历分析，用户追问：${question}

请根据黄历信息（${huangliData?.lunarDate}，${huangliData?.ganZhi}，宜：${huangliData?.yi.join('、')}，忌：${huangliData?.ji.join('、')}）回答用户的问题。`;

    await stream(contextPrompt, { endpoint: "/api/huangli" });

    // 记录AI回复（需要监听stream完成后，这里简化处理）
    setTimeout(() => {
      addMessage(conversation.id, 'assistant', text || '思考中...');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold text-foreground">老黄历</h1>
        <p className="text-sm text-muted-foreground">择吉日 · 查宜忌 · 知运势</p>
      </div>

      {/* 日期选择 */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">选择日期</Label>
          <DatePicker
            date={selectedDate}
            onSelect={(date) => {
              if (date) {
                setSelectedDate(date);
              }
            }}
            placeholder="选择查询日期"
            fromYear={1900}
            toYear={2100}
          />
        </div>

        <Button
          onClick={handleCalculate}
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            "查询中..."
          ) : (
            <>
              <Calendar className="w-4 h-4 mr-2" />
              查询黄历
            </>
          )}
        </Button>
      </div>

      {/* 黄历结果 */}
      {showResult && huangliData && (
        <div className="space-y-4 animate-fade-in">
          {/* 日期和农历 */}
          <div className="bg-card rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-bold text-foreground mb-1">
              {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
            </p>
            <p className="text-sm text-muted-foreground">
              {selectedDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
            </p>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-lg font-medium text-primary">{huangliData.lunarDate}</p>
              <p className="text-sm text-muted-foreground mt-1">{huangliData.ganZhi}</p>
            </div>
            {huangliData.isJieQi && (
              <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full">
                <Info className="w-3 h-3 text-primary" />
                <span className="text-xs text-secondary-foreground">今日{huangliData.jieQi}</span>
              </div>
            )}
          </div>

          {/* 宜忌 */}
          <div className="grid grid-cols-2 gap-3">
            {/* 宜 */}
            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-100 dark:border-green-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-green-500 dark:bg-green-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">宜</span>
                </div>
                <span className="font-medium text-green-800 dark:text-green-200">今日宜做</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {huangliData.yi.length > 0 ? (
                  huangliData.yi.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 text-xs rounded-full"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-green-400 dark:text-green-600">诸事不宜</span>
                )}
              </div>
            </div>

            {/* 忌 */}
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-800 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-red-500 dark:bg-red-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">忌</span>
                </div>
                <span className="font-medium text-red-800 dark:text-red-200">今日忌做</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {huangliData.ji.length > 0 ? (
                  huangliData.ji.map((item) => (
                    <span
                      key={item}
                      className="px-2 py-0.5 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 text-xs rounded-full"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-red-400 dark:text-red-600">诸事不忌</span>
                )}
              </div>
            </div>
          </div>

          {/* 星宿 */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">二十八星宿</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-foreground">{huangliData.xingXiu}宿</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      huangliData.xingXiuLuck === '吉'
                        ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                        : huangliData.xingXiuLuck === '凶'
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {huangliData.xingXiuLuck}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">冲煞</p>
                <p className="text-sm font-medium text-foreground">{huangliData.ganZhi.charAt(1)}日冲{huangliData.sha}方</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{huangliData.xingXiuDesc}</p>
          </div>

          {/* 彭祖百忌 */}
          {huangliData.pengZuBaiJi.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100 dark:border-amber-800 p-4">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">彭祖百忌</p>
              <div className="space-y-1">
                {huangliData.pengZuBaiJi.map((ji, index) => (
                  <p key={index} className="text-xs text-amber-700 dark:text-amber-400">{ji}</p>
                ))}
              </div>
            </div>
          )}

          {/* 吉神凶煞 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">吉神宜趋</p>
              <div className="flex flex-wrap gap-1">
                {huangliData.jiShen.map((shen) => (
                  <span key={shen} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                    {shen}
                  </span>
                ))}
                {huangliData.jiShen.length === 0 && (
                  <span className="text-xs text-muted-foreground">暂无</span>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground mb-2">凶煞宜避</p>
              <div className="flex flex-wrap gap-1">
                {huangliData.xiongShen.map((shen) => (
                  <span key={shen} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">
                    {shen}
                  </span>
                ))}
                {huangliData.xiongShen.length === 0 && (
                  <span className="text-xs text-muted-foreground">暂无</span>
                )}
              </div>
            </div>
          </div>

          {/* AI解读按钮 */}
          <Button
            onClick={handleInterpret}
            disabled={isAILoading || isStreaming}
            variant="outline"
            className="w-full border-border text-primary hover:bg-primary/10"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isAILoading || isStreaming ? "解读中..." : "AI运势解读"}
          </Button>
        </div>
      )}

      {/* AI解读结果 */}
      <AIInterpretation
        content={text}
        isLoading={isAILoading}
        isStreaming={isStreaming}
        error={error}
        title="运势解读"
        subject={selectedDate ? selectedDate.toLocaleDateString('zh-CN') : undefined}
        subjectLabel="日期"
      />

      {/* 追问模式 */}
      {showResult && (
        <FollowUpQuestion
          feature="huangli"
          featureName="王大爷"
          context={{
            date: selectedDate.toISOString(),
            huangli: huangliData,
          }}
          onAsk={handleFollowUp}
          disabled={isLoading}
          isLoading={isStreaming}
        />
      )}
    </div>
  );
}
