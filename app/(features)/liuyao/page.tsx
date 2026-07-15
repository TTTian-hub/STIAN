"use client";

import { useState } from "react";
import { Sparkles, Clock, Hash, Hand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AIInterpretation } from "@/components/features/ai-interpretation";
import { useAIStream } from "@/lib/ai/hooks";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/features/date-picker";
import { GuaDisplay } from "@/components/features/liuyao/gua-display";
import { LiuqinLiushen } from "@/components/features/liuyao/liuqin-liushen";
import { calculateLiuYaoEnhanced } from "@/lib/calculations/liuyao-enhanced";
import { LiuYaoResult } from "@/lib/calculations/liuyao";
import { LIUYAO_SYSTEM_PROMPT, generateLiuyaoPrompt, LIUYAO_FOLLOWUP_PROMPT } from "@/lib/prompts/liuyao";
import { useConversationStore } from "@/lib/conversation/store";
import { FollowUpQuestion } from "@/components/features/follow-up-question";

type DivinationMethod = "time" | "number" | "manual";

export default function LiuyaoPage() {
  const [method, setMethod] = useState<DivinationMethod>("time");
  const [question, setQuestion] = useState("");
  const [number, setNumber] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [manualLines, setManualLines] = useState<boolean[]>([false, false, false, false, false, false]);
  const [liuyaoData, setLiuyaoData] = useState<LiuYaoResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const { stream, isLoading, isStreaming, text, error, reset } = useAIStream();

  // 对话管理
  const {
    createConversation,
    addMessage,
    getCurrentConversation,
    getMessagesForAPI,
  } = useConversationStore();

  // 第一步：起卦（纯计算，不限流）
  const handleCalculate = async () => {
    setIsCalculating(true);
    reset();
    setShowResult(false);
    setLiuyaoData(null);

    // Prepare calculation parameters
    let calcBody: Record<string, unknown> = { method };

    switch (method) {
      case "number":
        if (number) {
          const nums = number.split(/\D+/).map(Number).filter(n => !isNaN(n));
          calcBody.numbers = nums.length >= 2 ? nums.slice(0, 3) : [parseInt(number), parseInt(number) + 1, parseInt(number) + 2];
        }
        break;
      case "time":
        calcBody.date = selectedDate.toISOString();
        break;
      case "manual": {
        const manualResults = manualLines.map((isYang) =>
          isYang ? "young-yang" : "young-yin"
        ) as ("young-yang" | "young-yin")[];
        calcBody.manualResults = manualResults;
        break;
      }
    }

    try {
      const response = await fetch("/api/liuyao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(calcBody),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.liuyao) {
          setLiuyaoData(data.liuyao);
          setShowResult(true);

          // 创建新的对话
          createConversation("liuyao", `六爻预测 - ${question || "未问事"}`, {
            guaName: data.liuyao.benGua.name,
            question,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      console.error("Failed to calculate LiuYao:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  // 第二步：AI解读（单独触发，限流）
  const handleInterpret = async () => {
    if (!liuyaoData) return;

    reset();

    const prompt = generateLiuyaoPrompt(
      liuyaoData.benGua.name,
      liuyaoData.benGua.guaCi,
      liuyaoData.benGua.name,
      liuyaoData.bianGua?.name,
      liuyaoData.dongYao,
      liuyaoData.shiYao,
      liuyaoData.yingYao,
      liuyaoData.liuQin,
      liuyaoData.liuShen,
      liuyaoData.yueJian || "",
      liuyaoData.riChen || "",
      liuyaoData.yongShen,
      question
    );

    // 添加用户消息到对话历史
    const conversation = getCurrentConversation();
    if (conversation) {
      addMessage(conversation.id, "user", prompt);
    }

    await stream(prompt, {
      systemPrompt: LIUYAO_SYSTEM_PROMPT,
      endpoint: "/api/liuyao",
    });

    // 添加AI回复到对话历史
    if (conversation && text) {
      addMessage(conversation.id, "assistant", text);
    }
  };

  const toggleLine = (index: number) => {
    setManualLines((prev) => prev.map((v, i) => (i === index ? !v : v)));
  };

  const handleReset = () => {
    setShowResult(false);
    setLiuyaoData(null);
    reset();
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">六爻预测</h1>
        <p className="text-muted-foreground">数字、时间、手动起卦，AI解卦</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Method Selection */}
        <div className="space-y-2">
          <Label>起卦方式</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "time" as const, label: "时间起卦", icon: Clock },
              { id: "number" as const, label: "数字起卦", icon: Hash },
              { id: "manual" as const, label: "手动起卦", icon: Hand },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMethod(id)}
                className={`flex flex-col items-center gap-2 py-4 rounded-lg border transition-all ${
                  method === id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Number Input */}
        {method === "number" && (
          <div className="space-y-2">
            <Label>数字（1-1000）</Label>
            <input
              type="number"
              min="1"
              max="1000"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="输入一个数字起卦"
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        )}

        {/* Date Input for time method */}
        {method === "time" && (
          <div className="space-y-2">
            <Label>选择时间</Label>
            <DatePicker
              date={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              placeholder="选择日期"
            />
          </div>
        )}

        {/* Manual Lines Input */}
        {method === "manual" && (
          <div className="space-y-2">
            <Label>手动摇卦（从下往上，阳爻点击选中）</Label>
            <div className="flex flex-col gap-2 items-center py-4">
              {[5, 4, 3, 2, 1, 0].map((index) => (
                <button
                  key={index}
                  onClick={() => toggleLine(index)}
                  className={`w-32 h-8 rounded transition-all ${
                    manualLines[index]
                      ? "bg-primary"
                      : "border-2 border-primary bg-transparent"
                  }`}
                >
                  <span className="text-xs text-muted-foreground">第{6 - index}爻</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Question */}
        <div className="space-y-2">
          <Label>所问之事（可选）</Label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="例如：问考试、求职、感情..."
            rows={3}
            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>

        {/* 起卦按钮 */}
        <Button
          onClick={handleCalculate}
          disabled={isCalculating || (method === "number" && !number)}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isCalculating ? "起卦中..." : "开始起卦"}
        </Button>
      </div>

      {/* Gua Display - 起卦结果 */}
      {showResult && liuyaoData && (
        <div className="space-y-6">
          <GuaDisplay liuyao={liuyaoData} />
          <LiuqinLiushen liuyao={liuyaoData} />

          {/* 显示用神信息 */}
          {liuyaoData.yongShen && (
            <div className="bg-card border border-border rounded-xl p-4">
              <h3 className="font-semibold mb-2">用神分析</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p><span className="text-green-600">用神：</span>{liuyaoData.yongShen}</p>
                {liuyaoData.xiShen && <p><span className="text-blue-600">喜神：</span>{liuyaoData.xiShen}</p>}
                {liuyaoData.jiShen && <p><span className="text-red-600">忌神：</span>{liuyaoData.jiShen}</p>}
              </div>
            </div>
          )}

          {/* AI解读按钮 */}
          {!text && !isLoading && (
            <Button
              onClick={handleInterpret}
              disabled={isLoading || isStreaming}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              AI解卦
            </Button>
          )}
        </div>
      )}

      {/* AI解读结果 */}
      {(text || isLoading) && (
        <AIInterpretation
          content={text}
          isLoading={isLoading}
          isStreaming={isStreaming}
          error={error}
          title="六爻解卦"
          subject={question || undefined}
          subjectLabel="问"
        />
      )}

      {/* 追问功能 */}
      {showResult && (
        <FollowUpQuestion
          feature="liuyao"
          featureName="老张"
          context={{
            guaName: liuyaoData?.benGua.name,
            question,
          }}
          onAsk={async (question, history) => {
            const conversation = getCurrentConversation();
            if (!conversation) return;

            reset();

            addMessage(conversation.id, "user", question);

            const messages = getMessagesForAPI(conversation.id, 10);

            const contextPrompt = `${LIUYAO_FOLLOWUP_PROMPT}\n\n之前的卦象背景：\n- 本卦：${liuyaoData?.benGua.name}\n- 问题：${question || "未明确提问"}\n\n用户追问：${question}`;

            await stream(contextPrompt, {
              systemPrompt: LIUYAO_SYSTEM_PROMPT,
              endpoint: "/api/liuyao",
            });

            if (text) {
              addMessage(conversation.id, "assistant", text);
            }
          }}
          disabled={isCalculating}
          isLoading={isStreaming}
        />
      )}
    </div>
  );
}
