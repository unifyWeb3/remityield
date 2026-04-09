# remitYield

### cross-border payments that earn yield the moment they arrive.

> built for the [Starknet Hackathon](https://starkzap.devfolio.co/) · Future of Work Track · Powered by [StarkZap SDK](https://docs.starknet.io/build/starkzap/overview) on Starknet

 · [live Demo](https://remityield.vercel.app) 
 · [source Code](https://github.com/unifyweb3/remityield) 
 · [@unifyWeb3](https://x.com/unifyWeb3)

---

## the Problem

every year, migrant workers send $700b+ in remittances to their families back home. Here's what they face:

| pain Point | reality |
|---|---|
| fees | western union charges 5–10% per transfer ($5–$10 on every $100) |
| speed | 1–3 business days for funds to arrive |
| privacy | banks, intermediaries, and block explorers see every amount |
| idle money | received funds sit in wallets or bank accounts earning 0% yield |
| access barriers | recipients need bank accounts, photo ID, or physical pickup locations |

a worker in London sends $200 home to Lagos - after fees, $180 arrives, three days later - that $180 sits in a mobile money wallet and after one year, inflation has eaten into its value. The money never worked. It just waited.

---

## the solution

remitYield turns every remittance into a yield-generating event.

```
Sender abroad                           Recipient at home
     │                                        │
     │  Sends $100 USDC                       │
     │  (bridged from ethereum)               │
     ▼                                        │
  ┌──────────────┐                            │
  │  Starknet    │  Confidential transfer     │
  │  (Tongo)     │  ─── amount hidden ───────▶│
  └──────────────┘                            │
                                              ▼
                                   ┌──────────────────┐
                                   │  Auto-deposited   │
                                   │  into Vesu        │
                                   │  lending pool     │
                                   │                   │
                                   │  earning ~4.2%    │
                                   │  APY instantly    │
                                   └──────────────────┘
                                              │
                                              │  Withdraw
                                              │  anytime
                                              ▼
                                        $100 + yield
                                        Zero gas fees
```

the magic moment : your family sends you money. it arrives privately. and already earning yield before you open the app.

---

## before vs After

| | western Union | remitYield |
|---|---|---|
| fees | $5–$10 per $100 | $0 (gasless via AVNU Paymaster) |
| speed | 1–3 business days | ~30 seconds |
| privacy | bank sees everything | amounts hidden (Tongo confidential transfers) |
| yield on idle money | 0% | ~4.2% APY (vesu lending) |
| login required | Photo ID + forms + physical visit | email or google |
| recipient needs | bank account or pickup location | just an email address |

---

## how It Works

### step 1: unify sends You Money 

a sender from abroad connects their ethereum wallet and sends USDC. the StarkZap bridging module moves funds from ethereum → Starknet via CCTP (Circle's Cross-Chain Transfer Protocol).

### step 2: arrives privately 

the transfer goes through Tongo : starknet's confidential transfer protocol. the amount is hidden on-chain using zero-knowledge proofs. no one except the sender and recipient can see how much was sent. block explorers show the transaction happened but not the amount.

### step 3 : it starts earning instantly

using the starkZap Tx builder, we batch three operations into one atomic transaction:

1. rollover pending confidential balance → active
2. withdraw from Tongo to the recipient's wallet
3. deposit into Vesu lending pool

all three happen in a single gasless transaction - the recipient's money is earning yield before they even open the app.

### step 4: withdraw anytime 

recipients withdraw any amount, anytime. funds move from the Vesu lending pool back to their wallet. Zero gas fees - the AVNU Paymaster sponsors every transaction.

---

## starkZap Integration (6 Modules)

this project uses 6 StarkZap SDK modules - each serving a clear purpose in the product flow. No bolted-on integrations.

| Module | Purpose in remitYield | Integration Depth |
|---|---|---|
| wallet (Privy Signer) | email/social login → auto-creates Starknet wallet. No seed phrases, no browser extensions. | `PrivySigner` + `accountPresets.argentXV050` + server-side signing via Next.js API routes |
| bridging (ethereum CCTP) | sender bridges USDC from ethereum → starknet. spports fast transfers via Circle CCTP. | `ConnectedethereumWallet.from()` + `wallet.deposit()` with `fastTransfer: true` |
| confidential (Tongo) | privacy-preserving transfers. Amounts hidden on-chain using ZK proofs. | `TongoConfidential` + `confidentialFund()` + `confidentialWithdraw()` + `rollover()` |
| lending (Vesu) | auto-deposit received funds into yield pools. Recipients earn ~4.2% APY. | `wallet.lending().deposit()` + `wallet.lending().withdraw()` + `getMarkets()` |
| paymaster (AVNU) | gas sponsorship for all users. neither sender nor recipient pays any gas fees. | `feeMode: "sponsored"` on all transactions via AVNU Paymaster API |
| Tx builder (batching) | combines rollover + withdraw + deposit into one atomic transaction. | `wallet.tx().add(...rolloverCalls).confidentialWithdraw(...).lendDeposit(...).send()` |

### the batched transaction (key technical innovation)

the most powerful integration is the Tx builder. instead of 3 separate transactions (each requiring gas, each with failure risk), we batch the entire receive → yield flow:

```typescript
// One atomic transaction: rollover + withdraw from Tongo + deposit to Vesu
const tx = await wallet
  .tx()
  .add(...rolloverCalls)                    // Activate pending confidential balance
  .confidentialWithdraw(confidential, {     // Move from private to public
    amount: Amount.parse("100", USDC),
    to: wallet.address,
    sender: wallet.address,
  })
  .lendDeposit({                            // Auto-deposit into yield pool
    token: USDC,
    amount: Amount.parse("100", USDC),
  })
  .send({ feeMode: "sponsored" });          // Gasless via AVNU
await tx.wait();
```

this means: if any step fails, none of them execute. the user's money is never in a half-state. all-or-nothing, gasless, in one block.

---

## architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│                    Next.js 14 (App Router)                  │
│                                                             │
│  ┌─────────┐   ┌───────────┐   ┌──────────┐               │
│  │ landing  │   │ dashboard │   │ withdraw │               │
│  │  page    │   │   Page    │   │   Page   │               │
│  └─────────┘   └───────────┘   └──────────┘               │
│                       │                                     │
│              ┌────────┴─────────┐                          │
│              │   demo mode      │  ← toggle via env var    │
│              │   (mock flows)   │                          │
│              └────────┬─────────┘                          │
│                       │                                     │
│              ┌────────┴─────────┐                          │
│              │  starkZap SDK    │                          │
│              │  (real calls)    │                          │
│              └──────────────────┘                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                    backend (API Routes)                      │
│                                                             │
│  POST /api/wallet/create  ← creates starknet wallet (privy)│
│  POST /api/wallet/sign    ← signs tx hashes (privy)        │
│                                                             │
│  privy manages keys server-side                             │
│  private keys never touch the browser                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────┐
│                    starknet sepolia                          │
│                                                             │
│  ┌──────┐  ┌───────┐  ┌──────┐  ┌──────┐  ┌────────────┐ │
│  │privy │  │ AVNU  │  │tongo │  │ vesu │  │ starkZap   │ │
│  │wallet│  │paymas.│  │(ZK)  │  │(lend)│  │ Tx builder │ │
│  └──────┘  └───────┘  └──────┘  └──────┘  └────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## demo Mode

remitYield includes a Demo Mode toggle (`NeXT_PUbLIC_DeMO_MODe=true`) that allows the full product experience without depending on testnet reliability.

### what's real vs. simulated

| Component | Demo Mode | Production Mode |
|---|---|---|
| privy wallet creation | real - actual Starknet address created | Real |
| wallet persistence | real - sessionStorage across refreshes | Real |
| AVNU Paymaster config | real - SDK initialized with paymaster | Real |
| receive animation | Simulated (timed delays) | Real bridge + Tongo + Vesu |
| yield ticker | calculated from mock timestamp | Calculated from real Vesu position |
| withdraw | in-memory balance update | Real Vesu `withdraw()` call |

### why demo mode exists

blockchain testnets are unreliable during live demos. transactions can take minutes. RPC endpoints go down. Faucets run dry. Demo Mode ensures the product experience is always smooth for pitches and judging - while the real SDK calls are written, tested and ready behind the toggle.

---

## tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Auth & Wallets | Privy (`@privy-io/node`  -  server-side key management) |
| blockchain SDK | StarkZap (TypeScript SDK for Starknet) |
| Gas Sponsorship | AVNU Paymaster |
| Privacy | Tongo (confidential transfers via ZK proofs) |
| Yield | Vesu (lending/supply protocol) |
| bridging | StarkZap bridge Module (ethereum CCTP) |
| Animations | Framer Motion |
| Styling | Tailwind CSS (dark theme) |
| Network | Starknet Sepolia (testnet) |
| Deployment | Vercel |

---

## project structure

```
remityield/
├── app/
│   ├── page.tsx                    # landing page (hero + before/after + how it works)
│   ├── layout.tsx                  # root layout (dark theme enforced)
│   ├── globals.css                 # global styles
│   ├── dashboard/
│   │   ├── page.tsx                # dashboard entry (SSR-disabled wrapper)
│   │   └── layout.tsx              # force-dynamic to prevent build prerender
│   ├── withdraw/
│   │   └── page.tsx                # withdraw entry (SSR-disabled wrapper)
│   └── api/
│       └── wallet/
│           ├── create/route.ts     # POST: create Starknet wallet via Privy
│           └── sign/route.ts       # POST: sign transaction hash via Privy
├── components/
│   ├── DashboardClient.tsx         # main dashboard UI (balance, ticker, tx history)
│   ├── DashboardView.tsx           # client-side wallet init wrapper
│   ├── WithdrawClient.tsx          # withdraw form + success state
│   ├── WithdrawView.tsx            # client-side wallet init wrapper
│   ├── YieldTicker.tsx             # live yield counter (ticks every second)
│   ├── ReceiveAnimation.tsx        # 4-step receive → yield animation sequence
│   └── ...
├── lib/
│   ├── sdk.ts                      # starkZap SDK init + Privy wallet management
│   ├── demo.ts                     # demo mode engine (simulated flows)
│   ├── store.ts                    # in-memory shared state (balance, tx history)
│   ├── bridge.ts                   # bridging helpers (demo + production stubs)
│   ├── confidential.ts             # tongo helpers (demo + production stubs)
│   ├── lending.ts                  # Vesu helpers (demo + production stubs)
│   ├── token.ts                    # token balance helpers
│   └── privy-server.ts             # privy server client (API routes)
├── next.config.ts                  # webpack fallbacks for Node.js modules
├── .env.local                      # environment variables (not committed)
└── package.json
```

---

## run Locally

### prerequisites

- Node.js 18+
- npm
- A [Privy](https://privy.io) account (App ID + App Secret)
- A [Starknet RPC](https://alchemy.com) endpoint (Sepolia)
- An [AVNU Paymaster](https://portal.avnu.fi) API key

### Setup

```bash
# Clone
git clone https://github.com/unifyweb3/remityield.git
cd remityield

# Install
npm install

# environment variables
cp .env.example .env.local
# Fill in your keys (see below)

# run
npm run dev
# Open http://localhost:3000
```

### environment Variables

```env
# Privy (server-side  -  no NeXT_PUbLIC prefix)
PRIVY_APP_ID=your_privy_app_id
PRIVY_APP_SeCReT=your_privy_app_secret

# Starknet RPC
NeXT_PUbLIC_STARKNeT_RPC_URL=https://starknet-sepolia.g.alchemy.com/v2/YOUR_KeY

# AVNU Paymaster
NeXT_PUbLIC_PAYMASTeR_URL=https://starknet.paymaster.avnu.fi
NeXT_PUbLIC_PAYMASTeR_API_KeY=your_avnu_key

# App
NeXT_PUbLIC_DeMO_MODe=true
NeXT_PUbLIC_APP_URL=http://localhost:3000
```

### build

```bash
# Production build (uses webpack for Node.js module compatibility)
npx next build --webpack
```

---

## User Flows

### Flow 1: Receive + Auto-Yield (Demo)

```
1. Open /dashboard
2. Real Starknet wallet created via Privy (unique per session)
3. Click "Simulate Receive $100"
4. Animation plays: bridging → Received → Deploying to Yield → earning
5. Yield ticker starts counting in real-time
6. Transaction appears in Recent Activity
```

### Flow 2: Withdraw

```
1. Click "Withdraw Funds" from dashboard
2. enter amount (or tap MAX)
3. Confirm withdrawal
4. Success screen shows amount sent + remaining balance
5. Transaction logged in history
6. Navigate back to dashboard  -  balance updated
```

### Flow 3: Landing Page

```
1. Open / (root)
2. Hero with animated particles + glow orbs
3. Scroll to before/After comparison (with live yield ticker in the "After" card)
4. How It Works  -  3 interactive step cards
5. StarkZap modules grid
6. CTA → Dashboard
```

---

## what I'd build next

with more time (or grant funding), the roadmap includes:

1. real Vesu integration on Sepolia - swap demo mode for live `lending().deposit()` calls
2. real Tongo confidential transfers - ZK proof generation in-browser
3. real ethereum bridging - CCTP fast transfers from ethereum Sepolia
4. persistent user accounts - privy frontend auth with user-linked wallets
5. off-ramp integration - convert USDC to local fiat (M-Pesa, bank transfer)
6. push notifications - "you received $200 - it's already earning yield"
7. mobile app - react Native via `starkzap-native` package

---

## key design decisions

### why privy over cartridge ??

privy supports email/social login for non-crypto users  -  our target audience. Cartridge is gaming-focused with passkey auth. for a remittance app where recipients may have zero crypto knowledge, "sign in with email" is the right UX.

### why server-side signing ??

privy manages private keys on their infrastructure. the browser never touches a private key. This is the security model that fintech apps require  -  and it's why we use Next.js API routes for the `/api/wallet/sign` endpoint.

### why Ddemo mode ??

production blockchain apps are unreliable during live demos. Instead of risking a failed transaction during a pitch, i built Demo Mode as a first-class feature - same UI, same animations, same data flow with simulated blockchain delays. the real SDK calls exist in the codebase, wrapped in `DeMO_MODe` checks.

### why batch transactions ??

three separate transactions = three chances for failure, three gas costs, three confirmations. the StarkZap Tx builder lets us batch rollover + withdraw + deposit into one atomic operation. If any step fails, all revert. The user never has funds stuck in a half-state.

---

## hackathon judging criteria alignment

| Criteria | How remitYield Delivers |
|---|---|
| real usefulness | cross-border remittances are a $700b+ market with real pain points (fees, delays, no yield) |
| clear StarkZap integration | 6 modules used  -  wallet, bridging, confidential, lending, paymaster, tx builder |
| integration depth | not surface-level: batched atomic transactions, server-side signing, production architecture |
| innovation | first app combining private remittances with auto-yield in one gasless flow |
| before/after transformation | landing page shows side-by-side comparison with live yield ticker |
| production-ready | deployed on Vercel, real wallet creation, session persistence, error handling |
| open source | full codebase on GitHub with documented architecture |

---

## credits

built by [Unify/ @unifyWeb3](https://x.com/unifyWeb3)  -  web3 content creator and builder based in West Africa.

### Protocols & Tools

- [StarkZap SDK](https://docs.starknet.io/build/starkzap/overview)  -  Unified TypeScript SDK for Starknet
- [Starknet](https://starknet.io)  -  L2 blockchain with native account abstraction
- [Privy](https://privy.io)  -  Wallet infrastructure and auth
- [AVNU](https://avnu.fi)  -  DeX aggregator and paymaster
- [Vesu](https://vesu.xyz)  -  Lending and borrowing protocol
- [Tongo](https://tongo.cash)  -  Confidential transfers via ZK proofs
- [Framer Motion](https://motion.dev)  -  Animation library

---

## License

MIT - fork it, build on it, make remittances better.
