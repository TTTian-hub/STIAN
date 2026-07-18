import { NextResponse } from 'next/server';
import { bootstrapBilling, getPackages } from '@/lib/billing';

export async function GET() {
  try {
    await bootstrapBilling();
    const packages = await getPackages();
    return NextResponse.json({ ok: true, packages });
  } catch (err) {
    console.error('Packages error:', err);
    return NextResponse.json({ error: '获取套餐失败' }, { status: 500 });
  }
}
