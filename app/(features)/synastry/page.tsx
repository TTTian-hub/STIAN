"use client";

import { useState } from "react";
import { Heart, Sparkles, User, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AIInterpretation } from "@/components/features/ai-interpretation";
import { useAIStream } from "@/lib/ai/hooks";
import { DatePicker } from "@/components/features/date-picker";
import { Label } from "@/components/ui/label";
import {
  RelationshipTypeSelector,
  RelationshipType,
} from "@/components/features/synastry/relationship-type-selector";
import { SynastryResult } from "@/components/features/synastry/synastry-result";
import { useConversationStore } from "@/lib/conversation/store";
import { FollowUpQuestion } from "@/components/features/follow-up-question";

type SynastryType = "zodiac" | "bazi" | "combined";

interface SynastryData {
  zodiac?: {
    sign1: string;
    sign2: string;
    element1: string;
    element2: string;
    score: number;
    analysis: string;
  };
  bazi?: {
    bazi1: string;
    bazi2: string;
    zodiac1: string;
    zodiac2: string;
    score: number;
    analysis: string;
  };
  overallScore: number;
}

export default function SynastryPage() {
  const [date1, setDate1] = useState<Date>();
  const [date2, setDate2] = useState<Date>();
  const [name1, setName1] = useState("");
  const [name2, setName2] = useState("");
  const [gender1, setGender1] = useState<"male" | "female">("male");
  const [gender2, setGender2] = useState<"male" | "female">("female");
  const [type, setType] = useState<SynastryType>("combined");
  const [relationshipType, setRelationshipType] = useState<RelationshipType>("romance");
  const [synastryData, setSynastryData] = useState<SynastryData | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const { stream, isLoading, isStreaming, text, error, reset } = useAIStream();

  // 追问模式
  const {
    createConversation,
    addMessage,
    getCurrentConversation,
  } = useConversationStore();

  // 第一步：计算合盘（纯计算，不限流）
  const handleCalculate = async () => {
    if (!date1 || !date2) return;

    setIsCalculating(true);
    reset();
    setSynastryData(null);
    setGeneratedPrompt("");

    try {
      const response = await fetch("/api/synastry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date1: date1.toISOString(),
          date2: date2.toISOString(),
          type,
          relationshipType,
          name1: name1 || undefined,
          name2: name2 || undefined,
          gender1,
          gender2,
          // 不传 prompt，表示只计算不合盘不解读
        }),
      });

      if (!response.ok) {
        throw new Error("Calculation failed");
      }

      const result = await response.json();

      if (result.success) {
        setSynastryData(result.data);
        setGeneratedPrompt(result.prompt);
        setShowResults(true);

        // 创建对话上下文
        createConversation("synastry", `合盘分析 - ${name1 || '未知'}与${name2 || '未知'}`, {
          name1: name1 || '未知',
          name2: name2 || '未知',
          type,
          relationshipType,
          date1: date1.toISOString(),
          date2: date2.toISOString(),
        });
      }
    } catch (err) {
      console.error("Synastry calculation error:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  // 第二步：AI解读（单独触发，限流）
  const handleInterpret = async () => {
    if (!generatedPrompt) return;

    reset();

    // 记录用户提问
    const conversation = getCurrentConversation();
    if (conversation) {
      addMessage(conversation.id, 'user', generatedPrompt);
    }

    await stream(generatedPrompt, { endpoint: "/api/synastry" });
  };

  // 处理追问
  const handleFollowUp = async (question: string, history: Array<{ role: string; content: string }>) => {
    const conversation = getCurrentConversation();
    if (!conversation) return;

    // 记录用户追问
    addMessage(conversation.id, 'user', question);

    // 构建上下文感知的提示词
    const contextPrompt = `基于之前的合盘分析，用户追问：${question}

请根据合盘信息（${synastryData?.zodiac ? `星座：${synastryData.zodiac.sign1}与${synastryData.zodiac.sign2}` : ''}${synastryData?.bazi ? `八字：${synastryData.bazi.bazi1}与${synastryData.bazi.bazi2}` : ''}）回答用户的问题。`;

    await stream(contextPrompt, { endpoint: "/api/synastry" });

    // 记录AI回复（需要监听stream完成后，这里简化处理）
    setTimeout(() => {
      addMessage(conversation.id, 'assistant', text || '思考中...');
    }, 1000);
  };

  const handleReset = () => {
    setShowResults(false);
    setSynastryData(null);
    setGeneratedPrompt("");
    reset();
  };

  // Show results view
  if (showResults) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">合盘分析结果</h1>
            <p className="text-sm text-muted-foreground">
              {type === "zodiac"
                ? "星座合盘"
                : type === "bazi"
                ? "八字合婚"
                : "综合合盘"}
            </p>
          </div>
        </div>

        {synastryData && (
          <SynastryResult
            zodiacData={synastryData.zodiac || null}
            baziData={synastryData.bazi || null}
            overallScore={synastryData.overallScore}
          />
        )}

        {/* AI解读按钮 - 单独触发 */}
        {!text && !isLoading && (
          <Button
            onClick={handleInterpret}
            disabled={isLoading || isStreaming}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            AI深度解读
          </Button>
        )}

        <AIInterpretation
          content={text}
          isLoading={isLoading}
          isStreaming={isStreaming}
          error={error}
          title="AI 深度解读"
          subject={[name1, name2].filter(Boolean).join(' 与 ') || undefined}
          subjectLabel="缘主"
          onRegenerate={handleInterpret}
        />

        {/* 追问模式 */}
        {showResults && (
          <FollowUpQuestion
            feature="synastry"
            featureName="情感咨询师小雨"
            context={{
              name1: name1 || '未知',
              name2: name2 || '未知',
              type,
              relationshipType,
              synastryData,
            }}
            onAsk={handleFollowUp}
            disabled={isLoading}
            isLoading={isStreaming}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">合盘预测</h1>
        <p className="text-muted-foreground">双人星座/八字合盘，AI分析配对指数</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Analysis Type */}
        <div className="space-y-2">
          <Label>合盘类型</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "zodiac" as const, label: "星座合盘" },
              { id: "bazi" as const, label: "八字合婚" },
              { id: "combined" as const, label: "综合合盘" },
            ].map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setType(id)}
                className={`py-3 rounded-lg border transition-all ${
                  type === id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                <span className="text-sm font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Relationship Type Selector */}
        <RelationshipTypeSelector
          selected={relationshipType}
          onSelect={setRelationshipType}
        />

        {/* Person 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            <Label className="font-semibold">第一人</Label>
          </div>
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">姓名（选填）</Label>
            <Input
              type="text"
              value={name1}
              onChange={(e) => setName1(e.target.value)}
              placeholder="输入姓名"
              className="w-full"
            />
          </div>
          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">性别</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setGender1("male")}
                className={`flex-1 py-3 rounded-lg border transition-all ${
                  gender1 === "male"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                男
              </button>
              <button
                onClick={() => setGender1("female")}
                className={`flex-1 py-3 rounded-lg border transition-all ${
                  gender1 === "female"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                女
              </button>
            </div>
          </div>
          {/* Birth Date */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">出生日期</Label>
            <DatePicker
              date={date1}
              onSelect={setDate1}
              placeholder="选择出生日期"
            />
          </div>
        </div>

        <div className="border-t border-border" />

        {/* Person 2 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-primary" />
            <Label className="font-semibold">第二人</Label>
          </div>
          {/* Name */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">姓名（选填）</Label>
            <Input
              type="text"
              value={name2}
              onChange={(e) => setName2(e.target.value)}
              placeholder="输入姓名"
              className="w-full"
            />
          </div>
          {/* Gender */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">性别</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setGender2("male")}
                className={`flex-1 py-3 rounded-lg border transition-all ${
                  gender2 === "male"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                男
              </button>
              <button
                onClick={() => setGender2("female")}
                className={`flex-1 py-3 rounded-lg border transition-all ${
                  gender2 === "female"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                女
              </button>
            </div>
          </div>
          {/* Birth Date */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">出生日期</Label>
            <DatePicker
              date={date2}
              onSelect={setDate2}
              placeholder="选择出生日期"
            />
          </div>
        </div>

        {/* 分析合盘按钮 */}
        <Button
          onClick={handleCalculate}
          disabled={!date1 || !date2 || isCalculating}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isCalculating ? "分析中..." : "分析合盘"}
        </Button>
      </div>
    </div>
  );
}
