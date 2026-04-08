// app/api/wallet/sign/route.ts
import { NextResponse } from "next/server";
import { privy } from "@/lib/privy-server";

export async function POST(req: Request) {
  const { walletId, hash } = await req.json();

  if (!walletId || !hash) {
    return NextResponse.json(
      { error: "walletId and hash required" },
      { status: 400 }
    );
  }

  try {
    const result = await privy.wallets().rawSign(walletId, {
      params: { hash },
    });
    return NextResponse.json({ signature: result.signature });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}