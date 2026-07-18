/**
 * 计费与充值配置（全部可配置，部署前可在 .env 或 CloudBase 环境变量覆盖默认值）
 *
 * - 各功能消耗次数 FEATURE_COSTS：必须从后台/配置读取，不散落硬编码在页面
 * - 充值套餐 DEFAULT_PACKAGES：默认配置，后台可改（recharge_packages 集合优先）
 * - 免费试用 FREE_TRIAL_QUOTA：新用户首次识别赠送次数
 */

export type FeatureId =
  | 'reading' // 首页「宇宙回信」4 步流程
  | 'huangli' // 黄历查询（免费）
  | 'horoscope' // 星座运势
  | 'tarot' // 塔罗解读
  | 'liuyao' // 六爻预测
  | 'bazi' // 八字命盘
  | 'qimen' // 奇门遁甲
  | 'synastry'; // 关系合盘

export interface FeatureCost {
  id: FeatureId;
  name: string;
  cost: number; // 每次消耗次数
}

/** 各功能消耗次数（默认配置，后台可改） */
export const FEATURE_COSTS: Record<FeatureId, FeatureCost> = {
  reading: { id: 'reading', name: '宇宙回信', cost: 1 },
  huangli: { id: 'huangli', name: '黄历查询', cost: 0 },
  horoscope: { id: 'horoscope', name: '星座运势', cost: 1 },
  tarot: { id: 'tarot', name: '塔罗解读', cost: 1 },
  liuyao: { id: 'liuyao', name: '六爻预测', cost: 2 },
  bazi: { id: 'bazi', name: '八字命盘', cost: 3 },
  qimen: { id: 'qimen', name: '奇门遁甲', cost: 3 },
  synastry: { id: 'synastry', name: '关系合盘', cost: 3 },
};

export function getFeatureCost(id: string): number {
  return (FEATURE_COSTS as Record<string, FeatureCost>)[id]?.cost ?? 1;
}

export function getFeatureName(id: string): string {
  return (FEATURE_COSTS as Record<string, FeatureCost>)[id]?.name ?? id;
}

/** 新用户首次识别赠送次数 */
export const FREE_TRIAL_QUOTA = 3;

export interface PackageConfig {
  package_id: string;
  name: string;
  price: number; // 人民币（元）
  credits: number; // 获得次数
  bonus_credits: number; // 赠送次数
  enabled: boolean;
  sort_order: number;
}

/** 默认充值套餐（recharge_packages 集合为空时写入；后台修改以集合为准） */
export const DEFAULT_PACKAGES: PackageConfig[] = [
  {
    package_id: 'lite',
    name: '轻量体验包',
    price: 9.9,
    credits: 20,
    bonus_credits: 0,
    enabled: true,
    sort_order: 1,
  },
  {
    package_id: 'standard',
    name: '常用探索包',
    price: 29.9,
    credits: 70,
    bonus_credits: 0,
    enabled: true,
    sort_order: 2,
  },
  {
    package_id: 'deep',
    name: '深度探索包',
    price: 68,
    credits: 180,
    bonus_credits: 0,
    enabled: true,
    sort_order: 3,
  },
];

/** 微信支付配置（缺省时不启用真支付，仅保留激活码临时方案） */
export const WECHAT_PAY = {
  // 商户号（微信支付商户平台获取）
  mchId: process.env.WECHAT_MCH_ID || '',
  // 商户 API 证书序列号
  serialNo: process.env.WECHAT_SERIAL_NO || '',
  // 商户 API 私钥（PEM 内容，建议用环境变量注入，勿写死）
  privateKey: process.env.WECHAT_PRIVATE_KEY || '',
  // 微信支付 APIv3 密钥
  apiV3Key: process.env.WECHAT_API_V3_KEY || '',
  // 支付结果回调地址（需公网可访问）
  notifyUrl: process.env.WECHAT_NOTIFY_URL || '',
  // 是否启用真支付（以上参数齐全才 true）
  get enabled() {
    return Boolean(this.mchId && this.serialNo && this.privateKey && this.apiV3Key && this.notifyUrl);
  },
};
