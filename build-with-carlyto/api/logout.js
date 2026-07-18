const { cookie } = require('./_util');

module.exports = (req, res) => {
  res.setHeader('Set-Cookie', cookie('bwc_session', '', 0));
  res.status(200).json({ ok: true });
};
