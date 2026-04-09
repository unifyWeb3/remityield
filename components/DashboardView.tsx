"use client";

import { useState, useEffect } from "react";
import { store } from "@/lib/store";
import DashboardClient from "@/components/DashboardClient";

export default function DashboardView() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have an address from this session, reuse it
    if (store.walletAddress) {
      setAddress(store.walletAddress);
      return;
    }

    import("@/lib/sdk").then(({ initWallet }) => {
      initWallet()
        .then(({ address }) => {
          store.walletAddress = address; // save for other pages
          setAddress(address);
        })
        .catch((err) => setError(err.message));
    });
  }, []);

  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!address) return <p className="text-center mt-20 text-slate-400">Connecting wallet...</p>;

  return <DashboardClient address={address} />;
}