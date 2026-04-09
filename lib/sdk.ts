import { StarkZap, PrivySigner, accountPresets } from "starkzap";
import { DEMO_MODE } from "./demo";

function getBaseUrl() {
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

const WALLET_STORAGE_KEY = "remityield_wallet";

function getSavedWallet() {
  try {
    const saved = sessionStorage.getItem(WALLET_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function saveWallet(wallet: { id: string; address: string; publicKey: string }) {
  try {
    sessionStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
  } catch {}
}

export async function initWallet() {
  const baseUrl = getBaseUrl();

  // Always create a real Privy wallet — even in demo mode
  // This gives every user a unique real Starknet address
  let privyWallet = getSavedWallet();

  if (!privyWallet) {
    try {
      const res = await fetch(`${baseUrl}/api/wallet/create`, { method: "POST" });
      if (!res.ok) throw new Error("API route failed");
      const data = await res.json();
      privyWallet = data.wallet;
      saveWallet(privyWallet);
    } catch (error) {
      console.error("Wallet creation failed:", error);
      return {
        sdk: {} as any,
        wallet: {} as any,
        address: "0x0000...wallet_unavailable",
      };
    }
  }

  // In demo mode, skip SDK connection but return the real address
  if (DEMO_MODE) {
    return {
      sdk: {} as any,
      wallet: {} as any,
      address: privyWallet.address,
    };
  }

  // Full SDK connection for real blockchain calls
  try {
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
    console.error("SDK connection failed:", error);
    return { sdk: {} as any, wallet: {} as any, address: privyWallet.address };
  }
}