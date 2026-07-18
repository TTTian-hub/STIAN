/**
 * 站长发卡脚本：批量生成激活码
 *
 * 运行（务必和部署用的 ENTITLEMENT_SECRET 一致！）：
 *   ENTITLEMENT_SECRET=你的密钥 node scripts/gen-codes.mjs --quota 5 --count 20
 *
 * 参数：
 *   --quota <n>   每个激活码包含的解读次数（默认 5）
 *   --count <n>   生成数量（默认 10）
 *   --exp   <d>   激活码有效期天数（默认 365）
 *
 * 输出：直接打印激活码，复制发给已付款用户即可。
 */
import { webcrypto } from 'node:crypto';

const crypto = webcrypto;
const enc = new TextEncoder();
const dec = new TextDecoder();

const SECRET = process.env.ENTITLEMENT_SECRET || 'CHANGE_ME_PAYWALL_ENTITLEMENT_SECRET';

function b64url(bytes) {
  return Buffer.from(bytes).toString('base64url');
}
function b64urlStr(s) {
  return Buffer.from(s, 'utf8').toString('base64url');
}
function fromB64urlStr(s) {
  return Buffer.from(s, 'base64url').toString('utf8');
}

async function hmac(secret, data) {
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return new Uint8Array(sig);
}

async function genCode(quota, expDays) {
  const exp = Date.now() + expDays * 24 * 60 * 60 * 1000;
  const body = b64urlStr(JSON.stringify({ quota, exp }));
  const sig = await hmac(SECRET, body);
  // 分隔符用 "."（base64url 不含 "."），避免 sig/body 内部的 "-"/"_" 干扰验签切分
  return `AF-${b64url(sig)}.${body}`;
}

// --- 简单参数解析 ---
const args = process.argv.slice(2);
const getArg = (name, def) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const quota = parseInt(getArg('quota', '5'), 10);
const count = parseInt(getArg('count', '10'), 10);
const exp = parseInt(getArg('exp', '365'), 10);

if (SECRET === 'CHANGE_ME_PAYWALL_ENTITLEMENT_SECRET') {
  console.warn('\n⚠️  警告：未设置 ENTITLEMENT_SECRET 环境变量，使用了默认占位密钥。');
  console.warn('   部署网站的 CloudBase 环境变量 ENTITLEMENT_SECRET 必须与这里用的完全一致，否则激活码无法兑换！\n');
}

console.log(`\n生成激活码：quota=${quota} 次 / 数量=${count} / 有效期=${exp}天\n`);
const codes = [];
for (let i = 0; i < count; i++) {
  const c = await genCode(quota, exp);
  codes.push(c);
  console.log(`  ${i + 1}. ${c}`);
}
console.log(`\n共 ${codes.length} 个。复制发给已付款用户，用户在网站"解锁 AI 解读"弹窗输入即可激活 ${quota} 次额度。\n`);
