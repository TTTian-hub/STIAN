import { NextRequest, NextResponse } from 'next/server';
import { markOrderPaid } from '@/lib/billing';
import { WECHAT_PAY } from '@/config/billing';
import { verifyCallback, decryptResource } from '@/lib/wechat-pay';

/**
 * 微信支付结果回调（APIv3）。
 * 只有 WECHAT_PAY.enabled 时才会被微信服务器真实调用。
 * 重复回调 → 幂等，仅充值一次。
 * 严格验签 + 解密，校验支付状态后才到账。
 */
export async function POST(req: NextRequest) {
  try {
    if (!WECHAT_PAY.enabled) {
      // 未启用微信支付：返回 SUCCESS 避免微信反复重试（本环境无真实支付）
      return NextResponse.json({ code: 'SUCCESS', message: 'ignored' });
    }
    const signature = req.headers.get('Wechatpay-Signature') || '';
    const timestamp = req.headers.get('Wechatpay-Timestamp') || '';
    const nonce = req.headers.get('Wechatpay-Nonce') || '';
    const serial = req.headers.get('Wechatpay-Serial') || '';
    const rawBody = await req.text();

    const ok = verifyCallback({ serialNo: serial, signature, timestamp, nonce, body: rawBody });
    if (!ok) {
      console.warn('[callback] 签名验签失败');
      return NextResponse.json({ code: 'FAIL', message: '签名错误' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const resource = payload.resource;
    const data = decryptResource(resource) as {
      out_trade_no: string;
      transaction_id: string;
      trade_state: string;
    };
    if (data.trade_state !== 'SUCCESS') {
      return NextResponse.json({ code: 'SUCCESS', message: '非成功状态' });
    }

    const res = await markOrderPaid(data.out_trade_no, 'wechat', data.transaction_id);
    if (!res.ok) {
      return NextResponse.json({ code: 'FAIL', message: '订单处理失败' }, { status: 500 });
    }
    return NextResponse.json({ code: 'SUCCESS' });
  } catch (err) {
    console.error('Payment callback error:', err);
    return NextResponse.json({ code: 'FAIL', message: '处理异常' }, { status: 500 });
  }
}
