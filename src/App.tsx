/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { FreeFireAccount, PaymentDetails } from "./types";
import AccountCard from "./components/AccountCard";
import AccountDetailsModal from "./components/AccountDetailsModal";
import StatsDashboard from "./components/StatsDashboard";
import TestimonialsSection from "./components/TestimonialsSection";
import { 
  ShieldCheck, 
  ShieldAlert,
  Search, 
  Flame, 
  Trophy, 
  Sparkles, 
  Plus, 
  Coins, 
  Clock, 
  CreditCard, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw, 
  Key, 
  Lock, 
  X, 
  Copy, 
  Check, 
  Image as ImageIcon,
  Activity,
  Server,
  HelpCircle,
  QrCode,
  MessageCircle
} from "lucide-react";

// Pre-defined sample screenshots of popular Free Fire accounts to let users verify Gemini computer-vision auditing easily
const SAMPLE_SCREENSHOTS = [
  {
    name: "Sultan Elite Grandmaster Profile",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    description: "Akun Grandmaster veteran, level tinggi, baju kobra legendaris terdeteksi.",
    level: 75,
    rank: "Grandmaster",
    elitePass: true,
    skins: ["SG2 Underworld", "Celana Angel", "M1014 Draco Max"],
    characters: ["Alok", "Chrono", "K"]
  },
  {
    name: "Heroic Gold Rush Vault",
    url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    description: "Akun kompetitif Heroic, koleksi skin senjata MP40 Cobra aktif.",
    level: 58,
    rank: "Heroic",
    elitePass: false,
    skins: ["MP40 Cobra Level 4", "Megalodon Scar"],
    characters: ["Alok", "Wukong"]
  },
  {
    name: "Newbie Rookie Starter Account",
    url: "https://images.unsplash.com/photo-1553481187-be93c21490a9?auto=format&fit=crop&q=80&w=800",
    description: "Tingkat level 12 (terlalu rendah), tanda peringatan AI keamanan terpasang.",
    level: 12,
    rank: "Diamond I",
    elitePass: false,
    skins: ["SG2 Standar"],
    characters: ["Kelly"]
  }
];

