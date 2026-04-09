import { NextResponse } from "next/server";
import { privy } from "@/lib/privy-server";

export async function POST() {
  try {
    const wallet = await privy.wallets().create({
      chain_type: "starknet",
    });

    const response = NextResponse.json({
      wallet: {
        id: wallet.id,
        address: wallet.address,
        publicKey: wallet.public_key,
      },
    });

    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}