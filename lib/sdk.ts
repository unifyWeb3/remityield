// lib/sdk.ts
import { StarkZap, PrivySigner, accountPresets } from "starkzap";

export async function initWallet() {
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

  // Create wallet via your API route
  const res = await fetch("http://localhost:3000/api/wallet/create", { method: "POST" });
  const { wallet: privyWallet } = await res.json();

  // Create signer that calls your signing API route
  const signer = new PrivySigner({
    walletId: privyWallet.id,
    publicKey: privyWallet.publicKey,
    serverUrl: "http://localhost:3000/api/wallet/sign",
  });

  const wallet = await sdk.connectWallet({
    account: {
      signer,
      accountClass: accountPresets.argentXV050,
    },
  });

  return { sdk, wallet, address: privyWallet.address };
}