export default function App() {
  // State definitions
  const [accounts, setAccounts] = useState<FreeFireAccount[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [systemActive, setSystemActive] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<FreeFireAccount | null>(null);
  const [checkoutAccount, setCheckoutAccount] = useState<FreeFireAccount | null>(null);
  const [activePayment, setActivePayment] = useState<PaymentDetails | null>(null);
  const [checkoutMethod, setCheckoutMethod] = useState<'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'DANA'>('QRIS');
  const [phoneNo, setPhoneNo] = useState<string>("");
  const [paymentComplete, setPaymentComplete] = useState<boolean>(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [credentialsRevealed, setCredentialsRevealed] = useState<any>(null);
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState<number>(900); // 15 mins in seconds

  // Filter States
  const [search, setSearch] = useState<string>("");
  const [rankFilter, setRankFilter] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<string>("all");

  // Sell Listing Form States
  const [showSellForm, setShowSellForm] = useState<boolean>(false);
  const [formData, setFormData] = useState({
    title: "",
    playerPid: "",
    level: "50",
    rank: "Heroic",
    price: "",
    sellerName: "",
    loginMethod: "Google",
    hasElitePass: false,
    skinsInput: "",
    charactersInput: "",
  });
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number | null>(null);
  const [imageFileBase64, setImageFileBase64] = useState<string>("");
  const [auditLogs, setAuditLogs] = useState<string[]>([]);
  const [isAuditing, setIsAuditing] = useState<boolean>(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [waQuickName, setWaQuickName] = useState<string>("");
  const [waQuickSpecs, setWaQuickSpecs] = useState<string>("");
  const [testimonialsTrigger, setTestimonialsTrigger] = useState<number>(0);

  // Load accounts from Server API
  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const minPrice = priceRange === "low" ? "0" : priceRange === "medium" ? "200000" : priceRange === "high" ? "500000" : "";
      const maxPrice = priceRange === "low" ? "199999" : priceRange === "medium" ? "499999" : priceRange === "high" ? "99999999" : "";
      
      let url = `/api/accounts?rank=${rankFilter}&search=${encodeURIComponent(search)}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setAccounts(data.data);
        setSystemActive(data.aiServiceActive);
      }
    } catch (err) {
      console.error("Gagal mendapatkan daftar akun:", err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger filters load
  useEffect(() => {
    fetchAccounts();
  }, [rankFilter, priceRange]);

  // Debounced search trigger
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchAccounts();
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [search]);

  // Payment Countdown Timer effect
  useEffect(() => {
    if (!activePayment || paymentComplete) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activePayment, paymentComplete]);

  // Convert timer seconds to dynamic minutes and seconds string
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle uploader change
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedSampleIndex(null); // Reset sample screen option
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Select preloaded screenshot sample helper
  const handleSelectSample = (index: number) => {
    setSelectedSampleIndex(index);
    const sample = SAMPLE_SCREENSHOTS[index];
    setImageFileBase64(sample.url);
    
    // Automatically pre-fill the form with values to represent matching screenshots
    setFormData({
      ...formData,
      level: sample.level.toString(),
      rank: sample.rank,
      hasElitePass: sample.elitePass,
      skinsInput: sample.skins.join(", "),
      charactersInput: sample.characters.join(", ")
    });
  };

  // Fast verify action
  const handleVerifyAndPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.playerPid || !formData.price || !formData.sellerName) {
      alert("Mohon lengkapi seluruh field formulir penjualan!");
      return;
    }

    setIsAuditing(true);
    setAuditLogs([
      "🔄 Menginisiasi mesin auditor AI LEDGE STORE...",
      `🔍 Memindai Player ID: UID-${formData.playerPid}...`,
      "📜 Melakukan ekstraksi visual gambar profil...",
    ]);

    // Simulate timeline logs
    setTimeout(() => {
      setAuditLogs(prev => [...prev, "🤖 Mencocokkan metadata kosmetik dengan database legal ..."]);
    }, 800);

    setTimeout(() => {
      setAuditLogs(prev => [...prev, "⚡ Merumuskan skor verifikasi kelayakan akun..."]);
    }, 1600);

    // Call server API after simulation ends to preserve user feedback excitement
    setTimeout(async () => {
      try {
        const payload = {
          title: formData.title,
          playerPid: formData.playerPid,
          level: parseInt(formData.level),
          rank: formData.rank,
          price: parseFloat(formData.price),
          sellerName: formData.sellerName,
          loginMethod: formData.loginMethod,
          hasElitePass: formData.hasElitePass,
          characters: formData.charactersInput ? formData.charactersInput.split(",").map(c => c.trim()) : ["Alok"],
          skins: formData.skinsInput ? formData.skinsInput.split(",").map(s => s.trim()) : ["SG2 Standar"],
          screenshotBase64: imageFileBase64 || null
        };

        const response = await fetch("/api/accounts/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        const resData = await response.json();
        
        if (resData.success) {
          setAuditLogs(prev => [
            ...prev,
            `✅ Verifikasi Sukses! Skor Kelayakan AI: ${resData.verificationScore}%`,
            `💡 Detail: ${resData.verificationDetails}`,
            "📣 Iklan akun Anda telah otomatis diterbitkan dalam database pasar!"
          ]);
          setScannedResult(resData.verificationDetails);
          
          // Re-fetch listing
          fetchAccounts();

          // Reset Form with a minor timer
          setTimeout(() => {
            setShowSellForm(false);
            setFormData({
              title: "",
              playerPid: "",
              level: "50",
              rank: "Heroic",
              price: "",
              sellerName: "",
              loginMethod: "Google",
              hasElitePass: false,
              skinsInput: "",
              charactersInput: "",
            });
            setImageFileBase64("");
            setSelectedSampleIndex(null);
            setAuditLogs([]);
            setIsAuditing(false);
            setScannedResult(null);
          }, 3500);

        } else {
          setAuditLogs(prev => [...prev, `❌ Verifikasi gagal: ${resData.message}`]);
          setIsAuditing(false);
        }
      } catch (err) {
        console.error("Audit error:", err);
        setAuditLogs(prev => [...prev, "❌ Error fatal saat berinteraksi dengan API server."]);
        setIsAuditing(false);
      }
    }, 2400);
  };

  // Place payment checkout order API
  const handleProceedToPayment = async (account: FreeFireAccount) => {
    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: account.id,
          method: checkoutMethod,
          phoneNumber: phoneNo || undefined
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setActivePayment(resData.payment);
        setCheckoutAccount(account);
        setSelectedAccount(null); // Close main detail modal
        setTimeLeft(900); // 15 mins
        setPaymentComplete(false);
        setCredentialsRevealed(null);
      } else {
        alert(resData.message || "Gagal menginisiasi tagihan.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi sistem.");
    }
  };

  // Perform quick payment audit verification bypass callback
  const handleConfirmMockPayment = async () => {
    if (!activePayment) return;
    setIsVerifyingPayment(true);

    try {
      const response = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: activePayment.paymentId })
      });

      const resData = await response.json();
      if (resData.success) {
        setPaymentComplete(true);
        setCredentialsRevealed(resData.payment.gameCredentials);
        // Refresh listing
        fetchAccounts();
      } else {
        alert(resData.message);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal melakukan pengecekan data transaksi.");
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // Copy to clipboard helper
  const handleCopyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Database baseline reset helper to return initial Sultan options
  const handleResetMarketplace = async () => {
    if (confirm("Apakah Anda yakin ingin menyetel ulang database dan mengembalikan daftar Akun Sultan bawaan?")) {
      try {
        const response = await fetch("/api/accounts/reset", {
          method: "POST"
        });
        const d = await response.json();
        if (d.success) {
          fetchAccounts();
          setTestimonialsTrigger(prev => prev + 1);
          alert("Database pasar sukses disetel ulang!");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Format rupiah helper
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-slate-200 font-sans p-4 md:p-6 flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      {/* Header Container */}
      <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-900">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-orange-500 rounded-lg flex items-center justify-center font-bold text-xl italic text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            FF
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase text-neutral-100">
              LEDGE <span className="text-orange-500">STORE</span>
            </h1>
            <p className="text-[10px] text-neutral-500 font-mono tracking-widest uppercase">
              Free Fire Account Trade Hub
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1.5 shadow-md">
            <Server className="w-3 h-3 text-emerald-400 animate-pulse" />
            AI Auditor {systemActive ? "Aktif" : "Simulation Mode"}
          </span>

          <button 
            onClick={handleResetMarketplace}
            className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-400 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
            title="Reset default accounts list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Data
          </button>

          <button
            onClick={() => setShowSellForm(true)}
            className="px-4 py-1.5 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-[0_4px_12px_rgba(249,115,22,0.3)] cursor-pointer flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Jual Akun (Otomatis)
          </button>

          <a
            href="https://api.whatsapp.com/send?phone=6281234567890&text=Halo%2520Admin%2520LEDGE%2520STORE%252C%2520saya%2520ingin%2520titip%2520jual%2520akun%2520Free%2520Fire%2520saya.%2520Mohon%2520bantuannya%2520untuk%2520memproses.%2520Terima%2520kasih%2521"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] flex items-center gap-1 active:scale-95 text-center cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            Jual via WA (Manual)
          </a>
        </div>
      </header>

      {/* Stats KPI Section */}
      <StatsDashboard />

      {/* BENTO GRID AREA */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Main Showcase & Filters (Grid Span 8) */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Bento Box: Search and Filters Control */}
          <div className="bg-[#14151A] rounded-3xl border border-neutral-800 p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 rounded-full blur-2xl" />
            <h2 className="text-sm font-black uppercase text-neutral-400 tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
              Pencarian Akun Terpilih
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              {/* Search label */}
              <div className="md:col-span-6 relative">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-neutral-500" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari skin legendaris, nama penjual, senjata evo..." 
                  className="w-full bg-neutral-950 text-neutral-200 pl-10 pr-4 py-2.5 rounded-xl border border-neutral-850 focus:border-orange-500/50 outline-none text-sm transition-all placeholder:text-neutral-600"
                />
              </div>

              {/* Ranks selection filter */}
              <div className="md:col-span-3">
                <select
                  value={rankFilter}
                  onChange={(e) => setRankFilter(e.target.value)}
                  className="w-full bg-neutral-950 text-neutral-200 px-3.5 py-2.5 rounded-xl border border-neutral-850 focus:border-orange-500/50 outline-none text-sm transition-all focus:ring-1 focus:ring-orange-500/30"
                >
                  <option value="all">🏆 Semua Rank</option>
                  <option value="Grandmaster">Grandmaster</option>
                  <option value="Heroic">Heroic</option>
                  <option value="Diamond III">Diamond III</option>
                  <option value="Diamond I">Diamond I</option>
                </select>
              </div>

              {/* Pricing selection filter */}
              <div className="md:col-span-3">
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full bg-neutral-950 text-neutral-200 px-3.5 py-2.5 rounded-xl border border-neutral-850 focus:border-orange-500/50 outline-none text-sm transition-all focus:ring-1 focus:ring-orange-500/30"
                >
                  <option value="all">💎 Semua Harga</option>
                  <option value="low">Di bawah Rp 200rb</option>
                  <option value="medium">Rp 200rb - Rp 500rb</option>
                  <option value="high">Di atas Rp 500rb</option>
                </select>
              </div>
            </div>

            {/* Quick Keyword tags search trigger */}
            <div className="flex flex-wrap gap-1.5 mt-4 items-center">
              <span className="text-[10px] text-neutral-500 font-mono uppercase tracking-wider mr-1">Hot Item:</span>
              {["Rapper", "Draco", "Angel", "Old Season 5", "Alok Max", "SG2 Cobra"].map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSearch(tag)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-sans transition-all border ${
                    search === tag 
                      ? 'bg-orange-950 text-orange-400 border-orange-500/30' 
                      : 'bg-neutral-950 hover:bg-neutral-900 text-neutral-400 border-neutral-850'
                  }`}
                >
                  {tag}
                </button>
              ))}
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="text-[10px] text-red-400 hover:underline font-mono ml-2 uppercase"
                >
                  [Hapus Filter]
                </button>
              )}
            </div>
          </div>

          {/* Bento Box: Accounts Grid Section */}
          <div className="bg-[#14151A] rounded-3xl border border-neutral-800 p-6 shadow-xl min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black tracking-tight text-white font-sans uppercase">
                  Katalog Premium Terverifikasi
                </h3>
                <p className="text-xs text-neutral-400 font-sans mt-0.5">
                  Daftar akun Free Fire dengan jaminan transaksi bebas penipuan.
                </p>
              </div>
              <span className="text-xs font-mono text-neutral-500">
                Menampilkan <span className="text-orange-500 font-bold">{accounts.length}</span> akun aktif
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-neutral-400 text-xs font-mono">Memindai database pasar...</p>
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-neutral-850 rounded-2xl bg-neutral-950/20">
                <AlertTriangle className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-300 font-bold text-sm">Tidak Ada Akun Yang Cocok</p>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1">
                  Kami tidak menemukan akun yang sesuai dengan pencarian Anda. Coba ubah rentang harga atau hapus ketikan filter kata kunci.
                </p>
                <button 
                  onClick={() => { setSearch(""); setRankFilter("all"); setPriceRange("all"); }}
                  className="mt-4 px-4 py-2 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Tampilkan Semua Akun
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {accounts.map((acc) => (
                  <AccountCard 
                    key={acc.id} 
                    account={acc} 
                    onSelect={(selected) => setSelectedAccount(selected)} 
                  />
                ))}
              </div>
            )}
          </div>

        </section>

        {/* RIGHT COLUMN: Bento-styled interactive elements (Grid Span 4) */}
        <section className="lg:col-span-4 space-y-6">
          
          {/* Bento Box: Secure Escrow Mechanics */}
          <div className="bg-[#14151A] rounded-3xl border border-slate-800 p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="w-10 h-10 bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4">
              <ShieldCheck className="w-5.5 h-5.5" />
            </div>
            <h3 className="font-bold text-sm text-neutral-200 uppercase tracking-widest font-sans">
              PROSEDUR ESCROW AMAN
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed mt-2">
              Setiap kali Anda membeli akun, server LEDGE STORE bertindak sebagai jembatan penengah (Rekber Otomatis):
            </p>

            <ul className="mt-4 space-y-3">
              {[
                { title: "Verifikasi Lobi", desc: "AI mencocokkan status legal profil secara instan dari screenshot." },
                { title: "Kunci Kredensial", desc: "Data email & sandi dikunci aman di server terenkripsi." },
                { title: "Rilis Kilat", desc: "Data login dibuka otomatis ke mata pembeli pasca verifikasi kasir." }
              ].map((step, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="w-5 h-5 rounded-full bg-neutral-950 flex items-center justify-center text-[10px] font-bold text-orange-500 font-mono shrink-0 border border-neutral-800">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-neutral-200 uppercase tracking-tight">{step.title}</h4>
                    <p className="text-[11px] text-neutral-400 leading-normal">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Bento Box: Payers logos gateway preview */}
          <div className="bg-[#14151A] rounded-3xl border border-slate-800 p-5 shadow-lg">
            <h4 className="text-xs font-bold uppercase text-neutral-500 tracking-wider mb-3">
              GATEWAY PEMBAYARAN KILAT
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: "QRIS", info: "Otomatis Scan" },
                { name: "BCA Virtual", info: "BCA Transfer" },
                { name: "Mandiri VA", info: "Bank Pembayaran" },
                { name: "DANA E-Wallet", info: "Instan Saldo" }
              ].map((gate) => (
                <div key={gate.name} className="bg-neutral-950/80 p-2.5 rounded-xl border border-neutral-850 flex flex-col justify-between hover:border-neutral-700 transition-all">
                  <span className="text-xs font-mono font-bold text-neutral-200">{gate.name}</span>
                  <span className="text-[9px] text-neutral-500 font-sans tracking-wide mt-1 uppercase">{gate.info}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-neutral-950 border border-neutral-850">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
              <span className="text-[9.5px] uppercase font-bold text-emerald-400 tracking-wider font-mono">
                Sistem Gateway Integrasi Online
              </span>
            </div>
          </div>

          {/* Bento Box: WhatsApp Seller Direct */}
          <div className="bg-[#14151A] rounded-3xl border border-emerald-500/20 p-5 shadow-lg relative overflow-hidden bg-gradient-to-br from-neutral-900 to-[#0F1E16]">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.08] rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-emerald-950/85 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5.5 h-5.5 text-emerald-400 animate-pulse" />
              </div>
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase">
                JUAL MANUAL (WA)
              </span>
            </div>

            <h3 className="font-bold text-sm text-neutral-200 uppercase tracking-widest font-sans flex items-center gap-1.5">
              Titip Jual via WhatsApp
            </h3>
            
            <p className="text-xs text-neutral-400 leading-relaxed mt-2 font-sans">
              Malas mengisi formulir web otomatis? Tulis spesifikasi singkat Anda di bawah dan kirim langsung ke WhatsApp admin LEDGE STORE!
            </p>

            <div className="mt-4 space-y-2.5">
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                  Nama Anda / Nickname FF
                </label>
                <input 
                  type="text" 
                  placeholder="Contoh: Reyzhanz"
                  className="w-full bg-neutral-950 text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-850 outline-none focus:border-emerald-500 text-xs font-mono"
                  onChange={(e) => setWaQuickName(e.target.value)}
                  value={waQuickName}
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                  Spesifikasi Akun & Harga
                </label>
                <input 
                  type="text" 
                  placeholder="Contoh: Lvl 74, S2, SG7 Ungu, Rp 450.000"
                  className="w-full bg-neutral-950 text-neutral-200 px-3 py-1.5 rounded-lg border border-neutral-850 outline-none focus:border-emerald-500 text-xs font-mono"
                  onChange={(e) => setWaQuickSpecs(e.target.value)}
                  value={waQuickSpecs}
                />
              </div>
            </div>

            <a
              href={`https://api.whatsapp.com/send?phone=6281234567890&text=${encodeURIComponent(
                `Halo Admin LEDGE STORE, saya ingin titip jual akun Free Fire.\n\n• Nama Penjual: ${waQuickName || "Penjual Anonim"}\n• Spesifikasi Akun: ${waQuickSpecs || "Belum ditentukan"}\n\nMohon petunjuk selanjutnya untuk memajang iklan ini di website LEDGE STORE!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-center text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_4px_12px_rgba(16,185,129,0.25)] border border-emerald-500/25"
            >
              <MessageCircle className="w-4 h-4" />
              Kirim Ke WhatsApp Admin
            </a>
          </div>

          {/* Bento Box: How It Works Banner / AI Auditing */}
          <div className="bg-[#14151A] rounded-3xl border border-neutral-800 p-5 shadow-lg relative overflow-hidden bg-gradient-to-br from-neutral-900 to-neutral-950">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/[0.03] rounded-full blur-2xl" />
            <h4 className="text-xs font-bold uppercase text-red-400 tracking-wider mb-2 flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5" />
              Verifikasi AI Otomatis
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed font-serif italic">
              "Sistem menggunakan analisis computer-vision (Gemini Flash) untuk memvalidasi tangkapan layar lobi game penjual, mengekstrak level, keselarasan rank, serta ketersediaan barang eksklusif guna mengeliminasi info palsu."
            </p>
          </div>

        </section>

      </main>

      {/* TESTIMONIALS SECTION */}
      <section className="mt-6 mb-2">
        <TestimonialsSection onRefreshTrigger={testimonialsTrigger} />
      </section>

      {/* FOOTER */}
      <footer className="mt-8 pt-6 border-t border-neutral-900 flex flex-col md:flex-row items-center justify-between gap-4 px-2 text-[11px] font-bold text-neutral-500 font-mono tracking-wider">
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
          <span className="hover:text-neutral-300 cursor-pointer">PERSYARATAN TRANSAKSI</span>
          <span className="hover:text-neutral-300 cursor-pointer">GARANSI ANTI HACKBACK</span>
          <span className="hover:text-neutral-300 cursor-pointer">SISTEM AFILIASI</span>
        </div>
        <div className="flex items-center gap-2">
          <span>LIVE MARKET: {accounts.length + 42} ANGGOTA AKTIF</span>
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
      </footer>


      {/* INTERACTIVE COMPONENT 1: CREATE LISTING & AI VERIFICATION MODAL */}
      {showSellForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Design header lines */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 to-red-600" />
            
            <button 
              onClick={() => {
                if (!isAuditing) setShowSellForm(false);
              }}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-850 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-xl font-bold font-sans text-neutral-100 uppercase tracking-tight flex items-center gap-2">
              👑 Formulir Penjualan Akun Free Fire
            </h3>
            <p className="text-xs text-neutral-400 font-sans mt-1">
              Pasang iklan Anda secara gratis dengan sistem verifikasi bukti kepemilikan anti-penipuan instan.
            </p>

            {isAuditing ? (
              /* AI Auditing Loader Animation overlay inside listing form screen */
              <div className="my-8 py-8 px-6 bg-neutral-950 rounded-xl border border-neutral-850 flex flex-col gap-6 select-none shadow-inner">
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center shrink-0">
                    <span className="w-12 h-12 bg-orange-600/10 rounded-full animate-ping absolute"></span>
                    <div className="w-10 h-10 rounded-xl bg-orange-950/80 border border-orange-500/30 flex items-center justify-center text-orange-500">
                      <Flame className="w-5 h-5 animate-bounce" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold font-mono tracking-wider text-orange-500 uppercase">
                      AUDITOR AI SEDANG BEKERJA...
                    </h4>
                    <p className="text-xs text-neutral-400">Tunggu sebentar, kami sedang memvalidasi tangkapan layar lobi.</p>
                  </div>
                </div>

                {/* Audit outputs terminal design */}
                <div className="bg-black/80 font-mono rounded-lg p-4 border border-neutral-850 text-xs text-emerald-400 space-y-2 max-h-56 overflow-y-auto">
                  {auditLogs.map((log, idx) => (
                    <div key={idx} className="flex gap-1.5 items-start">
                      <span className="text-neutral-500 shrink-0 select-none">&gt;</span>
                      <p>{log}</p>
                    </div>
                  ))}
                  <div className="w-2.5 h-4 bg-emerald-400 inline-block animate-pulse"></div>
                </div>
              </div>
            ) : (
              /* Standard Listing Form */
              <form onSubmit={handleVerifyAndPublish} className="mt-6 space-y-4">
                
                {/* Visual Screenshot selection box */}
                <div>
                  <label className="block text-xs uppercase tracking-wider font-mono text-neutral-400 mb-2">
                    🖼️ PASANG BUKTI SCREENSHOT LOBI UTAMA (MANDATORY UNTUK AI AUDIT)
                  </label>
                  
                  {/* Option to select developer mock screenshots */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                    {SAMPLE_SCREENSHOTS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSample(idx)}
                        className={`text-left p-2.5 rounded-xl border transition-all text-xs flex flex-col justify-between h-24 relative overflow-hidden ${
                          selectedSampleIndex === idx 
                            ? 'border-orange-500 bg-orange-950/20 shadow-lg' 
                            : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 to-transparent z-10" />
                        <img 
                          src={sample.url} 
                          className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:opacity-40" 
                          alt="preview"
                        />
                        <div className="z-10 flex flex-col justify-between h-full">
                          <span className="font-bold text-neutral-100 leading-tight block truncate">
                            {sample.name}
                          </span>
                          <span className="text-[10px] text-orange-400 font-mono">
                            Auto-select (Level {sample.level})
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Manual file upload */}
                  <div className="relative border border-dashed border-neutral-800 hover:border-neutral-700 rounded-xl bg-neutral-950/40 p-5 text-center transition-all cursor-pointer">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {imageFileBase64 ? (
                      <div className="flex items-center justify-center gap-3">
                        <ImageIcon className="w-8 h-8 text-orange-500" />
                        <div className="text-left">
                          <p className="text-xs text-neutral-200 font-bold">Screenshot berhasil terunggah!</p>
                          <p className="text-[10px] text-neutral-500">Tipe data: Base64 data-URL</p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
                        <p className="text-xs text-neutral-300">
                          Klik untuk upload atau drop screenshot profil Free Fire Anda sendiri
                        </p>
                        <p className="text-[10px] text-neutral-500 mt-1">
                          PNG, JPG, JPEG (Maksimal 12MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Details Specs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-neutral-400 mb-1">
                      Judul Iklan Akun
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: Akun Sultan EP Old S2 SG2 Rapper"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-neutral-950 text-neutral-200 px-3 py-2 rounded-lg border border-neutral-850 outline-none focus:border-orange-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-neutral-400 mb-1">
                      Player ID (UID Game)
                    </label>
                    <input 
                      type="number" 
                      required
                      placeholder="Contoh: 182736459"
                      value={formData.playerPid}
                      onChange={(e) => setFormData({ ...formData, playerPid: e.target.value })}
                      className="w-full bg-neutral-950 text-neutral-200 px-3 py-2 rounded-lg border border-neutral-850 outline-none focus:border-orange-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-neutral-400 mb-1">
                      Level Akun
                    </label>
                    <input 
                      type="number" 
                      required
                      min="1"
                      max="100"
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full bg-neutral-950 text-neutral-200 px-3 py-2 rounded-lg border border-neutral-850 outline-none focus:border-orange-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-neutral-400 mb-1">
                      Rank Game
                    </label>
                    <select
                      value={formData.rank}
                      onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                      className="w-full bg-neutral-950 text-neutral-200 px-3 py-2 rounded-lg border border-neutral-850 outline-none focus:border-orange-500 text-xs"
                    >
                      <option value="Grandmaster">Grandmaster</option>
                      <option value="Heroic">Heroic</option>
                      <option value="Diamond III">Diamond III</option>
                      <option value="Diamond I">Diamond I</option>
                      <option value="Gold V">Gold V</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-neutral-400 mb-1">
                      Metode Login Akun
                    </label>
                    <select
                      value={formData.loginMethod}
                      onChange={(e) => setFormData({ ...formData, loginMethod: e.target.value })}
                      className="w-full bg-neutral-950 text-neutral-200 px-3 py-2 rounded-lg border border-neutral-850 outline-none focus:border-orange-500 text-xs"
                    >
                      <option value="Google">Google Account</option>
                      <option value="Facebook">Facebook</option>
                      <option value="VK">VK</option>
                      <option value="Huawei">Huawei Account</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-neutral-400 mb-1">
                      Harga Jual (IDR)
                    </label>
                    <input 
                      type="number" 
                      required
                      placeholder="Contoh: 350000"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-neutral-950 text-neutral-200 px-3 py-2 rounded-lg border border-neutral-850 outline-none focus:border-orange-500 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-neutral-400 mb-1">
                      Highlight Karakter (Pisahkan koma)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Contoh: Alok, Chrono, K, Wukong"
                      value={formData.charactersInput}
                      onChange={(e) => setFormData({ ...formData, charactersInput: e.target.value })}
                      className="w-full bg-neutral-950 text-neutral-200 px-3 py-2 rounded-lg border border-neutral-850 outline-none focus:border-orange-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-mono text-neutral-400 mb-1">
                      Highlight Skin Unik (Pisahkan koma)
                    </label>
                    <input 
                      type="text" 
                      placeholder="Contoh: SG2 Cobra Max, Celana Angel, Set Cobra"
                      value={formData.skinsInput}
                      onChange={(e) => setFormData({ ...formData, skinsInput: e.target.value })}
                      className="w-full bg-neutral-950 text-neutral-200 px-3 py-2 rounded-lg border border-neutral-850 outline-none focus:border-orange-500 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-neutral-950/80 border border-neutral-850">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-mono text-neutral-400">Nama Alias Penjual:</span>
                    <input 
                      type="text" 
                      required
                      placeholder="Nama Anda"
                      value={formData.sellerName}
                      onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                      className="bg-transparent text-xs text-neutral-100 outline-none border-b border-neutral-800 focus:border-orange-500 max-w-[120px]"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-xs text-neutral-300 font-sans cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={formData.hasElitePass}
                      onChange={(e) => setFormData({ ...formData, hasElitePass: e.target.checked })}
                      className="rounded border-neutral-800 text-orange-500 accent-orange-500"
                    />
                    Akun Memiliki Elite Pass Aktif
                  </label>
                </div>

                {/* Form Buttons */}
                <div className="flex flex-wrap gap-3 justify-end pt-2">
                  <button 
                    type="button"
                    onClick={() => setShowSellForm(false)}
                    className="px-5 py-2 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-neutral-400 text-xs font-bold font-sans border border-neutral-850 cursor-pointer"
                  >
                    Batal
                  </button>
                  
                  <a
                    href={`https://api.whatsapp.com/send?phone=6281234567890&text=${encodeURIComponent(
                      `Halo Admin LEDGE STORE, saya ingin menjual akun Free Fire saya:\n\n` + 
                      `• Nama Penjual: ${formData.sellerName || "-"}\n` +
                      `• Judul Iklan: ${formData.title || "-"}\n` +
                      `• Player ID: UID-${formData.playerPid || "-"}\n` +
                      `• Level: ${formData.level || "-"}\n` +
                      `• Rank: ${formData.rank || "-"}\n` +
                      `• Metode Login: ${formData.loginMethod || "-"}\n` +
                      `• Elite Pass: ${formData.hasElitePass ? "Aktif" : "Tidak Aktif"}\n` +
                      `• Skin Unik: ${formData.skinsInput || "-"}\n` +
                      `• Karakter Unik: ${formData.charactersInput || "-"}\n` +
                      `• Harga Jual: Rp ${formData.price ? Number(formData.price).toLocaleString("id-ID") : "-"}\n\n` +
                      `Mohon dibantu proses daftarnya secara manual. Terima kasih!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-sans shadow-lg shadow-emerald-950/20 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                    Hubungi Admin (WA)
                  </a>

                  <button 
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-bold font-sans shadow-lg shadow-orange-950/30 cursor-pointer transition-all active:scale-95"
                  >
                    Mulai Audit & Daftarkan Akun
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}


      {/* INTERACTIVE COMPONENT 2: INTERACTIVE KASIR & GATEWAY MODAL */}
      {selectedAccount && (
        <AccountDetailsModal 
          account={selectedAccount} 
          onClose={() => setSelectedAccount(null)} 
          onProceedToCheckout={(acc) => {
            const message = `Halo Admin LEDGE STORE,\n\nSaya tertarik untuk membeli akun Free Fire dengan rincian berikut:\n\n• ID Akun: ${acc.id}\n• Judul Akun: ${acc.title}\n• Level: ${acc.level}\n• Rank: ${acc.rank}\n• Spesifikasi Utama: ${acc.skins.join(', ')}\n• Harga Akun: Rp ${acc.price.toLocaleString("id-ID")}\n\nMohon dipandu untuk instruksi cara pembayaran Aman Rekber WA dan serah terima data login akunnya. Terima kasih!`;
            const waUrl = `https://api.whatsapp.com/send?phone=6281234567890&text=${encodeURIComponent(message)}`;
            window.open(waUrl, "_blank", "noopener,noreferrer");
            setSelectedAccount(null);
          }}
        />
      )}


      {/* INTERACTIVE COMPONENT 3: SECURED TRANSACTION STATUS BILL & ESCROW FULFILLMENT */}
      {activePayment && checkoutAccount && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative bg-neutral-900 border border-neutral-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl overflow-hidden text-left animate-in fade-in zoom-in-95 duration-200">
            
            {/* Elegant header color lines */}
            <div className={`absolute top-0 left-0 right-0 h-1.5 ${paymentComplete ? "bg-emerald-500" : "bg-orange-500 animate-pulse"}`} />

            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] text-neutral-500 font-mono block uppercase">ID Transaksi Rekber</span>
                <span className="text-xs font-mono font-bold text-neutral-300">{activePayment.paymentId}</span>
              </div>
              
              <button 
                onClick={() => {
                  // Release hold
                  const accToRelease = accounts.find(a => a.id === checkoutAccount.id);
                  if (accToRelease && !paymentComplete) {
                    accToRelease.status = "available";
                  }
                  setActivePayment(null);
                  setCheckoutAccount(null);
                  setPaymentComplete(false);
                }}
                className="w-7 h-7 rounded-full bg-neutral-950 hover:bg-neutral-850 border border-neutral-850 flex items-center justify-center text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* If Payment is COMPLETE, reveal credentials */}
            {paymentComplete ? (
              <div className="space-y-4">
                <div className="text-center py-4 bg-emerald-950/20 border border-emerald-500/20 rounded-2xl">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-2 animate-bounce" />
                  <h4 className="text-base font-bold text-emerald-400 uppercase font-sans tracking-wide">
                    Transaksi Sukses! Akun Diamankan
                  </h4>
                  <p className="text-[11px] text-emerald-500/80 font-sans max-w-xs mx-auto mt-1">
                    Uang Anda aman di garansi rekber. Silakan gunakan kredensial berikut untuk login ke Free Fire.
                  </p>
                </div>

                {/* Secure Revealed Credentials Box */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3 shadow-inner">
                  <div className="flex items-center gap-1 text-xs font-mono text-neutral-400 uppercase tracking-wider">
                    <Key className="w-4 h-4 text-orange-500" />
                    Detail Akun & Kredensial Login
                  </div>
                  <div className="w-full h-[1px] bg-neutral-900" />

                  {/* Field: Username/Email */}
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-500 block">Email / No. HP</span>
                    <div className="flex items-center justify-between bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-sm font-mono text-neutral-200 mt-1">
                      <span>{credentialsRevealed?.email || "demo-account-login@gmail.com"}</span>
                      <button 
                        onClick={() => handleCopyToClipboard(credentialsRevealed?.email || "demo-account-login@gmail.com", "email")}
                        className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                        title="Salin Kredensial"
                      >
                        {copiedId === "email" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Field: Password */}
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-500 block">Kata Sandi (Password)</span>
                    <div className="flex items-center justify-between bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-sm font-mono text-neutral-200 mt-1">
                      <span>{credentialsRevealed?.pass || "SecretPassFF_8829"}</span>
                      <button 
                        onClick={() => handleCopyToClipboard(credentialsRevealed?.pass || "SecretPassFF_8829", "pass")}
                        className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                        title="Salin Kata Sandi"
                      >
                        {copiedId === "pass" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Field: 2FA Backup codes */}
                  <div>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-neutral-500 block">Kode Backup Otentikasi 2FA</span>
                    <div className="flex items-center justify-between bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 text-sm font-mono text-neutral-200 mt-1">
                      <span>{credentialsRevealed?.backupCodes || "12003894, 99283748"}</span>
                      <button 
                        onClick={() => handleCopyToClipboard(credentialsRevealed?.backupCodes || "12003894, 99283748", "2fa")}
                        className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
                        title="Salin Kode Otentikasi"
                      >
                        {copiedId === "2fa" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-[10px] text-neutral-400 space-y-1">
                  <p className="font-bold text-neutral-300 uppercase font-sans flex items-center gap-1 tracking-wider">
                    <Lock className="w-3.5 h-3.5 text-orange-500" />
                    Langkah Pengamanan Pasca Pembelian:
                  </p>
                  <p>1. Silakan login ke game menggunakan tipe login akun {checkoutAccount.loginMethod}.</p>
                  <p>2. Ganti kata sandi segera dan tambahkan no. HP Anda untuk keamanan penuh atau mengubah alamat email pemulihan gawai.</p>
                </div>

                <div className="pt-2 text-center">
                  <button 
                    onClick={() => {
                      setActivePayment(null);
                      setCheckoutAccount(null);
                      setPaymentComplete(false);
                    }}
                    className="w-full py-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-850 text-neutral-200 text-xs font-bold cursor-pointer"
                  >
                    Kembali Ke Beranda
                  </button>
                </div>

              </div>
            ) : (
              /* If Payment is PENDING, display payment instructions */
              <div className="space-y-4">
                
                {/* Timer details */}
                <div className="flex items-center justify-between bg-red-950/20 border border-red-500/20 px-4 py-3 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-red-500 animate-pulse" />
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider block text-red-400 leading-none">
                        Sisa Waktu Pembayaran
                      </span>
                      <span className="text-xs text-neutral-300 font-sans mt-1">Gunakan pembayaran instan</span>
                    </div>
                  </div>
                  <span className="text-xl font-bold font-mono text-red-500 tracking-wider">
                    {formatTime(timeLeft)}
                  </span>
                </div>

                {/* Account visual recap */}
                <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-850 flex gap-3 text-xs">
                  <img src={checkoutAccount.imageUrl} className="w-14 h-14 rounded-xl object-cover shrink-0" alt="recap"/>
                  <div>
                    <h5 className="font-bold text-neutral-100">{checkoutAccount.title}</h5>
                    <p className="text-neutral-500 mt-1 font-mono">UID: {checkoutAccount.id}</p>
                    <p className="text-emerald-400 font-bold font-mono mt-0.5">{formatRupiah(checkoutAccount.price)}</p>
                  </div>
                </div>

                {/* Gateway Detail Rendering */}
                <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 flex flex-col items-center">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 mb-3">
                    Metode: {activePayment.method}
                  </span>

                  {activePayment.method === "QRIS" && (
                    <div className="text-center space-y-3">
                      <div className="bg-white p-3.5 rounded-2xl inline-block shadow-lg">
                        {/* High fidelity static representation QR code */}
                        <div className="w-40 h-40 bg-neutral-100 flex items-center justify-center p-1 relative">
                          <QrCode className="w-full h-full text-black" />
                          <div className="absolute w-10 h-10 bg-red-600 rounded-lg border-2 border-white flex items-center justify-center font-bold text-xs italic text-white shadow-md">
                            FF
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed font-sans px-4">
                        Pindai kode QRIS diatas menggunakan aplikasi E-Wallet (DANA, OVO, GoPay) atau Mobile Banking Anda untuk menyelesaikan pembayaran.
                      </p>
                    </div>
                  )}

                  {(activePayment.method === "VA_BCA" || activePayment.method === "VA_MANDIRI") && (
                    <div className="w-full text-center py-4 space-y-3">
                      <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl inline-block max-w-xs w-full">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Nomor Virtual Account</span>
                        <div className="text-lg font-bold font-mono text-orange-400 mt-1.5 tracking-wider select-all">
                          {activePayment.vaNumber}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 px-3">
                        Gunakan nomor virtual account diatas melalui m-Banking atau mesin ATM untuk checkout instan tanpa verifikasi berkas manual.
                      </p>
                    </div>
                  )}

                  {activePayment.method === "DANA" && (
                    <div className="w-full text-center py-4 space-y-2">
                      <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-2xl inline-block max-w-xs w-full">
                        <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">Nomor Ponsel DANA</span>
                        <div className="text-lg font-bold font-mono text-orange-400 mt-1.5 tracking-wider">
                          {phoneNo || "08123456789"}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 px-3">
                        Masukkan ponsel e-wallet diatas. Kami telah mengirimkan konfirmasi pop-up OTP aman pembayaran langsung ke gadget Anda.
                      </p>
                    </div>
                  )}
                </div>

                {/* Gateway instruction guidelines */}
                <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-850 text-[10px] text-neutral-400 leading-relaxed flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <p>
                    Sistem akan memantau pembayaran Anda secara real-time. Untuk tujuan simulasi integrasi cepat atau setelah Anda membayar, silakan klik tombol verifikasi di bawah ini untuk mensimulasikan persetujuan bank instan kami.
                  </p>
                </div>

                {/* Action CTA */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => {
                      // Cancel order hold
                      const accToRelease = accounts.find(a => a.id === checkoutAccount.id);
                      if (accToRelease && !paymentComplete) {
                        accToRelease.status = "available";
                      }
                      setActivePayment(null);
                      setCheckoutAccount(null);
                    }}
                    className="py-3 rounded-xl border border-neutral-800 hover:bg-neutral-850 text-neutral-400 text-xs font-bold cursor-pointer text-center select-none"
                  >
                    Batalkan Transaksi
                  </button>

                  <button 
                    onClick={handleConfirmMockPayment}
                    disabled={isVerifyingPayment}
                    className="py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold transition-all shadow-[0_4px_12px_rgba(16,185,129,0.3)] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {isVerifyingPayment ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    Verifikasi Pembayaran
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
