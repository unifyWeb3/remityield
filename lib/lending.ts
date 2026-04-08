import { DEMO_MODE } from "./demo";

export async function getRealVesuApy(): Promise<number> {
  if (DEMO_MODE) {
    return 4.2;
  }

  try {
    const { initWallet } = await import("./sdk");
    const { wallet } = await initWallet();
    const markets = await wallet.lending().getMarkets();

    if (markets && markets.length > 0) {
      const stats = (markets[0] as any).stats;
      return stats?.supplyApy ? Number(stats.supplyApy) * 100 : 4.2;
    }

    return 4.2;
  } catch (error) {
    console.error("Failed to fetch Vesu APY:", error);
    return 4.2;
  }
}

export async function depositToYield(amount: string) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1200));
    return { success: true, mock: true };
  }

  try {
    const { initWallet } = await import("./sdk");
    const { wallet } = await initWallet();

    const tx = await (wallet.lending() as any).deposit(
      { token: amount, amount },
      { feeMode: "sponsored" }
    );
    await tx.wait();
    return { success: true, hash: tx.hash };
  } catch (error) {
    console.error("Vesu deposit failed:", error);
    return { success: false, error: "Transaction failed" };
  }
}