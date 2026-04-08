// lib/bridge.ts
import { DEMO_MODE } from "./demo";

export async function bridgeFunds(wallet: any, amount: string) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return { success: true, mock: true };
  }

  // Real bridging requires a ConnectedEthereumWallet — implemented in Phase 4
  // See: https://docs.starknet.io/build/starkzap/bridging
  throw new Error("Real bridging not yet implemented — enable DEMO_MODE");
}