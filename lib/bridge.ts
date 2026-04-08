import { DEMO_MODE } from "./demo";

export async function bridgeFunds(amount: string) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return { success: true, mock: true };
  }

  // Real bridging implemented in Phase 4
  // Requires ConnectedEthereumWallet — see docs.starknet.io/build/starkzap/bridging
  console.warn("Real L1->L2 bridging requires an active MetaMask connection. Please enable DEMO_MODE.");
  return { success: false, error: "L1 Wallet Required" };
  // throw new Error("Enable DEMO_MODE for now");
}