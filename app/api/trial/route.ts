import { NextRequest } from 'next/server';
import { signEntitlement } from '@/lib/paywall-crypto';
import { FREE_TRIAL_QUOTA, ENTITLEMENT_EXP_DAYS } from '@/config/paywall';

/**
 * 免费试用：为新设备签发一个 quota=FREE_TRIAL_QUOTA 的 entitlement token。
 * - 无状态 MVP：服务端不落库，无法严格防"清缓存反复领"，属可接受的 freemium 泄漏。
 * - FREE_TRIAL_QUOTA<=0 时直接拒绝（等于关闭免费试用，纯付费墙）。
 * - 不在 middleware matcher 内，不被拦截。
 */
export async function POST(req: NextRequest) {
  try {
    if (FREE_TRIAL_QUOTA <= 0) {
      return Response.json({ error: '免费试用未开放' }, { status: 403 });
    }

    const { deviceId } = await req.json();
    if (!deviceId || typeof deviceId !== 'string') {
      return Response.json({ error: '设备标识缺失' }, { status: 400 });
    }

    const exp = Date.now() + ENTITLEMENT_EXP_DAYS * 24 * 60 * 60 * 1000;
    const token = await signEntitlement({
      quota: FREE_TRIAL_QUOTA,
      deviceId,
      exp,
    });

    return Response.json({ ok: true, token, quota: FREE_TRIAL_QUOTA, exp });
  } catch (err) {
    console.error('Trial error:', err);
    return Response.json({ error: '发放失败，请稍后重试' }, { status: 500 });
  }
}
