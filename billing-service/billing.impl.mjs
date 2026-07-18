/**
 * AskFate 计费核心实现（纯 Node 进程，独立于 Next.js 运行时）
 *
 * 为什么要拆成独立进程：
 *   @cloudbase/node-sdk 与 Next.js standalone 运行时的全局 ReadableStream/fetch 不兼容，
 *   在 Next 进程内调用会抛 "Expected ... to be an instance of ReadableStream"。
 *   在纯 Node 进程里 SDK 工作正常（已验证）。故计费/数据库层独立运行，由 Next 路由经
 *   localhost HTTP (RPC) 调用。
 *
 * 业务规则与 lib/billing.ts 保持一致（原子扣次、幂等、退款、流水、首登赠送等）。
 */
import cloudbase from '@cloudbase/node-sdk';

const TCB_ENV = process.env.TCB_ENV || 'stain-d4geos14g9529a413';
const TCB_SECRET_ID = process.env.TCB_SECRET_ID;
const TCB_SECRET_KEY = process.env.TCB_SECRET_KEY;

const COLLECTIONS = {
  BALANCES: 'user_balances',
  LEDGER: 'usage_ledger',
  ORDERS: 'recharge_orders',
  PACKAGES: 'recharge_packages',
  HISTORY: 'interpret_history',
};

// 与 config/billing.ts 保持一致
const FEATURE_COSTS = {
  reading: 1, huangli: 0, horoscope: 1, tarot: 1, liuyao: 2, bazi: 3, qimen: 3, synastry: 3,
};
const FEATURE_NAMES = {
  reading: 'AI 心语', huangli: '黄历', horoscope: '星座运势', tarot: '塔罗', liuyao: '六爻',
  bazi: '八字', qimen: '奇门', synastry: '合盘', recharge: '充值',
};
const FREE_TRIAL_QUOTA = Number(process.env.FREE_TRIAL_QUOTA || 3);
const DEFAULT_PACKAGES = [
  { package_id: 'lite', name: '轻量体验', price: 9.9, credits: 20, bonus_credits: 0, enabled: true, sort_order: 1 },
  { package_id: 'standard', name: '常用套餐', price: 29.9, credits: 70, bonus_credits: 0, enabled: true, sort_order: 2 },
  { package_id: 'deep', name: '深度解读', price: 68, credits: 180, bonus_credits: 0, enabled: true, sort_order: 3 },
];
const getFeatureCost = (f) => (f in FEATURE_COSTS ? FEATURE_COSTS[f] : 1);
const getFeatureName = (f) => (f in FEATURE_NAMES ? FEATURE_NAMES[f] : f);

let _db = null;
let _initPromise = null;
let _bootstrapped = false; // 进程内仅初始化集合/种子一次，降低 DB 读配额消耗

function ensureDb() {
  if (_db) return Promise.resolve(_db);
  if (!_initPromise) {
    if (!TCB_SECRET_ID || !TCB_SECRET_KEY) {
      return Promise.reject(new Error('缺少 TCB_SECRET_ID / TCB_SECRET_KEY 环境变量，无法连接云数据库'));
    }
    _initPromise = (async () => {
      const tcb = cloudbase;
      const app = tcb.init({ env: TCB_ENV, secretId: TCB_SECRET_ID, secretKey: TCB_SECRET_KEY });
      _db = app.database();
      return _db;
    })();
  }
  return _initPromise;
}

async function ensureCollection(name) {
  const db = await ensureDb();
  await db.createCollection(name).catch(() => { /* 已存在则忽略 */ });
}

const now = () => Date.now();

export async function bootstrapBilling() {
  if (_bootstrapped) return;
  await ensureCollection(COLLECTIONS.BALANCES);
  await ensureCollection(COLLECTIONS.LEDGER);
  await ensureCollection(COLLECTIONS.ORDERS);
  await ensureCollection(COLLECTIONS.PACKAGES);
  await ensureCollection(COLLECTIONS.HISTORY);
  const db = await ensureDb();
  const existing = await db.collection(COLLECTIONS.PACKAGES).where({}).limit(1).get();
  if (!existing.data || existing.data.length === 0) {
    for (const p of DEFAULT_PACKAGES) {
      await db.collection(COLLECTIONS.PACKAGES).add({ ...p, created_at: now() });
    }
  }
  _bootstrapped = true;
}

export async function ensureUser(userId) {
  const db = await ensureDb();
  const col = db.collection(COLLECTIONS.BALANCES);
  const rec = await col.where({ user_id: userId }).get();
  if (rec.data && rec.data.length > 0) {
    const d = rec.data[0];
    return { balance: d.balance, free_granted: d.free_granted };
  }
  try {
    await col.add({
      user_id: userId, balance: FREE_TRIAL_QUOTA, free_granted: true,
      created_at: now(), updated_at: now(),
    });
  } catch { /* 并发已建，忽略 */ }
  return { balance: FREE_TRIAL_QUOTA, free_granted: true };
}

