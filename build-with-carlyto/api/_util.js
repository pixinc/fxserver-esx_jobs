const crypto = require('crypto');

const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me-in-vercel-env';

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function hmac(data) {
  return b64url(crypto.createHmac('sha256', SECRET).update(data).digest());
}

// Stateless signed token: base64url(payload).hmac
function makeToken(payload, ttlSeconds) {
  const body = b64url(JSON.stringify({ ...payload, exp: Date.now() + ttlSeconds * 1000 }));
  return body + '.' + hmac(body);
}

function readToken(token) {
  if (!token || typeof token !== 'string') return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = hmac(body);
  if (sig.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  raw.split(';').forEach((part) => {
    const i = part.indexOf('=');
    if (i > -1) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  });
  return out;
}

function cookie(name, value, maxAgeSeconds) {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSeconds}`;
}

function signInMessage(address, nonce) {
  return `Build with Carlyto — sign-in\n\nAddress: ${address.toLowerCase()}\nNonce: ${nonce}`;
}

// Resolve the holder's tier: 'dayone' | 'builder' | null.
// Until the contracts are deployed (env vars unset), demo mode grants
// 'builder' to any signed-in wallet and 'dayone' to wallets listed in DEMO_VIPS.
async function getTier(address) {
  const vip = process.env.VIP_CONTRACT;
  const builder = process.env.BUILDER_CONTRACT;
  const addr = address.toLowerCase();

  if (!vip && !builder) {
    const vips = (process.env.DEMO_VIPS || '').toLowerCase().split(',').map((s) => s.trim());
    return vips.includes(addr) ? 'dayone' : 'builder';
  }

  const rpc = process.env.ETH_RPC_URL || 'https://ethereum-rpc.publicnode.com';
  const balanceOf = async (contract) => {
    const data = '0x70a08231' + addr.replace(/^0x/, '').padStart(64, '0');
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_call', params: [{ to: contract, data }, 'latest'] })
    });
    const json = await res.json();
    return json.result ? BigInt(json.result) : 0n;
  };

  if (vip && (await balanceOf(vip)) > 0n) return 'dayone';
  if (builder && (await balanceOf(builder)) > 0n) return 'builder';
  return null;
}

module.exports = { makeToken, readToken, parseCookies, cookie, signInMessage, getTier };
