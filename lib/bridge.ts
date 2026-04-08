import { DEMO_MODE } from "./demo";
import { initWallet } from "./sdk";

export async function bridgeFunds(amount: string) {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1500));
    return { success: true, mock: true };
  }

  try {
    const { wallet } = await initWallet();
    
    // Real StarkZap bridge call
    const tx = await wallet.bridge().deposit({ amount });
    await tx.wait();
    
    return { success: true, hash: tx.hash };
  } catch (error) {
     console.error("Bridge failed:", error);
     return { success: false };
  }
}