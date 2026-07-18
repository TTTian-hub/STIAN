/**
 * Paywall 签名/验签工具（Web Crypto，edge + node 兼容）
 *
 * 设计要点（轻量、零数据库、零支付接口）：
 * - 激活码(activation code): 站长用 gen-codes 脚本生成，内容 = base64url({quota, exp}) + "." + HMAC(secret, 前者)
 * - 兑换时 /api/redeem 验签激活码 → 签发 entitlement token（绑定 deviceId）
 * - entitlement token: base64url({quota, deviceId, exp}) + "." + HMAC(secret, 前者)
 * - 前端持有 entitlement，每次解读请求带 x-entitlement 头；middleware 统一验签
 *
 * 安全边界（MVP）：
 * - 激活码由站长密钥签名，用户无法伪造 quota
 * - 同一激活码可被多人兑（各得一份额），冷启动可接受
 * - 额度剩余次数由前端 localStorage 维护；清缓存会丢额度（按次付费本应绑定购买）
 */

const DEFAULT_SECRET = 'CHANGE_ME_PAYWALL_ENTITLEMENT_SECRET';

function getSecret(): string {
  return process.env.ENTITLEMENT_SECRET || DEFAULT_SECRET;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
  const bin = atob(b64 + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

async function hmac(secret: string, data: string): Promise<Uint8Array> {
  const key = await importKey(secret);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  return new Uint8Array(sig);
}

export interface EntitlementPayload {
  quota: number;      // 该凭证包含的解读次数上限
  deviceId: string;   // 绑定设备（防跨设备白嫖）
  exp: number;        // 过期时间戳(ms)
}

export interface ActivationPayload {
  quota: number;
  exp: number;
}

function encodePayload(obj: Record<string, unknown>): string {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
}

function decodePayload<T>(seg: string): T {
  return JSON.parse(new TextDecoder().decode(fromBase64Url(seg))) as T;
}

/** 签发 entitlement token（绑定 deviceId） */
export async function signEntitlement(p: EntitlementPayload): Promise<string> {
  const body = encodePayload({ quota: p.quota, deviceId: p.deviceId, exp: p.exp });
  const sig = await hmac(getSecret(), body);
  return `${body}.${toBase64Url(sig)}`;
}

/** 验签 entitlement token，返回 payload 或 null（任何畸形输入都安全返回 null） */
export async function verifyEntitlement(token: string | null | undefined): Promise<EntitlementPayload | null> {
  if (!token || !token.includes('.')) return null;
  try {
    const [body, sigB64] = token.split('.');
    if (!body || !sigB64) return null;
    const expected = await hmac(getSecret(), body);
    const got = fromBase64Url(sigB64);
    if (expected.length !== got.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ got[i];
    if (diff !== 0) return null;
    const p = decodePayload<EntitlementPayload>(body);
    if (!p.deviceId || typeof p.quota !== 'number' || typeof p.exp !== 'number') return null;
    if (Date.now() > p.exp) return null;
    return p;
  } catch {
    return null;
  }
}

/**
 * 生成激活码（站长脚本调用）：AF-<sig>.<body>
 * 分隔符用 "."（base64url 字母表不含 "."），避免 sig/body 内部的 "-"/"_" 干扰切分。
 */
export async function generateActivationCode(quota: number, expDays: number): Promise<string> {
  const exp = Date.now() + expDays * 24 * 60 * 60 * 1000;
  const body = encodePayload({ quota, exp });
  const sig = await hmac(getSecret(), body);
  return `AF-${toBase64Url(sig)}.${body}`;
}

/** 验签激活码，返回 {quota, exp} 或 null（任何畸形输入都安全返回 null） */
export async function verifyActivationCode(code: string | null | undefined): Promise<ActivationPayload | null> {
  if (!code) return null;
  const trimmed = code.trim();
  if (!trimmed.startsWith('AF-')) return null;
  try {
    // 去掉 "AF-" 前缀后按第一个 "." 切分为 <sig>.<body>
    const rest = trimmed.slice(3);
    const dot = rest.indexOf('.');
    if (dot < 0) return null;
    const sigB64 = rest.slice(0, dot);
    const body = rest.slice(dot + 1);
    if (!sigB64 || !body) return null;
    const expected = await hmac(getSecret(), body);
    const got = fromBase64Url(sigB64);
    if (expected.length !== got.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ got[i];
    if (diff !== 0) return null;
    const p = decodePayload<ActivationPayload>(body);
    if (typeof p.quota !== 'number' || typeof p.exp !== 'number') return null;
    if (Date.now() > p.exp) return null;
    return p;
  } catch {
    return null;
  }
}

/** 调试用：返回当前密钥是否为默认占位（提醒部署时必须设置环境变量） */
export function isUsingDefaultSecret(): boolean {
  return !process.env.ENTITLEMENT_SECRET;
}
