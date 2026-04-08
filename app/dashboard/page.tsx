import { initWallet } from "@/lib/sdk";
import DashboardClient from "@/components/DashboardClient";
import { getRealVesuApy } from "@/lib/lending";
import { getRealBalance } from "@/lib/token"; // <-- 1. Add this import
import { DEMO_MODE } from "@/lib/demo";

export default async function DashboardPage() {
  const { address } = await initWallet();
  
  const apy = DEMO_MODE ? 4.2 : await getRealVesuApy();
  
  // 2. Fetch the real balance!
  const liveBalance = DEMO_MODE ? 0 : await getRealBalance();

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans p-4">
      {/* 3. Pass the balance into the client */}
      <DashboardClient address={address} initialApy={apy} initialBalance={liveBalance} />
    </main>
  );
}