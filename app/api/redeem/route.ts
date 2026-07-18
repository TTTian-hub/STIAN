import { NextRequest } from 'next/server';
import {
  verifyActivationCode,
  signEntitlement,
} from '@/lib/paywall-crypto';
import { ENTITLEMENT_EXP_DAYS } from '@/config/paywall';
import { bootstrapBilling, grantCredits } from '@/lib/billing';

export async function POST(req: NextRequest) {
  try {
    const { code, deviceId } = await req.json();

    if (!code || typeof code !== 'string') {
      return Response.json({ error: '请输入激活码' }, { status: 400 });
    }
    if (!deviceId || typeof deviceId !== 'string') {
      return Response.json({ error: '设备标识缺失' }, { status: 400 });
    }

    // 验签激活码（由站长用密钥生成）
    const activation = await verifyActivationCode(code);
    if (!activation) {
      return Response.json({ error: '激活码无效或已过期' }, { status: 400 });
    }

    // 签发绑定该设备的 entitlement token
    const exp = Date.now() + ENTITLEMENT_EXP_DAYS * 24 * 60 * 60 * 1000;
    const token = await signEntitlement({
      quota: activation.quota,
      deviceId,
      exp,
    });

    // 兼容新增：将次数同步写入服务端余额（幂等，同一激活码重复兑换不会重复加）
    try {
      await bootstrapBilling();
      await grantCredits(
        deviceId,
        activation.quota,
        `激活码兑换 · ${activation.quota} 次`,
        `redeem:${code.trim()}`,
      );
    } catch (e) {
      console.error('兑换写入余额失败（不影响发码）：', e);
    }

    return Response.json({
      ok: true,
      token,
      quota: activation.quota,
      exp,
    });
  } catch (err) {
    console.error('Redeem error:', err);
    return Response.json({ error: '兑换失败，请稍后重试' }, { status: 500 });
  }
}
