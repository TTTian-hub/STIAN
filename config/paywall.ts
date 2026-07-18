/**
 * 付费墙前端配置（会打包进前端 bundle，不含任何密钥）
 *
 * 收费模式：站外平台收费 + 站内激活码限额解锁
 *   用户在你的站外店铺（小红书/闲鱼/微店/公众号/收款页等）下单付款
 *   → 你（或客服）发给用户一个激活码
 *   → 用户回到本站输入激活码，获得对应次数的 AI 解读额度
 *   → 每次解读扣 1 次，额度为 0 时再次弹出付费墙
 *
 * 修改这里后需重新部署（CloudBase 重新上传代码包）。
 */

/** 总开关：false 时不做任何限额（免费无限用） */
export const PAYWALL_ENABLED = true;

/**
 * 新用户免费试用次数（首次访问自动发放，0 表示不送、直接付费）。
 * 按产品需求首登赠送 3 次。
 */
export const FREE_TRIAL_QUOTA = 3;

/** 档位：quota=可解读次数；price/label 仅展示用；url=该档位的站外购买链接 */
export interface PricingTier {
  quota: number;
  label: string;
  price: string; // 展示用价格文案，例如 "¥1.99"
  popular?: boolean;
  url?: string; // 该档位专属购买链接；留空则用 PURCHASE.defaultUrl
}

export const PRICING: PricingTier[] = [
  { quota: 1, label: '体验', price: '¥1.99', url: '' },
  { quota: 5, label: '标准', price: '¥7.99', popular: true, url: '' },
  { quota: 10, label: '畅享', price: '¥12.99', url: '' },
];

/**
 * 站外收费配置 —— 你在其他平台售卖，这里贴购买链接。
 * ⚠️ 部署前把 defaultUrl 换成你真实的购买/收款链接（各档位也可在上面单独设 url）。
 */
export const PURCHASE = {
  // 主购买链接（档位未单独设 url 时用这个）。
  // 例：小红书商品/店铺链接、闲鱼链接、微店、公众号商品页、收款页等
  defaultUrl: 'https://example.com/your-shop',
  // 购买按钮文案
  buttonText: '前往购买',
  // 平台/流程简述
  platformNote: '在店铺下单付款后，客服会把「激活码」发给你',
  // 步骤说明
  instructions:
    '① 点「前往购买」跳转下单付款 → ② 向客服领取激活码 → ③ 回到本页输入激活码解锁次数',
  // 底部提示
  contactNote: '如未收到激活码，请在购买平台联系客服。',
};

/** 激活码默认有效期（天） —— 生成脚本 --exp 未指定时的默认值 */
export const ACTIVATION_CODE_EXP_DAYS = 365;

/** entitlement token 有效期（天，从兑换时起算） */
export const ENTITLEMENT_EXP_DAYS = 365;