export async function getBalance(userId) {
  await ensureUser(userId);
  const db = await ensureDb();
  const rec = await db.collection(COLLECTIONS.BALANCES).where({ user_id: userId }).get();
  if (rec.data && rec.data.length > 0) {
    const d = rec.data[0];
    return { balance: d.balance, free_granted: d.free_granted };
  }
  return { balance: 0, free_granted: false };
}

export async function consume(userId, feature, requestId, costOverride) {
  const cost = costOverride ?? getFeatureCost(feature);
  const db = await ensureDb();
  const ledgerId = `${userId}::${requestId}`;
  const ledgerCol = db.collection(COLLECTIONS.LEDGER);

  const existing = await ledgerCol.doc(ledgerId).get();
  // @cloudbase/node-sdk v3 的 doc(id).get() 返回 { data: [doc] }（数组），需归一化
  const existingDoc = Array.isArray(existing.data)
    ? (existing.data[0] || null)
    : (existing.data || null);
  if (existingDoc && existingDoc._id) {
    return { ok: true, balance: existingDoc.balance_after, already: true, ledgerId, requestId };
  }

  if (cost <= 0) {
    const bal = await getBalance(userId);
    await ledgerCol.doc(ledgerId).set({
      user_id: userId, feature, delta: 0,
      balance_before: bal.balance, balance_after: bal.balance,
      request_id: requestId, description: `免费 · ${getFeatureName(feature)}`, created_at: now(),
    });
    return { ok: true, balance: bal.balance, ledgerId, requestId };
  }

  const balRec = await db.collection(COLLECTIONS.BALANCES).where({ user_id: userId }).get();
  if (!balRec.data || balRec.data.length === 0) {
    return { ok: false, code: 'INSUFFICIENT', balance: 0, need: cost };
  }
  const current = balRec.data[0].balance;
  if (current < cost) {
    return { ok: false, code: 'INSUFFICIENT', balance: current, need: cost };
  }

  const cmd = db.command;
  const upd = await db.collection(COLLECTIONS.BALANCES)
    .where({ user_id: userId, balance: cmd.gte(cost) })
    .update({ balance: cmd.inc(-cost), updated_at: now() });
  if (upd.updated !== 1) {
    const refreshed = await db.collection(COLLECTIONS.BALANCES).where({ user_id: userId }).get();
    const b2 = refreshed.data?.[0] ? refreshed.data[0].balance : 0;
    return { ok: false, code: 'INSUFFICIENT', balance: b2, need: cost };
  }

  const after = current - cost;
  await ledgerCol.doc(ledgerId).set({
    user_id: userId, feature, delta: -cost,
    balance_before: current, balance_after: after,
    request_id: requestId, description: `消耗 · ${getFeatureName(feature)}`,
    created_at: now(), refunded: false,
  });
  return { ok: true, balance: after, ledgerId, requestId };
}

export async function refund(userId, requestId, feature) {
  const db = await ensureDb();
  const ledgerId = `${userId}::${requestId}`;
  const ledgerCol = db.collection(COLLECTIONS.LEDGER);
  const rec = await ledgerCol.doc(ledgerId).get();
  // @cloudbase/node-sdk v3 的 doc(id).get() 返回 { data: [doc] }（数组），需归一化
  const recDoc = Array.isArray(rec.data) ? (rec.data[0] || null) : (rec.data || null);
  if (!recDoc || !recDoc._id) return false;
  const row = rec.data;
  if (row.refunded || row.delta >= 0) return false;

  const amount = -row.delta;
  const cmd = db.command;
  await db.collection(COLLECTIONS.BALANCES).where({ user_id: userId })
    .update({ balance: cmd.inc(amount), updated_at: now() });
  await ledgerCol.doc(ledgerId).update({ refunded: true });
  await ledgerCol.add({
    user_id: userId, feature, delta: amount,
    balance_before: row.balance_after, balance_after: row.balance_after + amount,
    request_id: requestId, description: `退款 · ${getFeatureName(feature)}（AI 生成失败）`,
    created_at: now(), is_refund: true,
  });
  return true;
}

export async function getLedger(userId, limit = 20) {
  const db = await ensureDb();
  const res = await db.collection(COLLECTIONS.LEDGER)
    .where({ user_id: userId }).orderBy('created_at', 'desc').limit(limit).get();
  return res.data || [];
}

