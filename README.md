remitYieldCross-border payments that earn yield the absolute second they arrive.Built in 48 Hours for the Starknet Hackathon · Future of Work Track · Powered by the StarkZap SDK on Starknet.🌐 Live Production Demo · 🐦 @unifyWeb3🛑 The Problem: Idle RemittancesEvery year, migrant workers send $700B+ in remittances back home. The current system is fundamentally broken for the receiver:Pain PointThe RealityPredatory FeesTraditional rails charge 5–10% per transfer.Friction1–3 business days for funds to arrive across borders.Zero PrivacyBanks, intermediaries, and public block explorers see every exact amount transferred.The "Idle Money" TrapOnce received, funds sit in local mobile wallets or under mattresses, earning 0% yield while losing value to inflation.A worker sends $200 home. After fees, $180 arrives days later. That $180 sits idle. The money never worked; it just waited.⚡ The Solution: Instant, Private Auto-YieldremitYield completely rethinks the receiving experience. We turn every remittance into a zero-friction, yield-generating event using Starknet account abstraction.PlaintextSender Abroad                               Recipient at Home
     │                                              │
     │  Sends 100 USDC                              │
     │  (Bridged via CCTP)                          │
     ▼                                              │
  ┌──────────────┐                                  │
  │  Starknet    │  Confidential Transfer (Tongo)   │
  │  Privacy     │  ─── amount completely hidden ──▶│
  └──────────────┘                                  │
                                                    ▼
                                         ┌──────────────────┐
                                         │ Auto-Deposited   │
                                         │ into Vesu        │
                                         │ Lending Pool     │
                                         │                  │
                                         │ Earning 4.2% APY │
                                         │ instantly        │
                                         └──────────────────┘
                                                    │
                                                    │ Withdraw Anytime
                                                    ▼
                                           Original + Yield
                                         (Zero Gas via AVNU)
The Magic Moment: The recipient doesn't need to know what a blockchain is, how to stake, or what gas fees are. The money simply arrives privately, and the yield ticker starts spinning immediately.🛠️ The Architecture (StarkZap Integration)This MVP was built to showcase the extreme power and composability of the StarkZap SDK. We implemented 6 distinct modules to handle the entire lifecycle of a cross-border transaction.1. The 6 Core ModulesModulePurpose in remitYieldImplementation DetailsWallet (Privy)Frictionless onboarding. Email/social login creates a Starknet wallet instantly. No browser extensions.PrivySigner + accountPresets.argentXV050. Keys are securely managed via Next.js server-side API routes.Bridging (Ethereum CCTP)Sender bridges USDC from L1 to L2.ConnectedEthereumWallet.from() + wallet.deposit({ fastTransfer: true }).Confidential (Tongo)Amounts are completely hidden on-chain via ZK proofs.TongoConfidential + confidentialWithdraw() + rollover().Lending (Vesu)Auto-routing funds to generate 4.2% APY.wallet.lending().deposit().Paymaster (AVNU)100% gasless experience for the recipient.feeMode: "sponsored" attached to all transactions.Tx BuilderThe true innovation. Batching complex logic into a single atomic action.See below.2. The Innovation: Atomic Batching (Tx Builder)Instead of forcing the user to sign 3 separate transactions (claiming funds -> withdrawing from privacy layer -> depositing to yield), remitYield uses StarkZap's Tx Builder to execute everything in one atomic block.TypeScript// 🏗️ ARCHITECTURE NOTE: The God-Tier Batch Transaction
const tx = await wallet
  .tx()
  .add(...rolloverCalls)                    // 1. Activate pending private balance
  .confidentialWithdraw(confidential, {     // 2. Move from private to public
    amount: Amount.parse("100", USDC),
    to: wallet.address,
    sender: wallet.address,
  })
  .lendDeposit({                            // 3. Auto-deposit into Vesu pool
    token: USDC,
    amount: Amount.parse("100", USDC),
  })
  .send({ feeMode: "sponsored" });          // 4. Fully sponsored by AVNU Paymaster

await tx.wait();
If any single step fails, the entire transaction reverts. The user's money is never stuck in a half-state.🎨 Frontend & UX EngineeringBuilt in 48 hours, the frontend is designed to feel like a premium, production-ready fintech app rather than a clunky Web3 sandbox.Global Dark Mode: Enforced #060b14 dark theme across all components for a sleek, unified aesthetic across all devices.In-Memory State Management: Custom lib/store.ts handles browser state across page navigations, ensuring simulated balances, live yield tickers, and transaction histories remain perfectly synced during the demo flow.Cache-Busted API Routes: Next.js server routes (/api/wallet/create) are configured to bypass Vercel's aggressive edge caching, guaranteeing a unique, mathematically accurate Starknet address generation for every single user session.🟡 Understanding "DEMO MODE"Live pitching blockchain applications—especially those relying on testnets, cross-chain bridges, and ZK proof generation—is notoriously risky due to network delays and RPC timeouts.To ensure a flawless evaluation experience, remitYield runs on a Demo Mode Toggle (NEXT_PUBLIC_DEMO_MODE=true).What this means:The UI, the wallet generation (Privy), and the state management are 100% real. However, the heavy blockchain network calls (bridging delays, ZK proof generation) are safely bypassed using simulated setTimeout delays.The actual, production-ready StarkZap SDK logic is fully written and documented directly beneath the Demo Mode escape hatches in the codebase (see lib/sdk.ts, lib/bridge.ts, lib/confidential.ts).🚀 Run It LocallyPrerequisites: Node.js 18+, a Privy App ID, and an Alchemy Starknet RPC.Bash# 1. Clone the repository
git clone https://github.com/unifyweb3/remityield.git
cd remityield

# 2. Install dependencies
npm install

# 3. Setup Environment Variables
cp .env.example .env.local

# 4. Add your keys to .env.local
PRIVY_APP_ID="your_privy_id"
PRIVY_APP_SECRET="your_privy_secret"
NEXT_PUBLIC_STARKNET_RPC_URL="https://starknet-sepolia.g.alchemy.com/v2/..."
NEXT_PUBLIC_DEMO_MODE="true"

# 5. Run the development server
npm run dev
💡 What's Next? (Roadmap)If developed past the MVP stage, the immediate roadmap includes:Fiat Off-Ramps: Integrating direct USDC to local fiat conversion (e.g., M-Pesa, localized bank transfers).Frontend Auth: Upgrading from server-side ephemeral wallets to persistent @privy-io/react-auth sessions so users can return to their dashboards days later.Push Notifications: Alerting users the moment their funds arrive and begin earning yield.Built by Unify | Executing ideas into reality.