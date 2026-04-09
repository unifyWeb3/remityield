"use client";

import { useState, useEffect } from "react";
import { DEMO_MODE, simulateReceiveFlow } from "@/lib/demo";
import { store } from "@/lib/store";
import ReceiveAnimation from "./ReceiveAnimation";
import YieldTicker from "./YieldTicker";
import Link from "next/link";

interface DashboardClientProps {
  address: string;
}

export default function DashboardClient({ address }: DashboardClientProps) {
  const [step, setStep] = useState<string>(store.hasReceived ? "earning" : "idle");
  const [balance, setBalance] = useState<number>(store.balance);
  const [depositTime, setDepositTime] = useState<number>(store.depositTime);
  const [isSimulating, setIsSimulating] = useState(false);

  // Sync earned yield back to store periodically
  useEffect(() => {
    if (step !== "earning" || !depositTime) return;
    const rate = (balance * 0.042) / (365 * 24 * 60 * 60);
    const interval = setInterval(() => {
      const elapsed = (Date.now() - depositTime) / 1000;
      store.earned = rate * elapsed;
    }, 1000);
    return () => clearInterval(interval);
  }, [step, balance, depositTime]);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setBalance(0);

    const result = await simulateReceiveFlow((newStep) => {
      setStep(newStep);
    });

    // Update store
    store.balance = result.balance;
    store.depositTime = result.depositTimestamp;
    store.hasReceived = true;
    store.addTransaction({
      type: "receive",
      amount: result.balance,
      timestamp: result.depositTimestamp,
      status: "complete",
    });

    setBalance(result.balance);
    setDepositTime(result.depositTimestamp);
    setIsSimulating(false);
  };

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="max-w-md mx-auto mt-12 space-y-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight text-white">remitYield</h1>
        {DEMO_MODE && (
          <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/20">
            🟡 DEMO MODE
          </span>
        )}
      </div>

      {/* Wallet Address */}
      <div className="px-4 py-3 bg-[#0c1322] border border-[#1a2540] rounded-xl flex justify-between items-center shadow-lg">
        <span className="text-slate-400 text-sm">Starknet Address</span>
        <span className="font-mono text-emerald-400 text-sm bg-emerald-400/10 px-2 py-1 rounded">
          {shortAddress}
        </span>
      </div>

      {/* Main Display — dark card wrapper */}
      <div className="rounded-2xl bg-[#0c1322] border border-[#1a2540] p-6 shadow-xl min-h-[200px] flex flex-col justify-center">
        {step === "idle" && (
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-500 font-mono mb-2">$0.00</div>
            <p className="text-slate-500 text-sm">Waiting for incoming funds...</p>
          </div>
        )}

        {step !== "idle" && step !== "earning" && (
          <ReceiveAnimation currentStep={step} />
        )}

        {step === "earning" && (
          <YieldTicker principal={balance} apyPercent={4.2} startTime={depositTime} />
        )}
      </div>

      {/* Transaction History */}
      {store.transactions.length > 0 && (
        <div className="rounded-2xl bg-[#0c1322] border border-[#1a2540] p-5 shadow-xl space-y-3">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Recent Activity</h3>
          {store.transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="flex justify-between items-center py-2 border-b border-[#1a2540] last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-lg">
                  {tx.type === "receive" ? "💸" : tx.type === "withdraw" ? "📤" : "📈"}
                </span>
                <div>
                  <div className="text-sm font-medium text-white capitalize">{tx.type}</div>
                  <div className="text-[11px] text-slate-500">
                    {new Date(tx.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <span className={`text-sm font-mono font-semibold ${
                tx.type === "receive" ? "text-emerald-400" : "text-red-400"
              }`}>
                {tx.type === "receive" ? "+" : "-"}${tx.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3 pb-8">
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
        >
          {isSimulating ? "Processing..." : "▶ Simulate Receive $100"}
        </button>

        <Link href={step === "earning" ? "/withdraw" : "#"}>
          <button
            disabled={step !== "earning"}
            className="w-full bg-[#0c1322] hover:bg-[#131d35] text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-[#1a2540] mt-3 cursor-pointer"
          >
            Withdraw Funds
          </button>
        </Link>
      </div>
    </div>
  );
}