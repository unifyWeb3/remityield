import { initWallet } from "./sdk";
import { DEMO_MODE } from "./demo";

// The testnet USDC address from Tongo/StarkZap docs
const USDC_ADDRESS = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"; 

export async function getRealVesuApy(): Promise<number> {
  try {
    const { wallet } = await initWallet();
    
    // Call the real StarkZap SDK method
    const markets = await wallet.lending().getMarkets();
    
    if (markets && markets.length > 0) {
      // Assuming the first market is USDC, return its supply APY
      // Multiplied by 100 to convert 0.042 to 4.2%
      return Number(markets[0].supplyApy) * 100; 
    }
    
    return 4.2; // Fallback if market is empty
  } catch (error) {
    console.error("Failed to fetch live Vesu APY:", error);
    return 4.2; // Fallback to our demo rate if the RPC fails
  }
}

export async function depositToYield(amount: string) {
  // THE SAFETY NET
  if (DEMO_MODE) {
    await new Promise((r) => setTimeout(r, 1200)); // Fake network delay
    return { success: true, mock: true, hash: "0xmock...hash" };
  }

  // THE REAL INTEGRATION
  try {
    const { wallet } = await initWallet();
    
    // Using StarkZap Tx Builder + Vesu integration
    const tx = await wallet.lending().deposit(
      { token: USDC_ADDRESS, amount: amount },
      { feeMode: "sponsored" } // AVNU Gasless!
    );
    
    await tx.wait(); // Wait for Starknet confirmation
    return { success: true, hash: tx.hash };
  } catch (error) {
    console.error("Vesu Deposit failed:", error);
    return { success: false, error: "Transaction failed" };
  }
}