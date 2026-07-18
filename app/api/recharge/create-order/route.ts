import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { bootstrapBilling, createOrder, getPackage } from '@/lib/billing';
import { WECHAT_PAY } from '@/config/billing';
import { createNativeOrder } from '@/lib/wechat-pay';

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ error: '需要有效凭证', code: 'PAYMENT_REQUIRED' }, { status: 402 });
    }
    const { package_id } = await req.json();
    if (!package_id) {
      return NextResponse.json({ error: '缺少 package_id' }, { status: 400 });
    }
    await bootstrapBilling();
    const pkg = await getPackage(package_id);
    if (!pkg || !pkg.enabled) {
      return NextResponse.json({ error: '套餐不存在或已下架' }, { status: 404 });
    }

    const order = await createOrder(userId, pkg);

    // 微信支付已配置 → 创建 NATIVE 扫码订单
    if (WECHAT_PAY.enabled) {
      try {
        const native = await createNativeOrder({
          outTradeNo: order.order_id,
          description: `AskFate · ${pkg.name}`,
          amountCents: Math.round(pkg.price * 100),
        });
        return NextResponse.json({
          ok: true,
          order_id: order.order_id,
          status: order.status,
          pay_method: 'wechat',
          code_url: native.code_url,
        });
      } catch (e) {
        console.error('微信下单失败，降级为人工：', e);
        return NextResponse.json({
          ok: true,
          order_id: order.order_id,
          status: 'pending',
          pay_method: 'manual',
          message: '微信下单暂时不可用，请使用激活码或联系客服',
        });
      }
    }

    // 未配置微信支付 → 走激活码 / 联系客服临时方案（绝不伪造成功）
    return NextResponse.json({
      ok: true,
      order_id: order.order_id,
      status: 'pending',
      pay_method: 'manual',
      message: '请在站外店铺下单后使用激活码解锁，或联系客服完成充值',
    });
  } catch (err) {
    console.error('Create order error:', err);
    return NextResponse.json({ error: '创建订单失败' }, { status: 500 });
  }
}
