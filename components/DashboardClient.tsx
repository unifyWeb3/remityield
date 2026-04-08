"use client";

import { useState } from "react";
import { DEMO_MODE, simulateReceiveFlow } from "@/lib/demo";
import ReceiveAnimation from "./ReceiveAnimation";
import YieldTicker from "./YieldTicker";

interface DashboardClientProps {
  address: string;
}

export default function DashboardClient({ address }: DashboardClientProps) {
  const [step, setStep] = useState<string>("idle");
  const [balance, setBalance] = useState<number>(0);
  const [depositTime, setDepositTime] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleSimulate = async () => {
    setIsSimulating(true);
    setBalance(0);

    const result = await simulateReceiveFlow((newStep) => {
      setStep(newStep);
    });

    setBalance(result.balance);
    setDepositTime(result.depositTimestamp);
    setIsSimulating(false);
  };

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="max-w-md mx-auto mt-12 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">remitYield</h1>
        {DEMO_MODE && (
          <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/20">
            🟡 DEMO MODE
          </span>
        )}
      </div>

      <div className="px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center shadow-sm">
        <span className="text-slate-400 text-sm">Starknet Address</span>
        <span className="font-mono text-emerald-400 text-sm bg-emerald-400/10 px-2 py-1 rounded">
          {shortAddress}
        </span>
      </div>

      <div className="min-h-[200px] flex flex-col justify-center">
        {step === "idle" && (
          <div className="text-center">
            <div className="text-5xl font-bold text-slate-700 font-mono mb-2">$0.00</div>
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

      <div className="pt-8 space-y-3">
        <button
          onClick={handleSimulate}
          disabled={isSimulating}
          className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          {isSimulating ? "Processing..." : "▶ Simulate Receive $100"}
        </button>

        <button
          disabled={step !== "earning"}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-4 rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Withdraw Funds
        </button>
      </div>
    </div>
  );
}