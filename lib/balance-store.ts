'use client';

import { create } from 'zustand';
import { getToken, ensureTrial } from '@/lib/quota';

export interface LedgerItem {
  feature: string;
  delta: number;
  balance_after: number;
  description: string;
  created_at: number;
  refunded: boolean;
}

interface BalanceState {
  balance: number;
  freeGranted: boolean;
  ledger: LedgerItem[];
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useBalance = create<BalanceState>((set) => ({
  balance: 0,
  freeGranted: false,
  ledger: [],
  loading: false,
  refresh: async () => {
    let token = getToken();
    if (!token) {
      // 首次访问：申领免费试用 token（服务端据此识别用户并发放首登 3 次）
      await ensureTrial();
      token = getToken();
    }
    if (!token) {
      set({ balance: 0 });
      return;
    }
    set({ loading: true });
    try {
      const res = await fetch('/api/balance', {
        headers: { 'x-entitlement': token },
      });
      if (res.ok) {
        const data = await res.json();
        set({ balance: data.balance, freeGranted: data.free_granted, ledger: data.ledger || [] });
      }
    } catch {
      /* 忽略网络错误 */
    } finally {
      set({ loading: false });
    }
  },
}));
