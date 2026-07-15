<div id="chinese"></div>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=🔮%20AskFate%20问命&fontSize=70&animation=fadeIn&fontAlignY=35&desc=AI智能命理占卜平台&descAlignY=55&descSize=20"/>

<br>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  <img src="https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind">
  <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Vercel%20AI%20SDK-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel AI">
  <img src="https://img.shields.io/badge/Framer%20Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer">
  <img src="https://img.shields.io/badge/Zustand-433E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand">
</p>

<p align="center">
  <a href="#-预览"><strong>🖼️ 预览</strong></a> •
  <a href="#-功能特性"><strong>✨ 功能</strong></a> •
  <a href="#-快速开始"><strong>🚀 开始</strong></a> •
  <a href="#-ai-角色"><strong>🎭 角色</strong></a> •
  <a href="#-技术栈"><strong>🛠️ 技术</strong></a>
</p>

<p align="center">
  <b>🇨🇳 中文</b> | <a href="#english">🇺🇸 English</a>
</p>

<p align="center">
  <b>🌟 融合千年东方命理智慧与现代 AI 技术 🌟</b><br>
  <i>探索命运的奥秘，从 问命/AskFate 开始</i>
</p>

<br>

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2&width=100%&section=header"/>

</div>

---

## 📖 项目简介

**问命 / AskFate** 是一个融合千年东方命理智慧与现代 AI 技术的开源占卜平台。它将老黄历、八字、星座、塔罗、奇门遁甲、六爻、合盘七大命理模块，与具备人设的 AI 解读引擎结合，让用户在精美的交互界面中获得专业、有趣、可追问的命理分析。

- 🧮 **算法 + AI 双引擎**：排盘、历法、卦象等由本地精确算法计算，解读则由 AI 角色完成，结果可解释、可深聊。
- 🤖 **高可用 AI 架构**：内置 CodeBuddy（腾讯内网）主链路与 DeepSeek 公网兜底的双 Provider 设计，任一链路超时或失败自动切换，保证服务稳定。
- 🛡️ **生产级防护**：每 IP 限流、并发控制、最小请求间隔与追问上限，开箱即用，适合公网部署。
- 🐳 **容器化交付**：提供 Dockerfile 与 CloudBase 云托管配置，一条命令即可上线。

> 💡 想直接体验或部署？见下方「🌐 公网部署（CloudBase 云托管）」。完整文档见 [DEPLOY.md](./DEPLOY.md)。

---

## 🖼️ 预览

<div align="center">

| 🏠 **首页** | 📱 **移动端适配** |
|:-----------:|:-----------------:|
| 精美卡片式布局 | 响应式设计 |
| 流畅动画效果 | 随时随地占卜 |

<br>

<img src="https://img.shields.io/badge/🎯%20已支持-7种占卜方式-FF6B6B?style=flat-square&labelColor=gray"/>
<img src="https://img.shields.io/badge/🤖%20AI%20驱动-多模型支持-4ECDC4?style=flat-square&labelColor=gray"/>
<img src="https://img.shields.io/badge/💬%20智能追问-上下文记忆-45B7D1?style=flat-square&labelColor=gray"/>

</div>

---

## ✨ 功能特性

### 🔮 七大命理模块

<div align="center">

<table>
<tr>
<td width="33%" align="center">

### 📅 老黄历
<img src="https://img.shields.io/badge/传统历法-FF6B6B?style=flat-square"/>

每日宜忌 • 农历信息
二十八宿 • 彭祖百忌
吉神凶煞 • 时辰吉凶

</td>
<td width="33%" align="center">

### ♈ 星座运势
<img src="https://img.shields.io/badge/西方占星-4ECDC4?style=flat-square"/>

十二星座 • 日周月运
星座配对 • 运势分析
上升星座 • 金星火星

</td>
<td width="33%" align="center">

### 🎴 塔罗占卜
<img src="https://img.shields.io/badge/神秘塔罗-9B59B6?style=flat-square"/>

经典韦特 • AI 解读
单张占卜 • 三张牌阵
凯尔特十字 • 22 张大阿卡纳

</td>
</tr>
<tr>
<td width="33%" align="center">

### ☯️ 八字算命
<img src="https://img.shields.io/badge/四柱八字-E74C3C?style=flat-square"/>

