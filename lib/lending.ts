import { DEMO_MODE } from "./demo";

export async function getRealVesuApy(): Promise<{ apy: number; isLive: boolean }> {
  // Vesu lending module not available on browser-side wallet in current SDK version
  // Architecture is ready — see docs.starknet.io/build/starkzap/lending
  return { apy: 4.2, isLive: false };
}

export async function depositToYield(amount: string) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1200));
    return { success: true, mock: true };
  }
  throw new Error("Enable DEMO_MODE for now");
}