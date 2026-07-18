const { verifyMessage } = require('ethers');
const { makeToken, readToken, parseCookies, cookie, signInMessage, getTier } = require('./_util');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { address, signature } = req.body || {};
  if (!address || !signature || !/^0x[0-9a-fA-F]{40}$/.test(address)) {
    return res.status(400).json({ error: 'address and signature required' });
  }

  const noncePayload = readToken(parseCookies(req).bwc_nonce);
  if (!noncePayload) return res.status(400).json({ error: 'nonce expired — retry' });

  let recovered;
  try {
    recovered = verifyMessage(signInMessage(address, noncePayload.nonce), signature);
  } catch {
    return res.status(401).json({ error: 'invalid signature' });
  }
  if (recovered.toLowerCase() !== address.toLowerCase()) {
    return res.status(401).json({ error: 'signature does not match address' });
  }

  const tier = await getTier(address);
  if (!tier) return res.status(403).json({ error: 'no Build with Carlyto NFT found in this wallet' });

  res.setHeader('Set-Cookie', [
    cookie('bwc_session', makeToken({ address: address.toLowerCase(), tier }, 7 * 24 * 3600), 7 * 24 * 3600),
    cookie('bwc_nonce', '', 0)
  ]);
  res.status(200).json({ tier, address: address.toLowerCase() });
};
