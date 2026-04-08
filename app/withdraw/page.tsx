"use client";

import dynamic from "next/dynamic";

const WithdrawView = dynamic(() => import("@/components/WithdrawView"), {
  ssr: false,
});

export default function WithdrawPage() {
  return <WithdrawView />;
}