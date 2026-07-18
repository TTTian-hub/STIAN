'use client';

/**
 * 前端额度管理：localStorage 持有 entitlement token + 剩余次数。
 *
 * 安全边界（MVP，详见 paywall-crypto.ts）：
 * - entitlement token 由服务端签名（含 quota/deviceId/exp），用户无法篡改 quota
 * - 剩余次数 remaining 存本地；技术用户改 localStorage 可临时刷，但每次仍消耗 DeepSeek token（你的成本），且额度上限受 token.quota 约束
 * - 清缓存/换设备会丢失额度（按次付费本应绑定购买）
 */

import { FREE_TRIAL_QUOTA } from '@/config/paywall';

const STORAGE_KEY = 'askfate_entitlement';
const DEVICE_KEY = 'askfate_device_id';
const TRIAL_FLAG = 'askfate_trial_claimed';

export interface StoredEntitlement {
  token: string;
  quota: number;     // 总次数
  remaining: number; // 剩余次数
  exp: number;
}

function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = 'dev_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getDeviceIdSafe(): string {
  return getDeviceId();
}

export function loadEntitlement(): StoredEntitlement | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const e = JSON.parse(raw) as StoredEntitlement;
    if (Date.now() > e.exp) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return e;
  } catch {
    return null;
  }
}

export function saveEntitlement(e: StoredEntitlement): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(e));
}

export function clearEntitlement(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasQuota(): boolean {
  const e = loadEntitlement();
  return !!e && e.remaining > 0;
}

export function getRemaining(): number {
  const e = loadEntitlement();
  return e ? e.remaining : 0;
}

/** 消耗一次额度（前端记账）。返回消耗后的剩余；不足返回 false */
export function consume(): boolean {
  const e = loadEntitlement();
  if (!e || e.remaining <= 0) return false;
  e.remaining -= 1;
  saveEntitlement(e);
  return true;
}

/**
 * 首次免费试用：无额度且从未领取过时，向服务端申领 FREE_TRIAL_QUOTA 次免费额度。
 * - 已有 entitlement（即使剩 0 次）→ 不再发放，避免用完又白送
 * - 已领过（本地标记）→ 不再发放
 * - FREE_TRIAL_QUOTA<=0 → 不发放（纯付费墙）
 * 返回是否成功发放。
 */
export async function ensureTrial(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (FREE_TRIAL_QUOTA <= 0) return false;
  if (loadEntitlement()) return false;
  if (localStorage.getItem(TRIAL_FLAG) === '1') return false;

  const deviceId = getDeviceId();
  try {
    const res = await fetch('/api/trial', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceId }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return false;
    saveEntitlement({
      token: data.token,
      quota: data.quota,
      remaining: data.quota,
      exp: data.exp,
    });
    localStorage.setItem(TRIAL_FLAG, '1');
    return true;
  } catch {
    return false;
  }
}

/** 兑换激活码 → 写入本地额度 */
export async function redeemCode(code: string): Promise<{ ok: boolean; quota?: number; error?: string }> {
  const deviceId = getDeviceId();
  try {
    const res = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, deviceId }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || '兑换失败' };
    }
    const ent: StoredEntitlement = {
      token: data.token,
      quota: data.quota,
      remaining: data.quota,
      exp: data.exp,
    };
    saveEntitlement(ent);
    return { ok: true, quota: data.quota };
  } catch (err) {
    return { ok: false, error: '网络错误，请重试' };
  }
}

/** 取出当前 entitlement token（用于请求头） */
export function getToken(): string | null {
  const e = loadEntitlement();
  return e ? e.token : null;
}
