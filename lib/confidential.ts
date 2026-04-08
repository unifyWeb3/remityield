import { DEMO_MODE } from "./demo";
import { initWallet } from "./sdk";

export async function getConfidentialState() {
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 800));
    return { isPrivate: true, hiddenBalance: 100, mock: true };
  }

  try {
    const { wallet } = await initWallet();
    
    // Real Tongo SDK initialization
    const tongo = await wallet.confidential();
    const state = await tongo.getState();
    
    return { isPrivate: true, state, mock: false };
  } catch (error) {
     console.error("Tongo read failed:", error);
     return { isPrivate: false, error: "Tongo SDK failed" };
  }
}