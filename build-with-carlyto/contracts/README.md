# Build with Carlyto — Smart contracts

One contract, deployed twice on **Ethereum mainnet** (test everything on Sepolia first):

| Deployment | name / symbol | maxSupply | price (example) | baseURI |
|---|---|---|---|---|
| Day One | `Build with Carlyto — Day One` / `BWCDAY1` | `100` | `5.5 ether` ≈ $10,000 | `https://<site>/api/metadata/dayone/` |
| Builder | `Build with Carlyto — Builder` / `BWCBLDR` | `1500` | `0.25 ether` ≈ $450 | `https://<site>/api/metadata/builder/` |

Price is set in **wei** at deploy time and adjustable later with `setPrice`
(peg it to the target USD amount close to mint day; it cannot change per-buyer).

## Features

- **ERC-721**, ids from 1, `mint(quantity)` public sale gated by `mintOpen`, `treasuryMint` for reserves.
- **`engraveName(tokenId, name)`** — the holder engraves their ledger name **once**, immutable,
  stored on-chain, surfaced in metadata and on the artwork.
- **ERC-4906** — `refreshMetadata()` (or `setBaseURI`) pings marketplaces after off-chain badge
  updates so OpenSea & co. re-pull the JSON.
- `withdraw(to)` sends the balance to the treasury wallet.

## Deploy (simplest path: Remix)

1. Open [remix.ethereum.org](https://remix.ethereum.org), create `BuildWithCarlyto.sol`, paste the contract.
2. Compiler 0.8.24+, enable optimizer (200 runs). OpenZeppelin imports resolve automatically
   (`@openzeppelin/contracts` ^5.x).
3. Deploy on **Sepolia** first with test values; run through: `setMintOpen(true)`, `mint`,
   `engraveName`, `refreshMetadata`, `withdraw`.
4. Deploy both mainnet instances from a **hardware wallet**; verify the source on Etherscan.
5. Put the two addresses in Vercel env: `VIP_CONTRACT`, `BUILDER_CONTRACT` — the members
   area gate switches from demo mode to real on-chain checks automatically.

## Metadata API (to build next)

`baseURI + tokenId` must return the ERC-721 JSON (tier, color, variant, `Ledger Name` read
from the contract, venture badges, chapters witnessed). Until that API exists, point baseURI
at a static JSON folder — `refreshMetadata()` covers the migration later.

## Non-negotiables before mainnet

- **Legal review** (membership framing, MiCA/AMF) — the contract holds funds.
- **Audit or at least a second pair of expert eyes** on the final contract.
- Treasury = multisig (Safe) rather than an EOA.
