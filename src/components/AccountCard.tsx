/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FreeFireAccount } from "../types";
import { ShieldAlert, ShieldCheck, Trophy, Sparkles, Flame, Coins } from "lucide-react";

interface AccountCardProps {
  key?: string;
  account: FreeFireAccount;
  onSelect: (account: FreeFireAccount) => void;
}

export default function AccountCard({ account, onSelect }: AccountCardProps) {
  // Indonesian Currency Formatter helper
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getRankBadgeStyles = (rank: string) => {
    const r = rank.toLowerCase();
    if (r.includes("grandmaster")) {
      return "bg-gradient-to-r from-red-600 to-amber-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]";
    }
    if (r.includes("heroic")) {
      return "bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-[0_0_10px_rgba(220,38,38,0.3)]";
    }
    if (r.includes("diamond")) {
      return "bg-gradient-to-r from-blue-600 to-cyan-500 text-white";
    }
    return "bg-neutral-800 text-neutral-300";
  };

  return (
    <div 
      className="group bg-neutral-900/90 border border-neutral-800 rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:-translate-y-1.5 hover:border-red-500/50 hover:shadow-[0_10px_25px_-5px_rgba(239,68,68,0.15)] flex flex-col justify-between"
      id={`ff-card-${account.id}`}
    >
      {/* Visual Header Banner */}
      <div className="relative h-44 overflow-hidden bg-neutral-950">
        <img 
          src={account.imageUrl} 
          alt={account.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />
        
        {/* Rank Banner Badge */}
        <div className="absolute top-3 left-3 flex gap-2">
          <span className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md flex items-center gap-1 font-mono ${getRankBadgeStyles(account.rank)}`}>
            <Trophy className="w-3 h-3" />
            {account.rank}
          </span>
        </div>

        {/* Elite Pass Indicator */}
        {account.hasElitePass && (
          <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-yellow-500 text-neutral-950 px-2 py-0.5 rounded-md flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" />
            Elite Pass
          </span>
        )}

        {/* Level Indicator Badge */}
        <div className="absolute bottom-3 left-3 bg-neutral-950/80 backdrop-blur-md px-2 py-1 rounded border border-neutral-800 text-white font-mono text-xs font-bold">
          LV. {account.level}
        </div>

        {/* Verification Status Banner Overlay */}
        {account.verified ? (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-emerald-950/90 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-md tracking-wider font-mono uppercase shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Terverifikasi AI ({account.verificationScore}%)
          </div>
        ) : (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-amber-950/90 backdrop-blur-md border border-amber-500/40 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-md tracking-wider font-mono uppercase">
            <ShieldAlert className="w-3.5 h-3.5" />
            Menunggu Review
          </div>
        )}
      </div>

      {/* Account Info Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-sans font-bold text-neutral-100 text-base line-clamp-1 group-hover:text-red-400 transition-colors duration-200">
            {account.title}
          </h3>
          <p className="text-xs text-neutral-400 mt-1 font-mono flex items-center gap-1">
            Penjual: <span className="text-neutral-300 font-sans hover:underline">{account.sellerName}</span>
          </p>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="bg-neutral-950/50 rounded-lg p-2 border border-neutral-850 text-center">
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Win Rate</div>
              <div className="text-xs font-bold text-neutral-200 font-mono mt-0.5">{account.winRate}%</div>
            </div>
            <div className="bg-neutral-950/50 rounded-lg p-2 border border-neutral-850 text-center">
              <div className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Guns Evo</div>
              <div className="text-xs font-bold text-rose-500 font-mono mt-0.5 flex justify-center items-center gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-rose-500 animate-pulse" />
                {account.evoGuns} Evo
              </div>
            </div>
          </div>

          {/* Highlights labels */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {account.characters.slice(0, 2).map((char, index) => (
              <span key={index} className="text-[10px] bg-red-950/30 text-red-400 border border-red-900/30 px-2 py-0.5 rounded font-sans">
                👤 {char}
              </span>
            ))}
            {account.skins.slice(0, 1).map((skin, index) => (
              <span key={index} className="text-[10px] bg-blue-950/30 text-blue-400 border border-blue-900/30 px-2 py-0.5 rounded font-sans truncate max-w-[130px]">
                🔥 {skin}
              </span>
            ))}
            {account.skins.length > 1 && (
              <span className="text-[10px] text-neutral-500 px-1 py-0.5 font-mono">
                +{account.skins.length - 1} item
              </span>
            )}
          </div>
        </div>

        {/* Pricing Section & Purchase CTA */}
        <div className="mt-5 pt-3 border-t border-neutral-800 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-neutral-500 font-mono uppercase block tracking-wider leading-none">Harga</span>
            <span className="text-lg font-bold font-mono text-emerald-400">{formatRupiah(account.price)}</span>
          </div>

          <button 
            onClick={() => onSelect(account)}
            className="px-4 py-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white text-xs font-bold font-sans rounded-xl transition-all duration-300 flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
          >
            <Coins className="w-3.5 h-3.5" />
            Beli Sekarang
          </button>
        </div>
      </div>
    </div>
  );
}
