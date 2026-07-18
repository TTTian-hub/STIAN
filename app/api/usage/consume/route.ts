import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { consume } from '@/lib/billing';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: '需要有效凭证', code: 'PAYMENT_REQUIRED' }, { status: 402 });
    }
    const body = await req.json();
    const { feature, request_id, cost } = body as { feature?: string; request_id?: string; cost?: number };
    if (!feature || !request_id) {
      return NextResponse.json({ error: '缺少 feature 或 request_id' }, { status: 400 });
    }
    const res = await consume(userId, feature, request_id, typeof cost === 'number' ? cost : undefined);
    if (!res.ok) {
      return NextResponse.json(
        { ok: false, code: res.code, balance: res.balance, need: res.need, message: res.need ? `还差 ${res.need} 次` : '余额不足' },
        { status: 402 },
      );
    }
    return NextResponse.json({ ok: true, balance: res.balance, already: res.already, requestId: res.requestId });
  } catch (err) {
    console.error('Consume error:', err);
    return NextResponse.json({ error: '扣次失败' }, { status: 500 });
  }
}
