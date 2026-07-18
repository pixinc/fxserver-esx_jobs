const { readToken, parseCookies } = require('./_util');

module.exports = (req, res) => {
  const session = readToken(parseCookies(req).bwc_session);
  if (!session) return res.status(401).json({ error: 'not signed in' });
  res.status(200).json({ address: session.address, tier: session.tier });
};
