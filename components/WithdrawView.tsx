"use client";

import { useState, useEffect } from "react";
import WithdrawClient from "@/components/WithdrawClient";

export default function WithdrawView() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    import("@/lib/sdk").then(({ initWallet }) => {
      initWallet()
        .then(({ address }) => setAddress(address))
        .catch((err) => setError(err.message));
    });
  }, []);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!address) return <p className="text-center mt-20 text-slate-400">Connecting wallet...</p>;

  return <WithdrawClient address={address} balance={100} earned={0.0000137} />;
}