import { StarkZap, PrivySigner, accountPresets } from "starkzap";
import { DEMO_MODE } from "./demo";

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function initWallet() {
  // 1. THE SAFETY NET (Bypasses Vercel fetch errors completely for the demo)
  if (DEMO_MODE) {
    return {
      sdk: {} as any,
      wallet: {} as any,
      address: "0x054d3c92...44c4" // Sleek mock address for the UI
    };
  }

  // 2. THE REAL ARCHITECTURE (Claude's precise StarkZap implementation)
  try {
    const baseUrl = getBaseUrl();

    const sdk = new StarkZap({
      network: "sepolia",
      rpcUrl: process.env.NEXT_PUBLIC_STARKNET_RPC_URL,
      paymaster: {
        nodeUrl: process.env.NEXT_PUBLIC_PAYMASTER_URL!,
        headers: {
          "x-paymaster-api-key": process.env.NEXT_PUBLIC_PAYMASTER_API_KEY!,
        },
      },
    });

    const res = await fetch(`${baseUrl}/api/wallet/create`, { method: "POST" });
    if (!res.ok) throw new Error("API Route Failed");
    
    const { wallet: privyWallet } = await res.json();

    const signer = new PrivySigner({
      walletId: privyWallet.id,
      publicKey: privyWallet.publicKey,
      serverUrl: `${baseUrl}/api/wallet/sign`,
    });

    const wallet = await sdk.connectWallet({
      account: {
        signer,
        accountClass: accountPresets.argentXV050,
      },
    });

    return { sdk, wallet, address: privyWallet.address };
  } catch (error) {
    console.error("Wallet SDK Error:", error);
    // Safe fallback so the UI never crashes
    return { sdk: {} as any, wallet: {} as any, address: "0x0000...0000" };
  }
}