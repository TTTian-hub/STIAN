import { NextRequest, NextResponse } from 'next/server';
import { verifyEntitlement } from '@/lib/paywall-crypto';
import { PAYWALL_ENABLED } from '@/config/paywall';

/**
 * 统一限额拦截：
 * - 校验请求头 x-entitlement（前端兑换/试用后持有，服务端签名）
 * - 有有效凭证 → 放行
 * - 无凭证时：
 *   · "免费排盘"请求（fortune 路由、body 不含 prompt，纯计算不耗 AI）→ 放行
 *   · "AI 解读"请求（含 prompt，会消耗 DeepSeek token）→ 返回 402，前端据此弹付费墙
 * - /api/redeem、/api/trial 不在 matcher 内，不被拦截（否则无法兑换/领试用）
 *
 * 注意：重写请求体是为了让下游 route 仍能读到 body（middleware 读取会消费流）。
 */
export async function middleware(req: NextRequest) {
  if (!PAYWALL_ENABLED) {
    return NextResponse.next();
  }

  const pathname = req.nextUrl.pathname;
  const isReading = pathname.startsWith('/api/reading');

  const token = req.headers.get('x-entitlement');
  const ent = await verifyEntitlement(token);
  if (ent) {
    return NextResponse.next();
  }

  // 无有效凭证：判断是否"免费排盘"还是"付费 AI 解读"
  try {
    const raw = await req.text();
    let isFreeCalc = true; // 默认当作免费，避免误伤
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // body 里带 prompt → 这是要调用 AI 的解读请求
        isFreeCalc = !parsed || !parsed.prompt;
      } catch {
        isFreeCalc = true;
      }
    }
    // /api/reading 是纯 AI 接口，无免费模式，必须持有效凭证（无论是否带 prompt）
    if (isReading) {
      isFreeCalc = false;
    }
    // 重建请求体转发给下游（否则 route 读不到 body）
    const forwarded = new NextRequest(req.url, {
      method: req.method,
      headers: req.headers,
      body: raw,
    });
    if (isFreeCalc) {
      return NextResponse.next({ request: forwarded });
    }
    return NextResponse.json(
      { error: '需要有效的解读凭证', code: 'PAYMENT_REQUIRED' },
      { status: 402 },
    );
  } catch {
    // 读 body 异常兜底：拦截，避免白嫖
    return NextResponse.json(
      { error: '需要有效的解读凭证', code: 'PAYMENT_REQUIRED' },
      { status: 402 },
    );
  }
}

export const config = {
  matcher: [
    '/api/bazi/:path*',
    '/api/horoscope/:path*',
    '/api/tarot/:path*',
    '/api/qimen/:path*',
    '/api/liuyao/:path*',
    '/api/synastry/:path*',
    '/api/huangli/:path*',
    '/api/ai/stream/:path*',
    '/api/ai/complete/:path*',
    '/api/reading/:path*',
  ],
};
