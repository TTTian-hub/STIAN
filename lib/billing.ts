/**
 * 服务端计费核心 —— Next 侧 RPC 客户端
 *
 * 实际计费/数据库实现运行在独立的纯 Node 进程（billing-service/），
 * 本文件仅做薄封装：把函数调用转发到 sidecar (http://127.0.0.1:3100/billing)。
 * 这样 @cloudbase/node-sdk 不进入 Next 运行时，规避其全局 ReadableStream 冲突。
 *
 * 导出签名与原实现保持一致，所有路由/守卫无需改动。
 */
const BILLING_URL =
  process.env.BILLING_SIDECAR_URL || 'http://127.0.0.1:3100/billing';

async function rpc<T>(op: string, args: unknown[]): Promise<T> {
  const res = await fetch(BILLING_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, args }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    ok?: boolean;
    data?: T;
    error?: string;
  };
  if (!json.ok) {
    throw new Error(json.error || `billing rpc failed: ${op}`);
  }
  return json.data as T;
}

export interface ConsumeResult {
  ok: boolean;
  code?: 'INSUFFICIENT' | 'UNKNOWN';
  balance: number;
  need?: number;
  already?: boolean;
  ledgerId?: string;
  requestId?: string;
}

export interface OrderRow {
  order_id: string;
  user_id: string;
  package_id: string;
  amount: number;
  credits: number;
  status: 'pending' | 'paid' | 'failed' | 'closed' | 'refunded';
  payment_provider?: string;
  provider_transaction_id?: string;
  paid_at?: number;
  created_at: number;
  updated_at: number;
}

export interface HistoryRow {
  _id?: string;
  user_id: string;
  feature: string;
  feature_name: string;
  summary: string;
  result: unknown;
  ai_text?: string;
  cost: number;
  request_id: string;
  created_at: number;
}

export interface LedgerRow {
  _id?: string;
  user_id: string;
  feature: string;
  delta: number;
  balance_before: number;
  balance_after: number;
  request_id: string;
  description: string;
  created_at: number;
  refunded?: boolean;
  is_refund?: boolean;
}

export interface PackageConfig {
  package_id: string;
  name: string;
  price: number;
  credits: number;
  bonus_credits: number;
  enabled: boolean;
  sort_order: number;
}

export async function bootstrapBilling(): Promise<void> {
  await rpc('bootstrapBilling', []);
}
export async function ensureUser(userId: string): Promise<{ balance: number; free_granted: boolean }> {
  return rpc('ensureUser', [userId]);
}
export async function getBalance(userId: string): Promise<{ balance: number; free_granted: boolean }> {
  return rpc('getBalance', [userId]);
}
export async function consume(
  userId: string,
  feature: string,
  requestId: string,
  costOverride?: number,
): Promise<ConsumeResult> {
  return rpc('consume', [userId, feature, requestId, costOverride]);
}
export async function refund(userId: string, requestId: string, feature: string): Promise<boolean> {
  return rpc('refund', [userId, requestId, feature]);
}
export async function getLedger(userId: string, limit = 20): Promise<LedgerRow[]> {
  return rpc('getLedger', [userId, limit]);
}
export async function createOrder(userId: string, pkg: PackageConfig): Promise<OrderRow> {
  return rpc('createOrder', [userId, pkg]);
}
export async function getOrder(orderId: string): Promise<OrderRow | null> {
  return rpc('getOrder', [orderId]);
}
export async function markOrderPaid(
  orderId: string,
  provider: string,
  providerTxId: string,
): Promise<{ ok: boolean; alreadyPaid?: boolean; balance?: number }> {
  return rpc('markOrderPaid', [orderId, provider, providerTxId]);
}
export async function getPackages(): Promise<PackageConfig[]> {
  return rpc('getPackages', []);
}
export async function getPackage(packageId: string): Promise<PackageConfig | null> {
  return rpc('getPackage', [packageId]);
}
export async function grantCredits(
  userId: string,
  credits: number,
  description: string,
  requestId: string,
): Promise<number> {
  return rpc('grantCredits', [userId, credits, description, requestId]);
}
export async function saveHistory(row: Omit<HistoryRow, '_id'>): Promise<void> {
  await rpc('saveHistory', [row]);
}
export async function getHistory(
  userId: string,
  featureFilter?: string,
  limit = 50,
): Promise<HistoryRow[]> {
  return rpc('getHistory', [userId, featureFilter, limit]);
}
export async function deleteHistory(id: string, userId: string): Promise<boolean> {
  return rpc('deleteHistory', [id, userId]);
}
