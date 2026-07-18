'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Check, Loader2, ExternalLink, Coins, RefreshCw } from 'lucide-react';
import { usePaywall } from '@/lib/paywall-store';
import { useBalance } from '@/lib/balance-store';
import { getToken } from '@/lib/quota';
import { redeemCode } from '@/lib/quota';
import { PRICING, PURCHASE } from '@/config/paywall';

interface Pkg {
  package_id: string;
  name: string;
  price: number;
  credits: number;
  bonus_credits: number;
}

export function Paywall() {
  const { open, closePaywall, refresh: refreshPaywall } = usePaywall();
  const { balance, ledger, refresh: refreshBalance } = useBalance();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [order, setOrder] = useState<{ order_id: string; code_url?: string; pay_method: string } | null>(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (open) {
      refreshBalance();
      refreshPaywall();
      // 拉取可购买套餐
      const token = getToken();
      if (token) {
        fetch('/api/recharge/packages')
          .then((r) => r.json())
          .then((d) => setPackages(d.packages || []))
          .catch(() => setPackages([]));
      }
      setMsg(null);
      setOrder(null);
    }
  }, [open, refreshBalance, refreshPaywall]);

  // 微信订单轮询
  useEffect(() => {
    if (!order || order.pay_method !== 'wechat' || !order.code_url) return;
    setPolling(true);
    const timer = setInterval(async () => {
      const token = getToken();
      try {
        const res = await fetch(`/api/recharge/order/${order.order_id}`, {
          headers: token ? { 'x-entitlement': token } : {},
        });
        const d = await res.json();
        if (d.ok && d.status === 'paid') {
          clearInterval(timer);
          setPolling(false);
          setMsg({ type: 'ok', text: `充值成功！当前剩余 ${d.credits} 次 🎉` });
          await refreshBalance();
        }
      } catch {
        /* ignore */
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [order, refreshBalance]);

  if (!open) return null;

  const handleRedeem = async () => {
    if (!code.trim()) {
      setMsg({ type: 'err', text: '请输入激活码' });
      return;
    }
    setLoading(true);
    setMsg(null);
    const r = await redeemCode(code.trim());
    setLoading(false);
    if (r.ok) {
      setMsg({ type: 'ok', text: `激活成功！获得 ${r.quota} 次解读额度 🎉` });
      setCode('');
      await refreshBalance();
      setTimeout(() => closePaywall(), 1200);
    } else {
      setMsg({ type: 'err', text: r.error || '兑换失败' });
    }
  };

  const handleBuy = async (pkg: Pkg) => {
    setLoading(true);
    setMsg(null);
    const token = getToken();
    try {
      const res = await fetch('/api/recharge/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { 'x-entitlement': token } : {}) },
        body: JSON.stringify({ package_id: pkg.package_id }),
      });
      const d = await res.json();
      if (!res.ok || !d.ok) {
        setMsg({ type: 'err', text: d.error || '创建订单失败' });
        return;
      }
      if (d.pay_method === 'wechat' && d.code_url) {
        setOrder({ order_id: d.order_id, code_url: d.code_url, pay_method: 'wechat' });
      } else {
        setMsg({ type: 'ok', text: d.message || '订单已创建，请使用激活码完成充值' });
      }
    } catch {
      setMsg({ type: 'err', text: '网络错误，请重试' });
    } finally {
      setLoading(false);
    }
  };

  const goBuy = (url?: string) => {
    const target = url && url.trim() ? url : PURCHASE.defaultUrl;
    window.open(target, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-cyan-100 dark:border-slate-700 max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-cyan-50 dark:border-slate-800 px-5 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-600" />
            </div>
            <h2 className="text-lg font-semibold text-cyan-900 dark:text-cyan-100">充值中心</h2>
          </div>
          <button
            onClick={closePaywall}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="关闭"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* 当前余额 */}
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-cyan-50 to-cyan-100 dark:from-cyan-950/40 dark:to-cyan-900/30 border border-cyan-200 dark:border-cyan-800 px-4 py-3">
            <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-200">
              <Coins className="w-5 h-5" />
              <span className="text-sm font-medium">当前剩余</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{balance}</span>
              <span className="text-xs text-cyan-600 dark:text-cyan-400">次</span>
              <button onClick={() => refreshBalance()} className="p-1 text-cyan-500 hover:text-cyan-700" aria-label="刷新余额">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 套餐 */}
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">选择套餐</p>
            <div className="grid grid-cols-3 gap-2">
              {(packages.length > 0 ? packages : []).map((p) => (
                <button
                  key={p.package_id}
                  onClick={() => handleBuy(p)}
                  disabled={loading}
                  className="relative rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyan-300 hover:shadow-md hover:-translate-y-0.5 transition-all p-3 text-center disabled:opacity-60"
                >
                  <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-300">{p.credits}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">次</div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-1">{p.price} 元</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{p.name}</div>
                </button>
              ))}
            </div>
            {packages.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-2">套餐加载中…</p>
            )}
          </div>

          {/* 微信扫码（仅微信支付启用时） */}
          {order?.pay_method === 'wechat' && order.code_url && (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">请使用微信扫一扫</p>
              <div className="mx-auto w-48 h-48 bg-white rounded-lg flex items-center justify-center text-[10px] text-slate-400 break-all p-2 border">
                {order.code_url}
              </div>
              {polling && <p className="text-xs text-cyan-600 flex items-center justify-center gap-1"><Loader2 className="w-3 h-3 animate-spin" />正在确认支付…</p>}
            </div>
          )}

          {/* 站外购买说明 */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-4 space-y-3">
            <button
              onClick={() => goBuy()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white text-sm font-semibold shadow-sm transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              {PURCHASE.buttonText}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">{PURCHASE.platformNote}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{PURCHASE.instructions}</p>
          </div>

          {/* 激活码输入 */}
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">已购买？输入激活码解锁</label>
            <div className="mt-2 flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="粘贴激活码（AF- 开头）"
                className="flex-1 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 text-sm"
              />
              <button
                onClick={handleRedeem}
                disabled={loading}
                className="px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white text-sm font-medium flex items-center gap-1.5 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                激活
              </button>
            </div>
            {msg && (
              <p className={`mt-2 text-sm ${msg.type === 'ok' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                {msg.text}
              </p>
            )}
          </div>

          {/* 最近流水 */}
          {ledger.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 mb-2">最近记录</p>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {ledger.map((l, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400 truncate flex-1 pr-2">{l.description}</span>
                    <span className={l.delta >= 0 ? 'text-emerald-600' : 'text-rose-500'}>
                      {l.delta >= 0 ? '+' : ''}{l.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-400 dark:text-slate-500 text-center">{PURCHASE.contactNote}</p>
        </div>
      </div>
    </div>
  );
}
