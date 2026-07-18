'use client';

import { create } from 'zustand';
import { getRemaining, loadEntitlement } from '@/lib/quota';

interface PaywallState {
  open: boolean;
  remaining: number;
  openPaywall: () => void;
  closePaywall: () => void;
  refresh: () => void;
}

export const usePaywall = create<PaywallState>((set) => ({
  open: false,
  remaining: typeof window !== 'undefined' ? getRemaining() : 0,
  openPaywall: () => set({ open: true }),
  closePaywall: () => set({ open: false }),
  refresh: () => {
    const e = loadEntitlement();
    set({ remaining: e ? e.remaining : 0 });
  },
}));
