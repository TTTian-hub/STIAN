import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { getHistory } from '@/lib/billing';

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: '需要有效凭证', code: 'PAYMENT_REQUIRED' }, { status: 402 });
    }
    const feature = req.nextUrl.searchParams.get('feature') || undefined;
    const list = await getHistory(userId, feature, 50);
    return NextResponse.json({
      ok: true,
      history: list.map((h) => ({
        id: h._id,
        feature: h.feature,
        feature_name: h.feature_name,
        summary: h.summary,
        cost: h.cost,
        created_at: h.created_at,
        has_result: !!h.result,
        has_ai: !!h.ai_text,
      })),
    });
  } catch (err) {
    console.error('History error:', err);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }
}
