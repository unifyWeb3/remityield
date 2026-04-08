import { DEMO_MODE } from "./demo";

export async function getRealBalance(): Promise<number> {
  if (DEMO_MODE) {
    return 0;
  }

  try {
    const { initWallet } = await import("./sdk");
    const { wallet } = await initWallet();
    const balance = await (wallet as any).balanceOf(
      "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
    ).catch(() => 0);
    return Number(balance) / 1e18;
  } catch {
    return 0;
  }
}