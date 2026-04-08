import { DEMO_MODE } from "./demo";

export async function getConfidentialState() {
  if (DEMO_MODE) {
    return { isPrivate: true, balance: 0, pending: 100, mock: true };
  }

  // Real Tongo requires TongoConfidential with a separate private key
  // See: docs.starknet.io/build/starkzap/confidential
  throw new Error("Enable DEMO_MODE for now");
}

export async function withdrawConfidential(amount: string) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1200));
    return { success: true, mock: true };
  }

  throw new Error("Enable DEMO_MODE for now");
}