"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { AIInterpretation } from "@/components/features/ai-interpretation";
import { useAIStream } from "@/lib/ai/hooks";
import { DatePicker } from "@/components/features/date-picker";
import { Label } from "@/components/ui/label";
import { BaziChart } from "@/components/features/bazi/bazi-chart";
import { ShishenDisplay } from "@/components/features/bazi/shishen-display";
import { WuxingChart } from "@/components/features/bazi/wuxing-chart";
import { DayunDisplay } from "@/components/features/bazi/dayun-display";
import { BaziAnalysis } from "@/components/features/bazi/bazi-analysis";
import { BaziResult } from "@/lib/calculations/bazi";
import { calculateBaziShishen, ShishenInfo } from "@/lib/calculations/shishen";
import { WuxingAnalysis } from "@/lib/calculations/wuxing";
import { Dayun } from "@/lib/calculations/dayun";
import { Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useConversationStore } from "@/lib/conversation/store";
import { FollowUpQuestion } from "@/components/features/follow-up-question";

export default function BaziPage() {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date>();
  const [birthTime, setBirthTime] = useState("12:00");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [isEarlyZi, setIsEarlyZi] = useState<boolean>(true);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [baziData, setBaziData] = useState<BaziResult | null>(null);
  const [shishenData, setShishenData] = useState<{
    year: ShishenInfo;
    month: ShishenInfo;
    day: ShishenInfo;
    hour: ShishenInfo;
    dayMaster: string;
  } | null>(null);
  const [wuxingData, setWuxingData] = useState<WuxingAnalysis | null>(null);
  const [dayunData, setDayunData] = useState<Dayun[] | null>(null);
  const [showChart, setShowChart] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const { stream, isLoading, isStreaming, text, error, reset } = useAIStream();

  // 追问模式
  const {
    createConversation,
    addMessage,
    getCurrentConversation,
  } = useConversationStore();

  // Check if current time is in Zi hour (23:00-00:59)
  const isZiHour = useMemo(() => {
    if (!birthTime) return false;
    const hour = parseInt(birthTime.split(":")[0]);
    return hour >= 23 || hour < 1;
  }, [birthTime]);

  // 第一步：排盘（不触发AI，不限流）
  const handleCalculate = async () => {
    if (!birthDate) return;

    setIsCalculating(true);
    reset();
    setShowChart(false);
    setBaziData(null);
    setShishenData(null);
    setWuxingData(null);
    setDayunData(null);

    try {
      const response = await fetch("/api/bazi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          birthDate: birthDate.toISOString(),
          birthTime: timeUnknown ? undefined : birthTime,
          gender,
          isEarlyZi,
          timeUnknown,
          // 不传 prompt，表示只排盘不解读
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.bazi) {
          setBaziData(data.bazi);
          setShishenData(data.bazi.shishen);
          setWuxingData(data.bazi.wuxing);
          setDayunData(data.bazi.dayun);
          setShowChart(true);

          // 创建对话上下文
          createConversation("bazi", `八字分析 - ${name || '未知'}`, {
            name: name || '未知',
            birthDate: birthDate.toISOString(),
            birthTime: timeUnknown ? '未知' : birthTime,
            gender,
            bazi: data.bazi,
          });
        }
      }
    } catch (err) {
      console.error("Failed to calculate BaZi:", err);
    } finally {
      setIsCalculating(false);
    }
  };

  // 第二步：AI解读（单独触发，限流）
  const handleInterpret = async () => {
    if (!birthDate) return;

    reset();
    const ziHourInfo = isZiHour && !timeUnknown ? (isEarlyZi ? "（早子时）" : "（晚子时）") : "";
    const timeInfo = timeUnknown ? "时间不确定" : `${birthTime}${ziHourInfo}`;
    const namePrefix = name ? `为${name}，` : "";
    const promptText = `${namePrefix}性别${gender === "male" ? "男" : "女"}，出生日期 ${birthDate.toLocaleDateString()}，${timeInfo} 进行八字分析。`;

    // 记录用户提问
    const conversation = getCurrentConversation();
    if (conversation) {
      addMessage(conversation.id, 'user', promptText);
    }

    await stream(promptText, { endpoint: "/api/bazi" });
  };

  // 处理追问
  const handleFollowUp = async (question: string, history: Array<{ role: string; content: string }>) => {
    const conversation = getCurrentConversation();
    if (!conversation) return;

    // 记录用户追问
    addMessage(conversation.id, 'user', question);

    // 构建上下文感知的提示词
    const contextPrompt = `基于之前的八字分析，用户追问：${question}

请根据八字命盘信息（${baziData?.year.gan}${baziData?.year.zhi} ${baziData?.month.gan}${baziData?.month.zhi} ${baziData?.day.gan}${baziData?.day.zhi} ${baziData?.hour?.gan}${baziData?.hour?.zhi}）回答用户的问题。`;

    await stream(contextPrompt, { endpoint: "/api/bazi" });

    // 记录AI回复（需要监听stream完成后，这里简化处理）
    setTimeout(() => {
      addMessage(conversation.id, 'assistant', text || '思考中...');
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">八字算命</h1>
        <p className="text-muted-foreground">输入出生时间，生成八字命盘</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 space-y-6">
        {/* Name Input */}
        <div className="space-y-2">
          <Label>姓名（选填）</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入您的姓名"
            className="w-full"
          />
        </div>

        {/* Gender Selection */}
        <div className="space-y-2">
          <Label>性别</Label>
          <div className="flex gap-2">
            <button
              onClick={() => setGender("male")}
              className={`flex-1 py-3 rounded-lg border transition-all ${
                gender === "male"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              男
            </button>
            <button
              onClick={() => setGender("female")}
              className={`flex-1 py-3 rounded-lg border transition-all ${
                gender === "female"
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
          <Label>出生日期</Label>
          <DatePicker
            date={birthDate}
            onSelect={setBirthDate}
            placeholder="选择出生日期"
            fromYear={1900}
            toYear={2100}
          />
        </div>

        {/* Birth Time */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>出生时间</Label>
            <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={timeUnknown}
                onChange={(e) => setTimeUnknown(e.target.checked)}
                className="rounded border-border"
              />
              时间不确定
            </label>
          </div>
          {!timeUnknown && (
            <input
              type="time"
              value={birthTime}
              onChange={(e) => setBirthTime(e.target.value)}
              className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          )}
          {timeUnknown && (
            <p className="text-sm text-muted-foreground px-1">
              将按日柱推算，不涉及时辰
            </p>
          )}
        </div>

        {/* Early/Late Zi Hour Selection */}
        {isZiHour && !timeUnknown && (
          <div className="space-y-2">
            <Label>子时选择（23:00-00:59）</Label>
            <div className="flex gap-2">
              <button
                onClick={() => setIsEarlyZi(true)}
                className={`flex-1 py-3 rounded-lg border transition-all ${
                  isEarlyZi
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                早子时（23:00-24:00）
              </button>
              <button
                onClick={() => setIsEarlyZi(false)}
                className={`flex-1 py-3 rounded-lg border transition-all ${
                  !isEarlyZi
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card border-border hover:border-primary/50"
                }`}
              >
                晚子时（00:00-01:00）
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              早子时算作当日，晚子时算作次日
            </p>
          </div>
        )}

        {/* 排盘按钮 */}
        <Button
          onClick={handleCalculate}
          disabled={!birthDate || isCalculating}
          className="w-full bg-primary hover:bg-primary/90"
        >
          {isCalculating ? "排盘中..." : "开始排盘"}
        </Button>
      </div>

      {/* BaZi Chart Display - 排盘结果 */}
      {showChart && (
        <div className="space-y-6">
          <BaziChart bazi={baziData} />
          <BaziAnalysis bazi={baziData} shishen={shishenData} wuxing={wuxingData} />
          <ShishenDisplay bazi={baziData} shishen={shishenData} />
          <WuxingChart wuxing={wuxingData} />
          <DayunDisplay dayun={dayunData} />

          {/* AI解读按钮 - 单独触发 */}
          <Button
            onClick={handleInterpret}
            disabled={isLoading || isStreaming}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {isLoading || isStreaming ? "解读中..." : "AI解读命盘"}
          </Button>
        </div>
      )}

      {/* AI解读结果 */}
      <AIInterpretation
        content={text}
        isLoading={isLoading}
        isStreaming={isStreaming}
        error={error}
        title="八字分析"
        subject={name || undefined}
        subjectLabel="命主"
      />

      {/* 追问模式 */}
      {showChart && (
        <FollowUpQuestion
          feature="bazi"
          featureName="八字分析师"
          context={{
            name: name || '未知',
            birthDate: birthDate?.toISOString(),
            gender,
            bazi: baziData,
          }}
          onAsk={handleFollowUp}
          disabled={isLoading}
          isLoading={isStreaming}
        />
      )}
    </div>
  );
}
