import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { deleteHistory } from '@/lib/billing';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const userId = await getUserIdFromRequest(_req);
    if (!userId) {
      return NextResponse.json({ error: '需要有效凭证', code: 'PAYMENT_REQUIRED' }, { status: 402 });
    }
    const { id } = await params;
    const ok = await deleteHistory(id, userId);
    return NextResponse.json({ ok });
  } catch (err) {
    console.error('History delete error:', err);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
