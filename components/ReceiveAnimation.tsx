"use client";

import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { key: "bridging", text: "Bridging funds from Ethereum...", icon: "🌉" },
  { key: "received", text: "$100 USDC received!", icon: "💸" },
  { key: "deploying", text: "Deploying confidentially to yield...", icon: "⚡" },
  { key: "earning", text: "Now earning 4.2% APY", icon: "📈" },
];

export default function ReceiveAnimation({ currentStep }: { currentStep: string }) {
  const step = steps.find((s) => s.key === currentStep);
  
  if (!step) return null;

  return (
    <div className="h-32 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={step.key}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <div className="text-4xl mb-3">{step.icon}</div>
          <p className="text-lg font-medium text-emerald-400 tracking-wide">{step.text}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}