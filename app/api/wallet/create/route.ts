// app/api/wallet/create/route.ts
import { NextResponse } from "next/server";
import { privy } from "@/lib/privy-server";

export async function POST(req: Request) {
  try {
    const wallet = await privy.wallets().create({
      chain_type: "starknet",
      // No user_id = server-managed wallet (simpler for hackathon)
    });

    return NextResponse.json({
      wallet: {
        id: wallet.id,
        address: wallet.address,
        publicKey: wallet.public_key,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}