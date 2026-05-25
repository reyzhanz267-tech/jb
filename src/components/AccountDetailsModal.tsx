/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { FreeFireAccount } from "../types";
import { X, ShieldCheck, Trophy, Sparkles, Flame, KeyRound, MonitorSmartphone, BadgeAlert, MessageCircle } from "lucide-react";

interface AccountDetailsModalProps {
  account: FreeFireAccount;
  onClose: () => void;
  onProceedToCheckout: (account: FreeFireAccount) => void;
}

export default function AccountDetailsModal({ account, onClose, onProceedToCheckout }: AccountDetailsModalProps) {
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400 border-emerald-500/30 bg-emerald-950/20";
    if (score >= 70) return "text-yellow-400 border-yellow-500/30 bg-yellow-950/20";
    return "text-red-400 border-red-500/30 bg-red-950/20";
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Modal Container */}
      <div 
        className="relative bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200"
        id={`modal-detail-${account.id}`}
      >
        {/* Banner with overlay close */}
        <div className="relative h-56 bg-neutral-950">
          <img 
            src={account.imageUrl} 
            alt={account.title} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/40 to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-neutral-950/80 hover:bg-neutral-850 text-neutral-300 border border-neutral-850 hover:text-white transition-all duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className={`text-[10px] font-bold tracking-wider uppercase bg-red-600 text-white px-2 py-0.5 rounded font-mono mb-1.5 inline-block`}>
              {account.rank} RANK
            </span>
            <h2 className="text-xl md:text-2xl font-bold font-sans text-white tracking-tight drop-shadow-md">
              {account.title}
            </h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
          
          {/* Section: AI Auditing Verification Report */}
          <div className={`border rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${getScoreColor(account.verificationScore)} shadow-[0_4px_15px_rgba(0,0,0,0.1)]`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-neutral-950 border border-neutral-800 shrink-0">
                <ShieldCheck className="w-7 h-7 text-emerald-500 animate-pulse" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold font-sans text-neutral-100 flex items-center gap-1.5 uppercase tracking-wider">
                  Sistem Audit Verifikasi Otomatis AI
                </h4>
                <p className="text-xs text-neutral-300 mt-1 font-serif italic">
                  {account.verificationDetails}
                </p>
              </div>
            </div>
            
            <div className="bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-800 text-center shrink-0 w-full md:w-auto">
              <div className="text-[9px] uppercase font-mono tracking-widest text-neutral-500">Skor Kelayakan</div>
              <div className="text-xl font-extrabold font-mono text-emerald-400 mt-0.5">
                {account.verificationScore}%
              </div>
            </div>
          </div>

          {/* Grid specifications */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-neutral-950/40 rounded-xl p-3 border border-neutral-850">
              <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Level Karakter</div>
              <div className="text-lg font-bold font-mono text-neutral-200 mt-1">LV. {account.level}</div>
            </div>
            <div className="bg-neutral-950/40 rounded-xl p-3 border border-neutral-850">
              <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Metode Login</div>
              <div className="text-lg font-bold font-sans text-neutral-200 mt-1 flex items-center gap-1">
                <MonitorSmartphone className="w-4 h-4 text-orange-400" />
                {account.loginMethod}
              </div>
            </div>
            <div className="bg-neutral-950/40 rounded-xl p-3 border border-neutral-850">
              <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Senjata Evo</div>
              <div className="text-lg font-bold font-mono text-rose-500 mt-1 flex items-center gap-1">
                <Flame className="w-4 h-4 text-rose-500" />
                {account.evoGuns} Pucuk
              </div>
            </div>
            <div className="bg-neutral-950/40 rounded-xl p-3 border border-neutral-850">
              <div className="text-[10px] uppercase font-mono text-neutral-500 tracking-wider">Win Rate Global</div>
              <div className="text-lg font-bold font-mono text-neutral-200 mt-1">{account.winRate}%</div>
            </div>
          </div>

          {/* List of elements (Characters & Skins) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Characters list */}
            <div>
              <h5 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                👤 Karakter Highlight
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {account.characters.map((item, index) => (
                  <span 
                    key={index}
                    className="text-xs px-3 py-1.5 bg-neutral-950 rounded-lg border border-neutral-850 text-neutral-300 flex items-center uppercase"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Skins list */}
            <div>
              <h5 className="text-xs uppercase font-mono tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                🔫 Skin Senjata & Bundle Langka
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {account.skins.map((item, index) => (
                  <span 
                    key={index}
                    className="text-xs px-3 py-1.5 bg-neutral-950 rounded-lg border border-neutral-850 text-orange-400 flex items-center uppercase"
                  >
                    🌟 {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Secure trade disclaimer banner */}
          <div className="bg-neutral-950/80 rounded-xl p-4 border border-neutral-800 text-xs text-neutral-400 space-y-2">
            <h6 className="font-bold text-neutral-200 uppercase tracking-wide flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-400 inline bg-emerald-950 rounded" />
              SISTEM AMAN REKBER ADMIN WA:
            </h6>
            <p className="leading-relaxed">
              Demi keamanan bersama, sistem pembayaran otomatis kini dialihkan langsung via Chat WhatsApp Admin LEDGE STORE. Admin kami akan bertindak sebagai Rekber terpercaya untuk memandu proses transfer pembayaran (E-Wallet/QRIS/Bank) dan memvalidasi keaslian data login akun Anda secara instan dan aman tingkat tinggi!
            </p>
          </div>

        </div>

        {/* Modal Footer with Action */}
        <div className="p-6 bg-neutral-950 border-t border-neutral-850 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-neutral-500 font-mono block">Grand Total Pembayaran</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">{formatRupiah(account.price)}</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button 
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-neutral-800 hover:bg-neutral-850 text-neutral-300 hover:text-white font-sans text-xs font-bold transition-colors cursor-pointer text-center"
            >
              Kembali
            </button>
            <button 
              onClick={() => onProceedToCheckout(account)}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-sans text-xs font-bold transition-all duration-300 shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_20px_rgba(16,185,129,0.4)] active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageCircle className="w-4 h-4" />
              Beli via Chat Admin (WA)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
