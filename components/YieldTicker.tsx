// components/YieldTicker.tsx
"use client";

import { useState, useEffect } from "react";

interface YieldTickerProps {
  principal: number;
  apyPercent: number;
  startTime: number;
}

export default function YieldTicker({ principal, apyPercent, startTime }: YieldTickerProps) {
  const [earned, setEarned] = useState(0);

  useEffect(() => {
    const ratePerSecond = (principal * (apyPercent / 100)) / (365 * 24 * 60 * 60);

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setEarned(ratePerSecond * elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [principal, apyPercent, startTime]);

  return (
    <div className="text-center space-y-3">
      <div className="text-5xl font-bold font-mono text-white tracking-tight">
        ${principal.toFixed(2)}
      </div>
      <div className="text-sm text-slate-400">earning {apyPercent}% APY</div>
      <div
        className="text-2xl font-mono font-semibold text-emerald-400 transition-colors duration-150"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        +${earned.toFixed(7)}
      </div>
      <div className="text-xs text-emerald-400/60">earned and counting</div>
    </div>
  );
}