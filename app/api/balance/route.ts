import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { bootstrapBilling, ensureUser, getBalance, getLedger } from '@/lib/billing';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: '需要有效凭证', code: 'PAYMENT_REQUIRED' }, { status: 402 });
    }
    await bootstrapBilling();
    const { balance, free_granted } = await ensureUser(userId);
    const ledger = await getLedger(userId, 10);
    return NextResponse.json({
      ok: true,
      balance,
      free_granted,
      ledger: ledger.map((l) => ({
        feature: l.feature,
        delta: l.delta,
        balance_after: l.balance_after,
        description: l.description,
        created_at: l.created_at,
        refunded: !!l.refunded,
      })),
    });
  } catch (err) {
    console.error('Balance error:', err);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
