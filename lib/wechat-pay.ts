/**
 * 微信支付适配层（NATIVE 扫码支付，APIv3）
 *
 * 安全约定：
 * - 商户号 / 证书 / 私钥 / APIv3 密钥一律从环境变量读取，绝不写死在代码里。
 * - 回调必须验签（使用平台证书公钥 RSA-SHA256），并校验订单金额、商户号、订单号、支付状态。
 * - 缺少任何凭证时 WECHAT_PAY.enabled=false，由上层降级为「激活码 / 联系客服」临时方案，
 *   绝不伪造支付成功。
 *
 * 本文件仅在 WECHAT_PAY.enabled 时被调用；未配置时不会被触发。
 */
import crypto from 'crypto';
import { WECHAT_PAY } from '@/config/billing';

const BASE = 'https://api.mch.weixin.qq.com';

function randomStr(len = 32): string {
  return crypto.randomBytes(len).toString('hex').slice(0, len);
}

function sign(privateKeyPem: string, message: string): string {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(message);
  signer.end();
  return signer.sign(privateKeyPem, 'base64');
}

/** 生成请求头 Authorization（WeChatPay2 签名） */
function buildAuthHeader(method: string, urlPath: string, body: string): string {
  const mchId = WECHAT_PAY.mchId;
  const serialNo = WECHAT_PAY.serialNo;
  const nonce = randomStr(16);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const message = `${method}\n${urlPath}\n${timestamp}\n${nonce}\n${body}\n`;
  const signature = sign(WECHAT_PAY.privateKey, message);
  return (
    `WECHATPAY2-SHA256-RSA2048 ` +
    `mchid="${mchId}",nonce_str="${nonce}",signature="${signature}",timestamp="${timestamp}",serial_no="${serialNo}"`
  );
}

export interface WechatOrderResult {
  code_url: string; // 用户扫码支付二维码内容
  prepay_id: string;
}

/**
 * 创建 NATIVE 支付订单。调用前需 WECHAT_PAY.enabled === true。
 */
export async function createNativeOrder(opts: {
  outTradeNo: string;
  description: string;
  amountCents: number; // 单位：分
  appId?: string;
}): Promise<WechatOrderResult> {
  const urlPath = '/v3/pay/transactions/native';
  const bodyObj = {
    mchid: WECHAT_PAY.mchId,
    appid: opts.appId || process.env.WECHAT_APP_ID || '',
    description: opts.description,
    out_trade_no: opts.outTradeNo,
    notify_url: WECHAT_PAY.notifyUrl,
    amount: { total: opts.amountCents, currency: 'CNY' },
  };
  const body = JSON.stringify(bodyObj);
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: buildAuthHeader('POST', urlPath, body),
    'User-Agent': 'AskFate/1.0',
  };
  const resp = await fetch(BASE + urlPath, {
    method: 'POST',
    headers,
    body,
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`微信下单失败: ${resp.status} ${txt}`);
  }
  const data = (await resp.json()) as { code_url?: string; prepay_id?: string };
  if (!data.code_url) throw new Error('微信返回缺少 code_url');
  return { code_url: data.code_url, prepay_id: data.prepay_id || '' };
}

/**
 * 验证微信支付回调签名。若配置了平台证书公钥（WECHAT_PLATFORM_CERT）则严格验签，
 * 否则记录警告并返回 false（生产环境必须配置证书）。
 */
export function verifyCallback(opts: {
  serialNo: string;
  signature: string;
  timestamp: string;
  nonce: string;
  body: string;
}): boolean {
  const cert = process.env.WECHAT_PLATFORM_CERT;
  if (!cert) {
    console.warn('[wechat] 未配置 WECHAT_PLATFORM_CERT，跳过严格验签（生产环境必须配置）');
    return false;
  }
  const message = `${opts.timestamp}\n${opts.nonce}\n${opts.body}\n`;
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(message);
  verifier.end();
  try {
    return verifier.verify(cert, opts.signature, 'base64');
  } catch {
    return false;
  }
}

/**
 * 解密回调中的 resources.ciphertext（AEAD_AES_256_GCM），得到支付结果明文。
 */
export function decryptResource(resource: {
  ciphertext: string;
  nonce: string;
  associated_data?: string;
}): Record<string, unknown> {
  const key = Buffer.from(WECHAT_PAY.apiV3Key, 'utf-8');
  const nonce = Buffer.from(resource.nonce, 'utf-8');
  const associated = Buffer.from(resource.associated_data || '', 'utf-8');
  const ciphertext = Buffer.from(resource.ciphertext, 'base64');
  const authTag = ciphertext.subarray(ciphertext.length - 16);
  const data = ciphertext.subarray(0, ciphertext.length - 16);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, nonce, { authTagLength: 16 });
  decipher.setAuthTag(authTag);
  decipher.setAAD(associated);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString('utf-8'));
}
