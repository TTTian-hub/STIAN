# AskFate 付费墙（站外收费 + 激活码限额）部署与运营指南

> 适用场景：你无法办理营业执照/ICP 备案，因此**支付完全在站外平台完成**（小红书 / 闲鱼 / 微店 / 公众号 / 收款页等），
> 网站只负责**限额 + 激活码解锁**。用户在你店铺付款 → 你发激活码 → 用户回站输入激活码解锁次数 → 每次解读扣 1 次。

---

## 一、整体流程

```
访客打开网站
   └─ 首次访问自动获得 1 次免费试用（FREE_TRIAL_QUOTA，可改 0）
        ├─ 有额度 → 正常解读（每次扣 1，耗尽弹付费墙）
        └─ 无额度 → 弹付费墙
                        ├─ 点「前往购买」→ 跳你站外购买链接
                        └─ 拿到激活码 → 输入 → 服务端验签 → 解锁 N 次额度
```

- **免费排盘（八字/星座等算盘）不耗 AI，永远免费、不弹墙。**
- **只有真正调用 AI 解读时才扣次数 / 要求凭证。**
- 密钥 `ENTITLEMENT_SECRET` 同时用于：① 生成激活码（站长脚本）② 网站运行时验签（CloudBase 环境变量）。**两者必须一致。**

---

## 二、部署前必须做的两件事

### 1) 设置 CloudBase 环境变量 `ENTITLEMENT_SECRET`

在 CloudBase 云托管 → 你的服务 → **环境变量** 中新增：

```
ENTITLEMENT_SECRET = <与发卡脚本用的同一个密钥>
```

> 本仓库已为你生成并保管在仓库外的 `paywall-secret.txt`（请勿提交进仓库）。
> 若丢失：用同样的值重新 `npm run gen:codes` 即可（旧码仍有效，因为验签密钥没变）。

同时确认已有：
```
AI_PROVIDER = deepseek
DEEPSEEK_API_KEY = sk-xxxxxxxx
```

### 2) 把购买链接换成你真实的地址

编辑 `config/paywall.ts` 第 41~54 行的 `PURCHASE.defaultUrl`（以及各档位 `url`）：

```ts
export const PURCHASE = {
  defaultUrl: 'https://你的店铺链接', // ← 改成真实链接
  buttonText: '前往购买',
  platformNote: '在店铺下单付款后，客服会把「激活码」发给你',
  instructions: '① 点「前往购买」跳转下单付款 → ② 向客服领取激活码 → ③ 回到本页输入激活码解锁次数',
  contactNote: '如未收到激活码，请在购买平台联系客服。',
};
```

改完需重新打包部署（见第四节）。

---

## 三、运营：如何发卡

激活码由站长脚本生成（用 `ENTITLEMENT_SECRET` 签名）。生成后复制发给已付款用户即可。

```bash
# 生成 5 次额度的激活码 20 个（务必在 AskFate 目录下运行）
ENTITLEMENT_SECRET=<你的密钥> npm run gen:codes -- --quota 5 --count 20

# 参数
#   --quota <n>  每个码含的解读次数（默认 5）
#   --count <n>  生成数量（默认 10）
#   --exp   <d>  有效期天数（默认 365）
```

本地 `.env.local` 已写入 `ENTITLEMENT_SECRET`，所以也可以直接：

```bash
npm run gen:codes -- --quota 1 --count 10   # 体验档
npm run gen:codes -- --quota 5 --count 10   # 标准档
npm run gen:codes -- --quota 10 --count 5   # 畅享档
```

生成的激活码形如 `AF-xxxx.yyyy`，用户复制后在网站付费墙输入即激活对应次数。

> 注意：同一激活码可被多人分别兑换（各得一份额），属 MVP 可接受范围；若要严格防一人买多人用，需升级为云端账本（见第六节）。

---

## 四、重新部署

1. 修改 `config/paywall.ts`（链接/档位/试用次数）后，重新生成代码包：
   - 用本助手生成的部署 zip（根含 Dockerfile、无 postinstall）上传到 CloudBase「上传代码包」；
   - 或 `git push` 到 GitHub 仓库后在控制台「重新部署」。
2. 构建方式选 **Dockerfile**，端口 **3000**。
3. 确保环境变量含 `AI_PROVIDER=deepseek`、`DEEPSEEK_API_KEY`、`ENTITLEMENT_SECRET`。
4. 部署完成后验证：
   - 打开首页 → 首次解读应消耗 1 次免费试用并正常返回；
   - 试用耗尽后再点解读 → 弹付费墙，且**直接调接口（不带凭证）返回 402**；
   - 排盘（不解读）应始终免费、不弹墙。

---

## 五、可调参数（`config/paywall.ts`）

| 参数 | 含义 | 默认 |
|------|------|------|
| `PAYWALL_ENABLED` | 总开关，`false` 则完全免费无限用 | `true` |
| `FREE_TRIAL_QUOTA` | 新访客免费试用次数（0=不送，直接付费墙） | `1` |
| `PRICING` | 档位数组（quota/label/price/url） | 1/5/10 三档 |
| `PURCHASE.defaultUrl` | 站外购买主链接 | 占位，需改 |
| `ACTIVATION_CODE_EXP_DAYS` | 激活码有效期 | `365` |
| `ENTITLEMENT_EXP_DAYS` | 兑换后额度有效期 | `365` |

---

## 六、已知限制与升级路线

1. **额度存前端 localStorage**：清缓存/换设备会丢额度；技术用户改本地值可临时多刷（但每次仍消耗你的 DeepSeek token）。
2. **激活码可分享**：一人购买多人兑换。升级方案：激活码一次性核销（服务端记已用集合，需云数据库）。
3. **无支付回执**：靠人工发卡。升级方案：接入兑换码平台或轻量支付（如小鹅通/码支付），下单后自动发码。
4. **限流双重**：`lib/rate-limit.ts` 每 IP 10 次/分钟仍在，与付费墙互补，防止单一 IP 狂刷。

---

## 七、故障排查

| 现象 | 原因 / 处理 |
|------|------|
| 输入正确激活码提示无效 | `ENTITLEMENT_SECRET` 与发卡时用的不一致 → 对齐两者后重新发卡 |
| 排盘也弹付费墙 | middleware 误拦截（理论已修：仅 `prompt` 请求才拦截）；确认部署的是最新包 |
| 402 但用户说有额度 | 浏览器清过缓存导致 entitlement 丢失 → 重新输入激活码 |
| 免费试用领不到 | `FREE_TRIAL_QUOTA<=0` 或本地 `askfate_trial_claimed` 已置 1（清缓存可重置） |
