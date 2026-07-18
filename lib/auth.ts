/**
 * 从请求头提取并校验用户身份。
 * 复用现有付费墙签名体系：前端持有 entitlement token（deviceId 绑定），
 * 服务端验签后得到 deviceId 作为 user_id。未验签返回 null。
 */
import { NextRequest } from 'next/server';
import { verifyEntitlement } from '@/lib/paywall-crypto';

export async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  const token = req.headers.get('x-entitlement');
  const ent = await verifyEntitlement(token);
  return ent ? ent.deviceId : null;
}
