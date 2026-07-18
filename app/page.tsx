"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Compass,
  Heart,
  Layers,
  MessageCircle,
  MoonStar,
  Sparkles,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { ensureTrial, getToken } from "@/lib/quota";
import { usePaywall } from "@/lib/paywall-store";
import { useBalance } from "@/lib/balance-store";

type Intent = "today" | "answer" | "self" | "relation";
type MethodId = "tarot" | "bazi" | "astro" | "ai";

const intents: Array<{ id: Intent; tag: string; icon: LucideIcon; title: string; description: string; tone: string }> = [
  { id: "today", tag: "TODAY", icon: MoonStar, title: "看见当下", description: "今天的情绪、能量与生活节奏", tone: "yellow" },
  { id: "answer", tag: "QUESTION", icon: Sparkles, title: "问一个答案", description: "为犹豫已久的选择找一个角度", tone: "pink" },
  { id: "self", tag: "INNER SELF", icon: User, title: "认识自己", description: "读懂性格、优势与内在动力", tone: "mint" },
  { id: "relation", tag: "TOGETHER", icon: Heart, title: "理解关系", description: "看见两个人靠近时的节奏与期待", tone: "lavender" },
];

const methods: Array<{ id: MethodId; icon: LucideIcon; title: string; description: string }> = [
  { id: "tarot", icon: Layers, title: "塔罗映照", description: "让象征图像替潜意识说话" },
  { id: "bazi", icon: Compass, title: "东方命盘", description: "从生辰与五行寻找生命线索" },
  { id: "astro", icon: CalendarDays, title: "星象日历", description: "从今天的宇宙节律获得提示" },
  { id: "ai", icon: MessageCircle, title: "AI 心语", description: "围绕你的问题展开温柔对话" },
];

const themes = [
  "事业与选择", "关系与靠近", "情绪与能量", "成长与自我",
  "财务与富足", "健康与疗愈", "创意与表达", "家庭与根源",
];

interface ReadingResult {
  label: string;
  title: string;
  main: string;
  suitable: string;
  notice: string;
  action: string;
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [intent, setIntent] = useState<Intent | null>(null);
  const [method, setMethod] = useState<MethodId | null>(null);
  const [theme, setTheme] = useState("");
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [errMsg, setErrMsg] = useState("");

  const openPaywall = usePaywall((s) => s.openPaywall);
  const refreshBalance = useBalance((s) => s.refresh);

  const begin = () => {
    setOpen(true);
    setStep(1);
    setIntent(null);
    setMethod(null);
    setTheme("");
    setName("");
    setQuestion("");
    setResult(null);
    setErrMsg("");
  };
  const close = () => setOpen(false);
  const chooseIntent = (v: Intent) => { setIntent(v); setStep(2); };
  const chooseMethod = (v: MethodId) => { setMethod(v); setStep(3); };
  const back = (n: 1 | 2 | 3) => setStep(n);

  const selectedIntent = intents.find((i) => i.id === intent);
  const selectedMethod = methods.find((m) => m.id === method);

