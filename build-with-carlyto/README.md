# Build with Carlyto — Website

Official site for the **Build with Carlyto** project: public landing page + token-gated members area.

> Don't invest in a company. Build with the entrepreneur.

## Structure

```
public/
  index.html      Landing page (self-contained: markup, styles, scripts)
  members.html    Private members area (served at /members, token-gated)
  portrait.webp   Builder portrait (face blurred by AI)
api/
  nonce.js        GET  — issues a sign-in nonce (10 min, signed cookie)
  verify.js       POST — verifies the wallet signature + NFT ownership, opens a 7-day session
  me.js           GET  — returns the current session (address + tier)
  logout.js       GET  — clears the session
vercel.json       framework: null (static + serverless), cleanUrls
package.json      ethers (signature verification)
```

## How the NFT gate works

1. `/members` asks the visitor to connect a wallet and sign a message (free, no transaction).
2. `api/verify` recovers the signer address (EIP-191 via ethers), checks the nonce, then reads
   `balanceOf(address)` on the collection contracts through JSON-RPC (`eth_call`).
3. Holding a **Day One** token grants tier `dayone`; a **Builder** token grants `builder`.
   The session is a signed HttpOnly cookie (HMAC-SHA256), valid 7 days.
4. The members page shows everything to `dayone`, and locks the Deal Room, quarterly calls
   and guaranteed allocations for `builder`.

## Environment variables (Vercel → Settings → Environment Variables)

| Variable | Required | Purpose |
|---|---|---|
| `SESSION_SECRET` | **yes, in production** | HMAC key for nonce + session cookies. Any long random string. |
| `VIP_CONTRACT` | when deployed | Day One ERC-721 contract address (Ethereum mainnet). |
| `BUILDER_CONTRACT` | when deployed | Builder ERC-721 contract address. |
| `ETH_RPC_URL` | recommended | JSON-RPC endpoint (Alchemy/Infura). Defaults to a public node. |
| `DEMO_VIPS` | optional | Demo mode only: comma-separated wallet addresses treated as Day One. |

**Demo mode:** while `VIP_CONTRACT` and `BUILDER_CONTRACT` are unset, any wallet that signs in
gets `builder` access, and wallets listed in `DEMO_VIPS` get `dayone` — so the members area can
be tested before the collection exists.

## Deploy

Vercel: import the repo, framework preset **Other** (or rely on `vercel.json`), no build command.
Static files ship from `public/`, functions from `api/`.

Local: `npm i -g vercel && vercel dev`

## Notes

- Single deliberate theme: white ground, near-black text, amber accent.
- System fonts only; no build step for the front end.
- The primary call-to-action button is a placeholder (`Get the collection — coming soon`);
  point it at the mint URL when available.