export async function createOrder(userId, pkg) {
  const db = await ensureDb();
  const order_id = `o_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const order = {
    order_id, user_id: userId, package_id: pkg.package_id,
    amount: pkg.price, credits: pkg.credits + pkg.bonus_credits,
    status: 'pending', created_at: now(), updated_at: now(),
  };
  await db.collection(COLLECTIONS.ORDERS).add(order);
  return order;
}

export async function getOrder(orderId) {
  const db = await ensureDb();
  const res = await db.collection(COLLECTIONS.ORDERS).where({ order_id: orderId }).get();
  return res.data?.[0] ? res.data[0] : null;
}

export async function markOrderPaid(orderId, provider, providerTxId) {
  const db = await ensureDb();
  const orders = db.collection(COLLECTIONS.ORDERS);
  const res = await orders.where({ order_id: orderId }).get();
  if (!res.data || res.data.length === 0) return { ok: false };
  const order = res.data[0];
  if (order.status === 'paid') {
    const bal = await getBalance(order.user_id);
    return { ok: true, alreadyPaid: true, balance: bal.balance };
  }
  const cmd = db.command;
  const upd = await orders.where({ order_id: orderId, status: 'pending' })
    .update({ status: 'paid', payment_provider: provider, provider_transaction_id: providerTxId, paid_at: now(), updated_at: now() });
  if (upd.updated !== 1) {
    const bal = await getBalance(order.user_id);
    return { ok: true, alreadyPaid: true, balance: bal.balance };
  }
  await db.collection(COLLECTIONS.BALANCES).where({ user_id: order.user_id })
    .update({ balance: cmd.inc(order.credits), updated_at: now() });
  await db.collection(COLLECTIONS.LEDGER).add({
    user_id: order.user_id, feature: 'recharge', delta: order.credits, balance_after: 0,
    request_id: order.order_id, description: `充值 · ${order.credits} 次（${provider}）`, created_at: now(),
  });
  const bal = await getBalance(order.user_id);
  const lr = await db.collection(COLLECTIONS.LEDGER).where({ user_id: order.user_id, request_id: order.order_id }).get();
  if (lr.data?.[0]) {
    await db.collection(COLLECTIONS.LEDGER).doc(lr.data[0]._id).update({ balance_after: bal.balance });
  }
  return { ok: true, balance: bal.balance };
}

export async function getPackages() {
  const db = await ensureDb();
  const res = await db.collection(COLLECTIONS.PACKAGES).where({ enabled: true }).orderBy('sort_order', 'asc').get();
  if (res.data && res.data.length > 0) return res.data;
  return DEFAULT_PACKAGES.filter((p) => p.enabled);
}

export async function getPackage(packageId) {
  const db = await ensureDb();
  const res = await db.collection(COLLECTIONS.PACKAGES).where({ package_id: packageId }).get();
  return res.data?.[0] ? res.data[0] : null;
}

export async function grantCredits(userId, credits, description, requestId) {
  const db = await ensureDb();
  const cmd = db.command;
  await db.collection(COLLECTIONS.BALANCES).where({ user_id: userId })
    .update({ balance: cmd.inc(credits), updated_at: now() });
  await db.collection(COLLECTIONS.LEDGER).add({
    user_id: userId, feature: 'recharge', delta: credits, balance_after: 0,
    request_id: requestId, description, created_at: now(),
  });
  const bal = await getBalance(userId);
  const lr = await db.collection(COLLECTIONS.LEDGER).where({ user_id: userId, request_id: requestId }).get();
  if (lr.data?.[0]) {
    await db.collection(COLLECTIONS.LEDGER).doc(lr.data[0]._id).update({ balance_after: bal.balance });
  }
  return bal.balance;
}

export async function saveHistory(row) {
  const db = await ensureDb();
  await db.collection(COLLECTIONS.HISTORY).add(row);
}

export async function getHistory(userId, featureFilter, limit = 50) {
  const db = await ensureDb();
  let q = db.collection(COLLECTIONS.HISTORY).where({ user_id: userId });
  if (featureFilter && featureFilter !== 'all') {
    q = db.collection(COLLECTIONS.HISTORY).where({ user_id: userId, feature: featureFilter });
  }
  const res = await q.orderBy('created_at', 'desc').limit(limit).get();
  return res.data || [];
}

export async function deleteHistory(id, userId) {
  const db = await ensureDb();
  const res = await db.collection(COLLECTIONS.HISTORY).where({ _id: id, user_id: userId }).remove();
  return (res && res.deleted) > 0;
}

/** RPC 分发：op 名即函数名，args 为参数数组 */
export async function handleBilling(op, args = []) {
  const fn = {
    bootstrapBilling, ensureUser, getBalance, consume, refund, getLedger,
    createOrder, getOrder, markOrderPaid, getPackages, getPackage, grantCredits,
    saveHistory, getHistory, deleteHistory,
  }[op];
  if (!fn) throw new Error(`未知计费操作: ${op}`);
  return fn(...args);
}
