const crypto = require('crypto');
const { makeToken, cookie } = require('./_util');

module.exports = (req, res) => {
  const nonce = crypto.randomBytes(16).toString('hex');
  res.setHeader('Set-Cookie', cookie('bwc_nonce', makeToken({ nonce }, 600), 600));
  res.status(200).json({ nonce });
};