四柱排盘 • 十神分析
五行旺衰 • 大运流年
命格判定 • 运势预测

</td>
<td width="33%" align="center">

### 🌀 奇门遁甲
<img src="https://img.shields.io/badge/帝王之术-3498DB?style=flat-square"/>

九宫排盘 • 八门九星
三奇六仪 • 值符值使
时辰吉凶 • 决策辅助

</td>
<td width="33%" align="center">

### ⚡ 六爻预测
<img src="https://img.shields.io/badge/周易断卦-F39C12?style=flat-square"/>

金钱起卦 • 梅花易数
六亲六神 • 世应分析
动爻变卦 • AI 智能解卦

</td>
</tr>
<tr>
<td width="33%" align="center">

### 💕 合盘分析
<img src="https://img.shields.io/badge/双人配对-E91E63?style=flat-square"/>

八字合婚 • 星座配对
缘分指数 • 相处建议
性格互补 • 未来展望

</td>
<td width="33%" align="center">

### 🤖 AI 追问
<img src="https://img.shields.io/badge/智能对话-00BCD4?style=flat-square"/>

连续对话 • 上下文记忆
深度解读 • 最多 10 轮
个性化回答 • 贴心交流

</td>
<td width="33%" align="center">

### ⚙️ 多模型支持
<img src="https://img.shields.io/badge/灵活切换-8BC34A?style=flat-square"/>

DeepSeek • Kimi
GLM-4 • Anthropic
一键切换 • 自由配置

</td>
</tr>
</table>

</div>

---

## 🎭 AI 角色

每个模块都有独特的人设，提供专业且有趣的解读体验：

<div align="center">

| 模块 | 👤 AI 角色 | 🎨 风格特点 | 💬 体验感受 |
|:----:|:----------:|:------------|:-----------|
| **八字** | 陈叔/陈姨 | 老街坊长辈 | 像邻居聊天一样自然亲切 |
| **六爻** | 老张 | 三十年卦摊经验 | 直来直去，接地气 |
| **合盘** | 小雨 | 温柔贴心 | 闺蜜式情感咨询 |
| **奇门** | 老李 | 道观长者 | 慢条斯理，看透世事 |
| **塔罗** | 薇薇安 | 塔罗馆老板 | 咖啡馆般的轻松氛围 |
| **星座** | 星语 | 星座达人 | 朋友聊天式分享 |
| **老黄历** | 王大爷 | 卖黄历的老人 | 老街坊生活智慧 |

</div>

---

## 🚀 快速开始

### 📋 环境要求

```
✓ Node.js 20+     ✓ npm / pnpm / yarn     ✓ AI API Key
```

### 📦 安装步骤

```bash
# 1️⃣ 克隆仓库
git clone https://github.com/TTTian-hub/STIAN.git
cd AskFate

# 2️⃣ 安装依赖
npm install

# 3️⃣ 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 API Key

# 4️⃣ 启动开发服务
npm run dev
```

然后访问 👉 **http://localhost:3000**

---

## 🚀 生产部署

```bash
# 构建生产版本
npm run build

# 启动生产服务
npm start
```

或使用 PM2 等进程管理器：

```bash
npm install -g pm2
npm run build
pm2 start npm --name "askfate" -- start
```

---

## 🌐 公网部署（CloudBase 云托管）

想让所有人都能访问？推荐用 **腾讯云 CloudBase 云托管**（容器服务，自带默认公网域名、免备案）。

