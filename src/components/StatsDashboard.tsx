/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { ShieldCheck, Zap, TrendingUp, Users, Activity } from "lucide-react";

export default function StatsDashboard() {
  const [onlineUsers, setOnlineUsers] = useState(142);
  const [transactions, setTransactions] = useState<Array<{ id: string; user: string; type: string; price: string; time: string }>>([
    { id: "tx-1", user: "Gamer_Sunda", type: "Membeli Akun Old S2", price: "Rp 1.200.000", time: "Baru saja" },
    { id: "tx-2", user: "FF_Hoki", type: "Menjual Akun Level 58 (Terverifikasi AI)", price: "Rp 150.000", time: "3 menit yang lalu" },
    { id: "tx-3", user: "Prowler9x", type: "Membeli Akun Evo Max", price: "Rp 450.000", time: "8 menit yang lalu" },
  ]);

  // Simulate slow updates to users online and live activity log
  useEffect(() => {
    const userInterval = setInterval(() => {
      setOnlineUsers(prev => prev + Math.floor(Math.random() * 5) - 2);
    }, 5000);

    const txInterval = setInterval(() => {
      const names = ["Letda_Fans", "Dyland_Pro", "Ruok_FF", "Aura_Kir", "Sultan_Sg2", "Kopral_Jono"];
      const types = ["Membeli Akun Diamond III", "Menjual Akun Gold (Terverifikasi AI)", "Membeli Akun Elite Pass S5", "Membeli Akun Evo Max"];
      const prices = ["Rp 250.000", "Rp 90.000", "Rp 1.100.000", "Rp 450.000"];
      
      const randomName = names[Math.floor(Math.random() * names.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];
      const randomPrice = prices[Math.floor(Math.random() * prices.length)];

      setTransactions(prev => [
        {
          id: `tx-${Date.now()}`,
          user: randomName,
          type: randomType,
          price: randomPrice,
          time: "Baru saja"
        },
        ...prev.slice(0, 3)
      ]);
    }, 12000);

    return () => {
      clearInterval(userInterval);
      clearInterval(txInterval);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      {/* KPI 1 */}
      <div className="bg-neutral-900 border border-red-500/20 rounded-xl p-4 flex items-center gap-4 shadow-lg hover:border-red-500/40 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-red-950 flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-neutral-400 font-sans">Garansi Aman</div>
          <div className="text-xl font-bold text-neutral-100 font-sans">100% Anti-Hackback</div>
        </div>
      </div>

      {/* KPI 2 */}
      <div className="bg-neutral-900 border border-orange-500/20 rounded-xl p-4 flex items-center gap-4 shadow-lg hover:border-orange-500/40 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-orange-950 flex items-center justify-center text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-neutral-400 font-sans">Audit AI Instan</div>
          <div className="text-xl font-bold text-neutral-100 font-sans">~1.5 Detik Verifikasi</div>
        </div>
      </div>

      {/* KPI 3 */}
      <div className="bg-neutral-900 border border-yellow-500/20 rounded-xl p-4 flex items-center gap-4 shadow-lg hover:border-yellow-500/40 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-yellow-950 flex items-center justify-center text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.2)]">
          <Users className="w-6 h-6" />
        </div>
        <div>
          <div className="text-sm text-neutral-400 font-sans">Gamers Aktif</div>
          <div className="text-xl font-bold text-neutral-100 font-sans">{onlineUsers} Online</div>
        </div>
      </div>

      {/* KPI 4: Live Activity Feed */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 shadow-lg md:col-span-1 col-span-1 h-[78px] overflow-hidden relative">
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-red-950 border border-red-500/30">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider font-mono">Live</span>
        </div>
        <div className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1 flex items-center gap-1 font-mono">
          <Activity className="w-3.5 h-3.5 text-red-500" />
          Aktivitas Pasar
        </div>
        <div className="h-[40px] overflow-hidden">
          {transactions.slice(0, 1).map((tx) => (
            <div key={tx.id} className="text-xs transition-transform duration-500 translate-y-0">
              <span className="font-bold text-red-400 font-sans hover:underline cursor-pointer">{tx.user}</span>{" "}
              <span className="text-neutral-300 font-sans">{tx.type}</span>{" "}
              <span className="text-emerald-400 font-mono font-bold">({tx.price})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
