"use client";

import { useState } from "react";
import { DEMO_MODE } from "@/lib/demo";
import { store } from "@/lib/store";
import Link from "next/link";

interface WithdrawClientProps {
  address: string;
  balance: number;
  earned: number;
}

export default function WithdrawClient({
  address,
  balance,
  earned,
}: WithdrawClientProps) {
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<
    "idle" | "processing" | "success" | "error"
  >("idle");
  const [currentBalance, setCurrentBalance] = useState(balance);
  const [currentEarned, setCurrentEarned] = useState(earned);
  const [copied, setCopied] = useState(false);

  const totalBalance = currentBalance + currentEarned;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > totalBalance)
      return;

    setStatus("processing");

    if (DEMO_MODE) {
      await new Promise((r) => setTimeout(r, 2000));

      // Update store
      store.withdraw(withdrawAmount);
      setCurrentBalance(store.balance);
      setCurrentEarned(0);
      store.earned = 0;

      setStatus("success");
      return;
    }

    try {
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const handleMax = () => {
    setAmount(totalBalance.toFixed(2));
  };

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="max-w-md mx-auto mt-12 space-y-6 px-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link href="/dashboard">
            <button className="w-9 h-9 rounded-xl bg-[#0c1322] hover:bg-[#131d35] border border-[#1a2540] flex items-center justify-center transition-all active:scale-95 cursor-pointer">
              <span className="text-slate-400 text-lg">←</span>
            </button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Withdraw
          </h1>
        </div>
        {DEMO_MODE && (
          <span className="px-2 py-1 bg-amber-500/10 text-amber-500 text-xs font-bold rounded-full border border-amber-500/20">
            🟡 DEMO
          </span>
        )}
      </div>

      {/* Balance Card */}
      <div className="rounded-2xl p-6 border border-[#1a2540] bg-[#0c1322] shadow-xl space-y-4">
        <div className="text-sm text-slate-400">Available to withdraw</div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-bold font-mono text-white">
            ${totalBalance.toFixed(2)}
          </span>
          <span className="text-sm text-slate-500">USDC</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Principal</span>
          <span className="text-slate-300 font-mono">
            ${currentBalance.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-slate-500">Yield earned</span>
          <span className="text-emerald-400 font-mono">
            +${currentEarned.toFixed(7)}
          </span>
        </div>
      </div>

      {/* Success State */}
      {status === "success" && (
        <div className="rounded-2xl p-6 border border-emerald-500/20 bg-[#0c1322] shadow-xl text-center space-y-3">
          <div className="text-4xl">✅</div>
          <div className="text-lg font-semibold text-emerald-400">
            Withdrawal Complete
          </div>
          <div className="text-sm text-slate-400">
            ${parseFloat(amount).toFixed(2)} USDC sent to {shortAddress}
          </div>
          <div className="text-xs text-slate-500">
            Zero gas fees · Powered by AVNU Paymaster
          </div>
          <div className="text-xs text-slate-600 font-mono mt-2">
            Remaining: ${store.balance.toFixed(2)} USDC
          </div>
          <Link href="/dashboard">
            <button className="mt-3 px-6 py-3 rounded-xl bg-[#131d35] hover:bg-[#1a2540] border border-[#1a2540] text-white text-sm font-semibold transition-all cursor-pointer">
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      )}

      {/* Withdraw Form */}
      {status !== "success" && (
        <>
          <div className="space-y-2">
            <label className="text-sm text-slate-400">Amount to withdraw</label>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={status === "processing"}
                className="w-full bg-[#0c1322] border border-[#1a2540] rounded-xl px-4 py-4 pr-20 text-xl font-mono text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
              />
              <button
                onClick={handleMax}
                disabled={status === "processing"}
                className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                MAX
              </button>
            </div>
            {parseFloat(amount) > totalBalance && (
              <p className="text-xs text-red-400">Exceeds available balance</p>
            )}
          </div>

          <div
            onClick={handleCopy}
            className="px-4 py-3 bg-[#0c1322] border border-[#1a2540] rounded-xl flex justify-between items-center cursor-pointer hover:border-emerald-500/30 transition-all active:scale-[0.99]"
            title="click to copy full address"
          >
            <span className="text-sm text-slate-400">My Wallet</span>
            <span className="font-mono text-emerald-400 text-xs bg-emerald-400/10 px-2 py-1 rounded">
              {copied ? "✓ Copied!" : shortAddress}
            </span>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="text-xs text-slate-500">Network fee</span>
            <span className="text-xs text-emerald-400 font-semibold">
              $0.00 (gasless)
            </span>
          </div>

          <button
            onClick={handleWithdraw}
            disabled={
              status === "processing" ||
              !amount ||
              parseFloat(amount) <= 0 ||
              parseFloat(amount) > totalBalance
            }
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
          >
            {status === "processing" ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              "Withdraw"
            )}
          </button>

          {status === "error" && (
            <p className="text-sm text-red-400 text-center">
              Withdrawal failed. Please try again.
            </p>
          )}
        </>
      )}
    </div>
  );
}