**方式一：控制台 GitHub 导入（最简单，零配置）**
1. 打开 [CloudBase 控制台](https://console.cloud.tencent.com/tcb) → 新建环境 → 开通「云托管」。
2. 云托管 → 新建服务 → 来源选 **代码仓库 / GitHub** → 授权并选择本仓库 `TTTian-hub/STIAN`（分支 `main`）。
3. 构建配置：Dockerfile 已内置，监听端口填 `3000`，构建命令 `npm run build`，启动命令 `node .next/standalone/server.js`（或 `npm start`）。
4. 服务环境变量中设置 `AI_PROVIDER=deepseek` 与 `DEEPSEEK_API_KEY=sk-你的key`（其余见 [.env.production.example](./.env.production.example)）。
5. 部署完成后，控制台给出默认公网域名，直接访问即可。

**方式二：GitHub Actions 自动部署（推送即上线）**
仓库已内置 `.github/workflows/deploy.yml`。在仓库 **Settings → Secrets and variables → Actions** 中添加：
- `TENCENT_CLOUD_SECRET_ID`、`TENCENT_CLOUD_SECRET_KEY`（腾讯云 API 密钥）
- `CLOUDBASE_ENV_ID`（CloudBase 环境 ID）
之后每次 `git push` 到 `main` 自动构建并部署。

> 📘 完整步骤、环境变量、备案与费用说明见 [DEPLOY.md](./DEPLOY.md)。另提供 `STIAN-deploy.zip` 可直接在云托管「ZIP 上传」部署。

---

## ⚙️ 环境变量配置

### 🔑 必需配置（公网部署）

```env
AI_PROVIDER=deepseek        # 公网固定用 deepseek（CodeBuddy 走内网，公网服务器连不到）
DEEPSEEK_API_KEY=sk-xxxxx   # 你的 DeepSeek API Key（必填，公网真实可用）
```

> 本机开发可用 `AI_PROVIDER=codebuddy`（CodeBuddy Agent SDK 主链路），并自动以 DeepSeek 兜底；详见 [lib/ai](./lib/ai)。

### 📝 完整配置示例

<details>
<summary><b>DeepSeek (推荐)</b> - 性价比高，响应快</summary>

```env
AI_PROVIDER=deepseek
AI_API_KEY=sk-your-deepseek-key
AI_BASE_URL=https://api.deepseek.com
```
</details>

<details>
<summary><b>Kimi</b> - 国内可用，稳定快速</summary>

```env
AI_PROVIDER=kimi
ANTHROPIC_AUTH_TOKEN=your-kimi-token
ANTHROPIC_BASE_URL=https://api.kimi.com/coding/
```
</details>

<details>
<summary><b>GLM</b> - 智谱 AI</summary>

```env
AI_PROVIDER=glm
GLM_API_KEY=your-glm-key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```
</details>

### 🎛️ 功能开关

```env
ENABLE_HOROSCOPE=true    # ♈ 星座
ENABLE_TAROT=true        # 🎴 塔罗
ENABLE_BAZI=true         # ☯️ 八字
ENABLE_QIMEN=true        # 🌀 奇门
ENABLE_LIUYAO=true       # ⚡ 六爻
ENABLE_SYNASTRY=true     # 💕 合盘
ENABLE_HUANGLI=true      # 📅 老黄历
```

---

## 🔌 API 接口

### 📡 端点列表

| 端点 | 方法 | 描述 | 模式 |
|:-----|:----:|:-----|:----:|
| `/api/bazi` | POST | 八字排盘与解读 | 🧮 计算 / 🤖 AI |
| `/api/huangli` | POST | 老黄历查询 | 📅 日期 |
| `/api/horoscope` | POST | 星座运势 | ♈ 星座 |
| `/api/tarot` | POST | 塔罗占卜 | 🎴 牌阵 |
| `/api/qimen` | POST | 奇门排盘 | 🌀 排盘 |
| `/api/liuyao` | POST | 六爻起卦 | ⚡ 卦象 |
| `/api/synastry` | POST | 合盘分析 | 💕 双人 |
| `/api/health` | GET | 健康检查 | ✅ 状态 |

### 💡 使用示例

**八字排盘计算**
```bash
curl -X POST http://localhost:3000/api/bazi \
  -H "Content-Type: application/json" \
  -d '{
    "birthDate": "1990-01-01T12:00:00.000Z",
    "gender": "male"
  }'
```

**AI 解读**
```bash
curl -X POST http://localhost:3000/api/bazi \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "分析这个八字的事业运",
    "isFollowUp": false
  }'
```

**追问模式**
```bash
curl -X POST http://localhost:3000/api/bazi \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "能详细说说财运吗？",
    "isFollowUp": true,
    "conversationId": "conv_xxx"
  }'
```

---

## 🛠️ 技术栈

<div align="center">

| 类别 | 技术 | 说明 |
|:----:|:-----|:-----|
| ⚛️ **框架** | [Next.js 16](https://nextjs.org/) | React 框架，App Router |
| 🔷 **语言** | [TypeScript 5](https://www.typescriptlang.org/) | 类型安全 |
| 🎨 **样式** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) | 现代 UI |
| 🧠 **状态** | [Zustand](https://github.com/pmndrs/zustand) | 轻量状态管理 |
| ✨ **动画** | [Framer Motion](https://www.framer.com/motion/) | 流畅动画 |
| 🤖 **AI** | [Vercel AI SDK](https://sdk.vercel.ai/) | AI 交互 |
| 🌙 **农历** | [lunar-typescript](https://github.com/6tail/lunar-typescript) | 农历计算 |

</div>

---

## 🛡️ 限流保护

<div align="center">

| 限制项 | 默认值 | 说明 |
|:------:|:------:|:-----|
| ⏱️ 请求频率 | 20/分钟 | 每 IP 每分钟最多请求 |
| 🔄 并发请求 | 2 | 同时处理的最大请求数 |
| ⏳ 请求间隔 | 5 秒 | 两次请求最小间隔 |
| 💬 追问次数 | 10/天 | 每会话每天最多追问 |

</div>

---

## 📁 项目结构

```
AskFate/
├── 📱 app/                    # Next.js App Router
│   ├── 📂 (features)/         # 功能页面
│   │   ├── bazi/              # ☯️ 八字
│   │   ├── huangli/           # 📅 老黄历
│   │   ├── horoscope/         # ♈ 星座
│   │   ├── tarot/             # 🎴 塔罗
│   │   ├── qimen/             # 🌀 奇门
│   │   ├── liuyao/            # ⚡ 六爻
│   │   └── synastry/          # 💕 合盘
│   └── 📂 api/                # API 路由
├── 🧩 components/             # React 组件
│   ├── features/              # 功能组件
│   └── ui/                    # UI 组件
├── 📚 lib/                    # 工具库
│   ├── ai/                    # AI 提供商
│   ├── calculations/          # 命理计算
│   ├── prompts/               # AI 提示词
│   └── conversation/          # 对话管理
└── 🎨 public/                 # 静态资源
    └── tarot-cards/           # 塔罗牌图片
```

---

## 🤝 贡献指南

欢迎提交 Issue 和 PR！

```bash
# 1. Fork 本仓库
# 2. 创建特性分支
git checkout -b feature/AmazingFeature

# 3. 提交更改
git commit -m 'Add some AmazingFeature'

# 4. 推送分支
git push origin feature/AmazingFeature

# 5. 创建 Pull Request
```

---

## ❓ 常见问题

<details>
<summary><b>Q: 如何更换 AI 提供商？</b></summary>

修改 `.env.local` 中的 `AI_PROVIDER`，然后重启服务即可。
</details>

<details>
<summary><b>Q: 支持哪些 AI 模型？</b></summary>

支持 DeepSeek、Kimi、GLM-4、Anthropic 等，可自由切换。
</details>

<details>
<summary><b>Q: 是否支持移动端？</b></summary>

完全支持！采用响应式设计，手机、平板、电脑均可完美使用。
</details>

<details>
<summary><b>Q: 如何部署到服务器？</b></summary>

```bash
npm run build
npm start
```
或使用 Docker、CloudBase 云托管、Vercel、Railway 等平台部署。详见 [DEPLOY.md](./DEPLOY.md)。
</details>

---

## 📝 更新日志

### v1.0.0 (2026-02-24)

- ✨ **品牌重塑**: F-Teller → 问命/AskFate
- 🌙 **夜间模式优化**: 修复黄历、首页等页面的暗黑模式支持
- 🔄 **追问模块统一**: 六爻页面使用与其他页面一致的追问组件
- 📦 **项目结构**: 优化代码组织和组件复用

---

## 📄 许可证

<div align="center">

[MIT License](./LICENSE) © 2026 **问命/AskFate**

<br>

**🔮 Built with ancient wisdom and modern technology 🔮**

<br>

<a href="https://github.com/TTTian-hub/STIAN">
  <img src="https://img.shields.io/badge/⭐%20Star%20on%20GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/>
</a>

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2&width=100%&section=header"/>

</div>

---

<div id="english"></div>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=🔮%20AskFate&fontSize=70&animation=fadeIn&fontAlignY=35&desc=AI%20Divination%20%26%20Fortune%20Telling&descAlignY=55&descSize=20"/>

<br>

<p align="center">
  <a href="#preview"><strong>🖼️ Preview</strong></a> •
  <a href="#features"><strong>✨ Features</strong></a> •
  <a href="#quickstart"><strong>🚀 Quick Start</strong></a> •
  <a href="#ai-characters"><strong>🎭 AI Characters</strong></a> •
  <a href="#tech-stack"><strong>🛠️ Tech Stack</strong></a>
</p>

<p align="center">
  <b>🌟 Ancient Eastern Divination Wisdom Meets Modern AI Technology 🌟</b><br>
  <i>Discover the mysteries of fate with AskFate</i>
</p>

<p align="center">
  <a href="#chinese">🇨🇳 中文</a> | <b>🇺🇸 English</b>
</p>

<br>

<img src="https://capsule-render.vercel.app/api?type=rect&color=gradient&height=2&width=100%&section=header"/>

</div>

---

## 📖 Introduction

**AskFate** is an open-source divination platform that blends millennia of Eastern metaphysical wisdom with modern AI. It combines seven modules — Huangli, Bazi, Horoscope, Tarot, Qimen Dunjia, Liuyao, and Synastry — with persona-driven AI interpretation, giving users professional, engaging, and follow-up-friendly readings in a polished UI.

- 🧮 **Algorithm + AI dual engine**: charts, calendars, and hexagrams are computed locally with precise algorithms; interpretations are delivered by AI personas that are explainable and conversational.
- 🤖 **Resilient AI architecture**: a dual-provider design with CodeBuddy (Tencent intranet) as primary and DeepSeek (public internet) as fallback — automatic switching on timeout/failure keeps the service reliable.
- 🛡️ **Production-grade guards**: per-IP rate limiting, concurrency control, minimum request interval, and follow-up caps work out of the box for public deployment.
- 🐳 **Container-ready**: ships with a Dockerfile and CloudBase hosting config so you can go live with one command.

> 💡 Want to try or deploy it? See "🌐 Public Deployment (Tencent CloudBase)" below. Full docs in [DEPLOY.md](./DEPLOY.md).

---

## 🖼️ Preview

<div align="center">

| 🏠 **Homepage** | 📱 **Mobile Responsive** |
|:---------------:|:------------------------:|
| Elegant card layout | Responsive design |
| Smooth animations | Divination on the go |

<br>

<img src="https://img.shields.io/badge/🎯%20Supported-7%20Divination%20Methods-FF6B6B?style=flat-square&labelColor=gray"/>
<img src="https://img.shields.io/badge/🤖%20AI%20Powered-Multi%20Model%20Support-4ECDC4?style=flat-square&labelColor=gray"/>
<img src="https://img.shields.io/badge/💬%20Smart%20Follow%20Up-Context%20Memory-45B7D1?style=flat-square&labelColor=gray"/>

</div>

---

## ✨ Features

### 🔮 Seven Divination Modules

<div align="center">

<table>
<tr>
<td width="33%" align="center">

### 📅 Huangli (老黄历)
<img src="https://img.shields.io/badge/Traditional%20Calendar-FF6B6B?style=flat-square"/>

Daily auspicious/inauspicious • Lunar calendar
28 Lunar Mansions • Peng Zu Taboos
Lucky gods &amp; evil spirits • Hourly fortune

</td>
<td width="33%" align="center">

### ♈ Horoscope
<img src="https://img.shields.io/badge/Western%20Astrology-4ECDC4?style=flat-square"/>

12 Zodiac signs • Daily/weekly/monthly
Compatibility • Fortune analysis
Rising sign • Venus &amp; Mars

</td>
<td width="33%" align="center">

### 🎴 Tarot
<img src="https://img.shields.io/badge/Mystic%20Tarot-9B59B6?style=flat-square"/>

Rider-Waite • AI interpretation
Single card • Three cards spread
Celtic Cross • 22 Major Arcana

</td>
</tr>
<tr>
<td width="33%" align="center">

### ☯️ Bazi (八字)
<img src="https://img.shields.io/badge/Four%20Pillars-E74C3C?style=flat-square"/>

Birth chart • Ten Gods analysis
Five Elements • Fortune cycles
Destiny judgment • Prediction

</td>
<td width="33%" align="center">

### 🌀 Qimen Dunjia (奇门遁甲)
<img src="https://img.shields.io/badge/Imperial%20Art-3498DB?style=flat-square"/>

Nine palace grid • Eight gates &amp; nine stars
Three wonders • Decision support
Hourly fortune • Strategic guidance

</td>
<td width="33%" align="center">

### ⚡ Liuyao (六爻)
<img src="https://img.shields.io/badge/I%20Ching%20Divination-F39C12?style=flat-square"/>

Coin casting • Plum Blossom method
Six Relatives • Changing lines
AI-powered interpretation

</td>
</tr>
<tr>
<td width="33%" align="center">

### 💕 Synastry (合盘)
<img src="https://img.shields.io/badge/Compatibility-E91E63?style=flat-square"/>

Bazi matching • Zodiac pairing
Compatibility score • Relationship advice
Personality complement • Future outlook

</td>
<td width="33%" align="center">

### 🤖 AI Follow-up
<img src="https://img.shields.io/badge/Smart%20Dialogue-00BCD4?style=flat-square"/>

Continuous conversation • Context memory
Deep interpretation • Up to 10 rounds
Personalized answers

</td>
<td width="33%" align="center">

### ⚙️ Multi-Model Support
<img src="https://img.shields.io/badge/Flexible%20Switching-8BC34A?style=flat-square"/>

DeepSeek • Kimi • GLM-4
One-click switching • Free configuration

</td>
</tr>
</table>

</div>

---

## 🎭 AI Characters

Each module has a unique AI persona for professional and engaging interpretations:

<div align="center">

| Module | 👤 AI Character | 🎨 Style | 💬 Experience |
|:------:|:--------------:|:---------|:-------------|
| **Bazi** | Uncle Chen/Aunt Chen | Neighborhood elder | Chat naturally like a neighbor |
| **Liuyao** | Old Zhang | 30 years divination experience | Direct and down-to-earth |
| **Synastry** | Xiao Yu | Gentle and caring | Bestie-style consultation |
| **Qimen** | Old Li | Taoist elder | Slow-paced, world-weary wisdom |
| **Tarot** | Vivian | Tarot shop owner | Relaxed café atmosphere |
| **Horoscope** | Star Whisper | Zodiac enthusiast | Friendly sharing |
| **Huangli** | Uncle Wang | Calendar seller | Old neighborhood wisdom |

</div>

---

## 🚀 Quick Start

### 📋 Requirements

```
✓ Node.js 20+     ✓ npm / pnpm / yarn     ✓ AI API Key
```

### 📦 Installation

```bash
# 1️⃣ Clone repository
git clone https://github.com/TTTian-hub/STIAN.git
cd AskFate

# 2️⃣ Install dependencies
npm install

# 3️⃣ Configure environment
cp .env.example .env.local
# Edit .env.local with your API Key

# 4️⃣ Start development server
npm run dev
```

Then visit 👉 **http://localhost:3000**

---

## 🚀 Production Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

Or use PM2 process manager:

```bash
npm install -g pm2
npm run build
pm2 start npm --name "askfate" -- start
```

---

## 🌐 Public Deployment (Tencent CloudBase)

Want everyone to access it? We recommend **Tencent CloudBase Cloud Run** (container hosting with a default public domain, no ICP filing required).

**Option 1: Console GitHub import (simplest, zero-config)**
1. Open the [CloudBase Console](https://console.cloud.tencent.com/tcb) → create an environment → enable **Cloud Run**.
2. Cloud Run → create a service → source = **code repository / GitHub** → authorize and pick this repo `TTTian-hub/STIAN` (branch `main`).
3. Build config: the Dockerfile is built-in, listen port `3000`, build command `npm run build`, start command `node .next/standalone/server.js` (or `npm start`).
4. In service environment variables set `AI_PROVIDER=deepseek` and `DEEPSEEK_API_KEY=sk-your-key` (see [.env.production.example](./.env.production.example)).
5. After deployment, the console shows a default public domain — open it directly.

**Option 2: GitHub Actions auto-deploy (ship on push)**
A `.github/workflows/deploy.yml` is included. Add these repo **Settings → Secrets and variables → Actions** secrets:
- `TENCENT_CLOUD_SECRET_ID`, `TENCENT_CLOUD_SECRET_KEY` (Tencent Cloud API keys)
- `CLOUDBASE_ENV_ID` (CloudBase environment ID)
Every `git push` to `main` then builds and deploys automatically.

> 📘 Full steps, env vars, ICP filing and cost notes: [DEPLOY.md](./DEPLOY.md). A `STIAN-deploy.zip` is also provided for the console "ZIP upload" path.

---

## ⚙️ Environment Configuration

### 🔑 Required (Public Deployment)

```env
AI_PROVIDER=deepseek        # Use deepseek for public hosting (CodeBuddy is intranet-only)
DEEPSEEK_API_KEY=sk-xxxxx   # Your DeepSeek API Key (required, must be valid on the public server)
```

> For local dev you can use `AI_PROVIDER=codebuddy` (CodeBuddy Agent SDK as primary) with automatic DeepSeek fallback. See [lib/ai](./lib/ai).

### 📝 Configuration Examples

<details>
<summary><b>DeepSeek (Recommended)</b> - High performance, fast response</summary>

```env
AI_PROVIDER=deepseek
AI_API_KEY=sk-your-deepseek-key
AI_BASE_URL=https://api.deepseek.com
```
</details>

<details>
<summary><b>Kimi</b> - Available in China, stable and fast</summary>

```env
AI_PROVIDER=kimi
ANTHROPIC_AUTH_TOKEN=your-kimi-token
ANTHROPIC_BASE_URL=https://api.kimi.com/coding/
```
</details>

<details>
<summary><b>GLM</b> - Zhipu AI</summary>

```env
AI_PROVIDER=glm
GLM_API_KEY=your-glm-key
GLM_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```
</details>

### 🎛️ Feature Toggles

```env
ENABLE_HOROSCOPE=true    # ♈ Horoscope
ENABLE_TAROT=true        # 🎴 Tarot
ENABLE_BAZI=true         # ☯️ Bazi
ENABLE_QIMEN=true        # 🌀 Qimen
ENABLE_LIUYAO=true       # ⚡ Liuyao
ENABLE_SYNASTRY=true     # 💕 Synastry
ENABLE_HUANGLI=true      # 📅 Huangli
```

---

## 🔌 API Endpoints

### 📡 Available APIs

| Endpoint | Method | Description |
|:-----|:----:|:-----|
| `/api/bazi` | POST | Bazi calculation &amp; interpretation |
| `/api/huangli` | POST | Traditional calendar query |
| `/api/horoscope` | POST | Horoscope fortune |
| `/api/tarot` | POST | Tarot divination |
| `/api/qimen` | POST | Qimen Dunjia chart |
| `/api/liuyao` | POST | I Ching hexagrams |
| `/api/synastry` | POST | Compatibility analysis |
| `/api/health` | GET | Health check |

---

## 🛠️ Tech Stack

<div align="center">

| Category | Technology | Description |
|:--------:|:-----------|:------------|
| ⚛️ **Framework** | [Next.js 16](https://nextjs.org/) | React framework with App Router |
| 🔷 **Language** | [TypeScript 5](https://www.typescriptlang.org/) | Type safety |
| 🎨 **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) | Modern UI |
| 🧠 **State** | [Zustand](https://github.com/pmndrs/zustand) | Lightweight state management |
| ✨ **Animation** | [Framer Motion](https://www.framer.com/motion/) | Smooth animations |
| 🤖 **AI** | [Vercel AI SDK](https://sdk.vercel.ai/) | AI interactions |
| 🌙 **Lunar** | [lunar-typescript](https://github.com/6tail/lunar-typescript) | Lunar calendar calculation |

</div>

---

## 📝 Changelog

### v1.0.0 (2026-02-24)

- ✨ **Rebrand**: F-Teller → AskFate
- 🌙 **Dark Mode**: Fixed dark mode for Huangli, homepage
- 🔄 **Unified Components**: Consistent follow-up question module
- 📦 **Project Structure**: Optimized code organization

---

## 📄 License

<div align="center">

[MIT License](./LICENSE) © 2026 **AskFate**

<br>

**🔮 Built with ancient wisdom and modern technology 🔮**

<br>

<a href="https://github.com/TTTian-hub/STIAN">
  <img src="https://img.shields.io/badge/⭐%20Star%20on%20GitHub-181717?style=for-the-badge&logo=github&logoColor=white"/>
</a>

</div>

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=100&section=footer"/>

</div>