  const submit = async () => {
    if (!question.trim()) { setErrMsg("请先写下你的问题"); return; }
    setErrMsg("");
    setLoading(true);
    try {
      await ensureTrial();
      const token = getToken();
      const requestId = (globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { "x-entitlement": token } : {}) },
        body: JSON.stringify({
          intent: selectedIntent?.title,
          method: selectedMethod?.title,
          theme: theme || selectedIntent?.title,
          name: name.trim(),
          question: question.trim(),
          request_id: requestId,
        }),
      });
      if (res.status === 402) {
        const d = await res.json().catch(() => ({} as Record<string, string>));
        setErrMsg(d.error || d.message || "余额不足，请先充值");
        openPaywall();
        return;
      }
      if (res.status === 502) {
        setErrMsg("解读生成失败，本次次数已自动退回");
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}) as Record<string, string>);
        setErrMsg(d.error || "生成失败，请稍后再试");
        return;
      }
      const data = await res.json();
      setResult({
        label: data.label || `${selectedMethod?.title} · ${theme || selectedIntent?.title}`,
        title: data.title || "给此刻的你",
        main: data.main || "",
        suitable: data.suitable || "",
        notice: data.notice || "",
        action: data.action || "",
      });
      refreshBalance();
      setStep(4);
    } catch {
      setErrMsg("网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fate-home">
      <div className="cosmic-sky" aria-hidden="true"><span className="moon" /><span className="cloud cloud-a" /><span className="cloud cloud-b" /><span className="star-field" /></div>

      {/* 主题化导航栏 */}
      <nav className="fate-nav">
        <a className="brand" href="/"><span className="brand-mark">问</span><span>AskFate</span></a>
        <span className="mini-pill">AI 解读 · 私密探索</span>
      </nav>

      <section className="fate-hero">
        <div className="hero-copy">
          <div className="cosmic-badge"><Sparkles className="size-3.5" /> COSMIC MESSAGE FOR YOU</div>
          <h1>宇宙正在<span>给你回信</span></h1>
          <p>把烦恼交给星星一会儿。融合东方命理、塔罗象征与 <strong>AI 个性化解读</strong>，陪你看见问题背后的另一种可能。</p>
          <div className="hero-actions">
            <button className="fate-primary" type="button" onClick={begin}>开始我的探索 <i><ArrowRight className="size-4" /></i></button>
            <div className="privacy-note"><span className="avatar-dots"><i /><i /><i /></span>一段只属于你的旅程</div>
          </div>
        </div>
        <div className="magic-sticker">TODAY&apos;S<br />MAGIC<br />IS HERE</div>
        <div className="cosmic-note"><span>✦ 今日宇宙便签</span><b>答案并不遥远，<br />它只是换了一种语言。</b></div>
      </section>
      <div className="fate-marquee" aria-hidden="true"><div>✦ 八字命盘　✦ 塔罗映照　✦ 星象日历　✦ 关系合盘　✦ AI 温柔解读　✦ 八字命盘　✦ 塔罗映照　✦ 星象日历　✦ 关系合盘</div></div>

      {open && (
        <div className="fate-journey" role="dialog" aria-modal="true" aria-label="开始探索">
          <header className="journey-header">
            <b>AskFate · 你的宇宙漫游</b>
            <div className="journey-dots" aria-label={`第 ${step} 步，共 4 步`}>
              {[1, 2, 3, 4].map((n) => <i key={n} className={n <= step ? "active" : ""} />)}
            </div>
            <button type="button" onClick={close} aria-label="关闭"><X className="size-5" /></button>
            <div className="journey-progress" style={{ width: `${step * 25}%` }} />
          </header>
          <main className="journey-content">
            {/* Step 1 · 选意图 */}
            {step === 1 && (
              <section className="journey-stage">
                <div className="stage-title"><span>01</span><div><h2>此刻，哪件事在敲你的心门？</h2><p>凭第一感觉选择，不需要想得太久。你的直觉已经知道从哪里开始。</p></div></div>
                <div className="intent-grid">{intents.map(({ id, tag, icon: Icon, title, description, tone }) => (
                  <button className={`intent-card ${tone}`} type="button" key={id} onClick={() => chooseIntent(id)}>
                    <small>{tag}</small><i className="intent-icon"><Icon /></i><b>{title}</b><p>{description}</p><span><ArrowRight /></span>
                  </button>
                ))}</div>
              </section>
            )}

            {/* Step 2 · 选方式 */}
            {step === 2 && (
              <section className="journey-stage">
                <button className="journey-back" type="button" onClick={() => back(1)}><ArrowLeft className="size-4" /> 返回上一层</button>
                <div className="stage-title"><span>02</span><div><h2>选择一扇通往答案的门</h2><p>你选择了「{selectedIntent?.title}」。不同的方式，会照亮问题不同的侧面。</p></div></div>
                <div className="method-grid">{methods.map(({ id, icon: Icon, title, description }) => (
                  <button className="method-card" type="button" key={id} onClick={() => chooseMethod(id)}>
                    <i className="method-icon"><Icon /></i>
                    <span><b>{title}</b><small>{description}</small></span>
                    <i className="method-arrow"><ArrowRight /></i>
                  </button>
                ))}</div>
              </section>
            )}

            {/* Step 3 · 写问题 */}
            {step === 3 && (
              <section className="journey-stage">
                <button className="journey-back" type="button" onClick={() => back(2)}><ArrowLeft className="size-4" /> 返回上一层</button>
                <div className="stage-title"><span>03</span><div><h2>把心里的那句话写下来</h2><p>越具体的问题，越容易看见真正重要的部分。</p></div></div>
                <div className="question-wrap">
                  <aside className="theme-panel">
                    <h3>先选一个关键词</h3>
                    <div className="chips">{themes.map((t) => (
                      <button className={`chip ${theme === t ? "selected" : ""}`} type="button" key={t} onClick={() => setTheme(t)}>{t}</button>
                    ))}</div>
                  </aside>
                  <form className="form-card" onSubmit={(e) => { e.preventDefault(); submit(); }}>
                    <h3>你的问题</h3>
                    <label htmlFor="name">如何称呼你（选填）</label>
                    <input className="input" id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="例如：小林" />
                    <label htmlFor="question">此刻最想得到启发的一件事</label>
                    <textarea className="input" id="question" value={question} onChange={(e) => setQuestion(e.target.value)} required placeholder="例如：我是否应该为新的机会迈出一步？" />
                    {errMsg && <p className="form-error">{errMsg}</p>}
                    <button className="fate-primary submit" type="submit" disabled={loading}>{loading ? "宇宙正在为你展开…" : <>请宇宙为我展开 <i><Sparkles className="size-4" /></i></>}</button>
                  </form>
                </div>
              </section>
            )}

            {/* Step 4 · 宇宙回信 */}
            {step === 4 && result && (
              <section className="journey-stage">
                <button className="journey-back" type="button" onClick={() => back(3)}><ArrowLeft className="size-4" /> 修改我的问题</button>
                <div className="stage-title"><span>04</span><div><h2>你的宇宙回信已抵达</h2><p>它不是预言，而是一面帮助你重新看见自己的镜子。</p></div></div>
                <div className="result-wrap"><article className="reading">
                  <span className="reading-label">{result.label}</span>
                  <h3>{result.title}</h3>
                  <p>{result.main}</p>
                  <div className="reading-notes">
                    <div className="note"><b>今天适合</b><span>{result.suitable || "整理思路，确认真正想守住的东西。"}</span></div>
                    <div className="note"><b>值得留意</b><span>{result.notice || "反复出现的感受，往往比答案更诚实。"}</span></div>
                    <div className="note"><b>小小行动</b><span>{result.action || "只做下一步，不必一次走完整条路。"}</span></div>
                  </div>
                </article>
                <button className="fate-primary submit finish" type="button" onClick={close}>收下这封回信 <i><Heart className="size-4" /></i></button>
                </div>
              </section>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
