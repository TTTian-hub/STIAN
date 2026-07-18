import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { getOrder } from '@/lib/billing';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromRequest(_req);
    if (!userId) {
      return NextResponse.json({ error: '需要有效凭证', code: 'PAYMENT_REQUIRED' }, { status: 402 });
    }
    const { id } = await params;
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ error: '订单不存在' }, { status: 404 });
    }
    if (order.user_id !== userId) {
      return NextResponse.json({ error: '无权访问该订单' }, { status: 403 });
    }
    return NextResponse.json({
      ok: true,
      order_id: order.order_id,
      status: order.status,
      amount: order.amount,
      credits: order.credits,
      paid_at: order.paid_at || null,
    });
  } catch (err) {
    console.error('Order query error:', err);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
