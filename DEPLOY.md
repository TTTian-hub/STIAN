# AskFate 公网部署手册（腾讯云 CloudBase 云托管）

> 目标：把 AskFate 部署成一个任何人都能访问的网站。
> 适用平台：腾讯云 **CloudBase 云托管（容器）**。国内访问快、自带 Node 运行时、支持流式 API、有免费额度。

---

## 0. 最重要的前提（先读）

**公网版必须用 DeepSeek，不能用 CodeBuddy。**

- CodeBuddy 的网关在腾讯**内网**（`*.woa.com`），只有你**本机**能连。公网服务器和沙箱一样连不到 → 在公网服务器上 CodeBuddy 必然失败。
- DeepSeek 是**公网直连**的 OpenAI 兼容接口，已在本项目验证可真实出解读、便宜、稳定。
- 因此部署时只需把 `AI_PROVIDER` 设为 `deepseek` 并填上可用的 `DEEPSEEK_API_KEY`。代码无需改动（`lib/ai/factory.ts` 已有 `deepseek` 分支，Dockerfile 也默认 `AI_PROVIDER=deepseek`）。

> 你**本机**想用 CodeBuddy 出结果，仍用 `.env.local`（`AI_PROVIDER=codebuddy`）跑 `npm run start` 即可，与公网部署互不影响。

---

## 1. 准备部署包（代码）

CloudBase 云托管支持两种代码来源：

### 方式 A：关联 Git 仓库（推荐，后续更新最方便）
1. 把项目推到你自己的 GitHub 仓库（fork `Temp0jd/AskFate` 或新建仓库后 `git push`）。
2. 确保仓库根目录含：`Dockerfile`、`.dockerignore`、`.env.production.example`（均已就绪）。
3. **不要**把 `.env.local` 提交进仓库（已在 `.dockerignore` 忽略，且 `.gitignore` 通常也忽略）。

### 方式 B：本地打包上传
```bash
# 在 AskFate 目录，排除本地依赖/构建产物/密钥后打包
cd AskFate
zip -r askfate-deploy.zip . -x "node_modules/*" ".next/*" ".env.local" "*.log"
```
然后在 CloudBase 控制台「云托管 → 新建服务 → 代码来源：本地代码」上传该 zip。

---

## 2. 开通 CloudBase 环境

1. 登录 [腾讯云控制台](https://console.cloud.tencent.com/) → 进入 **CloudBase 云开发**。
2. 新建环境：
   - 计费方式选 **按量计费**（云托管依赖计费环境；新账号通常有免费额度兜底）。
   - 地域选离用户近的（如上海/广州）。
3. 环境创建完成后记下 **环境 ID**（形如 `xxx-env-id`）。

---

## 3. 用云托管部署（核心步骤）

1. 进入该环境 → **云托管** → **新建服务**。
2. 服务配置：
   - 服务名称：`askfate`
   - 代码来源：选 **代码仓库**（关联你的 GitHub，选 AskFate 仓库 + 默认分支）或 **本地代码**（上传 zip）。
   - **构建方式：Dockerfile**（自动读取仓库根目录的 `Dockerfile`）。
   - **服务端口：3000**（与 Dockerfile `EXPOSE 3000` 一致）。
   - 私有网络 / 访问方式：先选「**公网访问**」以便所有人能打开。
3. 高级设置 → **环境变量**，填入下方表格（复制自 `.env.production.example`）：

   | 变量名 | 值 | 说明 |
   |---|---|---|
   | `AI_PROVIDER` | `deepseek` | 公网固定用 DeepSeek |
   | `DEEPSEEK_API_KEY` | `sk-你的真实key` | 从 platform.deepseek.com 获取 |
   | `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | 一般无需改 |
   | `NODE_ENV` | `production` | 生产环境 |

   > Key 属于敏感信息，CloudBase 服务环境变量仅你可见，不会进镜像、不会进前端。
4. 点击「**部署**」。首次构建会拉取依赖 + `next build`，通常 2–5 分钟。
5. 部署完成后，云托管会分配一个**默认公网域名**，形如：
   ```
   https://askfate-xxx.ap-shanghai.app.tcloudbase.com
   ```
   把这个链接发给任何人，即可访问。

---

## 4. 让所有人访问 & 备案

- **用默认域名（免备案起步）**：CloudBase 提供的 `*.app.tcloudbase.com` 二级域名通常**无需 ICP 备案**即可公网访问，适合先验证、小范围分享。
- **绑定自有域名（需备案）**：若要 `https://yourdomain.com`：
  1. 在云托管服务里「添加自定义域名」，按提示配置 CNAME。
  2. 域名需先完成 **ICP 备案**（国内服务器/域名强制要求）。未备案域名无法解析到国内节点。
  3. 建议顺手配置 **HTTPS**（CloudBase 默认提供免费证书）。

---

## 5. 限流 / 防刷（公开后必须考虑）

公开后 `DEEPSEEK_API_KEY` 会被所有访客调用，存在被刷爆额度的风险。建议：

1. **CloudBase 自带防护**：云托管服务可配置「流量防护 / 单实例并发 / 自动扩缩容」，先限制单实例并发数。
2. **API 层限流（推荐加）**：在 `app/api/ai/stream/route.ts` 增加按 IP 的简单限流（例如每 IP 每分钟 N 次）。需要我加可以告诉我。
3. **监控账单**：DeepSeek 按量付费，定期看 `platform.deepseek.com` 的用量，设置余额告警。

---

## 6. 费用提示

- CloudBase 云托管按**实际资源用量（CPU/内存/流量）**计费，新账号有免费额度，小规模访问几乎免费；流量大时按量扣费。
- DeepSeek `deepseek-chat` 很便宜（约 ¥1 / 百万 tokens 级），但被大量调用仍会产生费用，务必配合限流。

---

## 7. 合规提醒

算命 / 命理类内容在国内属敏感范畴。公开运营请注意：
- 平台内容合规要求（加「娱乐参考，结果仅供参考」等免责声明，项目分享卡片已含 disclaimer）。
- 必要的 ICP 备案与资质（如涉及付费咨询，需留意相关法规）。

---

## 8. 更新上线

- 若用 Git 仓库：改完代码 `git push` → 回到云托管服务 → 「重新部署」即可。
- 若用 zip：重新上传新包部署。

---

## 附：本地用 Docker 自测（可选）

```bash
# 在 AskFate 目录
docker build -t askfate .
docker run -d -p 3000:3000 \
  -e AI_PROVIDER=deepseek \
  -e DEEPSEEK_API_KEY=sk-你的真实key \
  -e DEEPSEEK_BASE_URL=https://api.deepseek.com \
  askfate
# 打开 http://localhost:3000
```
