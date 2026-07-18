const { readToken, parseCookies } = require('./_util');
const data = require('../content/ledger.json');

// Session-gated ledger feed. Deal Room entries and the Day One channel
// are filtered server-side: a Builder session never receives them.
module.exports = (req, res) => {
  const session = readToken(parseCookies(req).bwc_session);
  if (!session) return res.status(401).json({ error: 'not signed in' });

  const isVip = session.tier === 'dayone';
  res.status(200).json({
    tier: session.tier,
    entries: data.entries,
    dealroom: isVip ? data.dealroom : null,
    channel: isVip ? (process.env.DAYONE_CHANNEL_URL || null) : null
  });
};
