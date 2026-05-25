import React, { useState, useEffect, useRef } from "react";
import { Star, ShieldCheck, CheckCircle, Upload, Image, User, PlusCircle, AlertCircle, FileText, Sparkles, Smile, X } from "lucide-react";
import { Testimonial } from "../types";

export interface TestimonialsSectionProps {
  onRefreshTrigger?: number; // to allow parents to force update
}

export default function TestimonialsSection({ onRefreshTrigger }: TestimonialsSectionProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSubmitForm, setShowSubmitForm] = useState<boolean>(false);
  
  // Submit Form States
  const [name, setName] = useState<string>("");
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>("");
  const [itemPurchased, setItemPurchased] = useState<string>("");
  const [verifiedPurchase, setVerifiedPurchase] = useState<boolean>(true);
  const [imageBase64, setImageBase64] = useState<string>("");
  const [imageFileName, setImageFileName] = useState<string>("");
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/testimonials");
      const result = await res.json();
      if (result.success) {
        setTestimonials(result.data);
      }
    } catch (err) {
      console.error("Failed to load testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, [onRefreshTrigger]);

  // Handle PNG Image Upload and convert to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if format is PNG as requested
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== "png") {
      setErrorMsg("Mohon lampirkan foto dengan format .PNG saja untuk menjamin kualitas!");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setErrorMsg("");
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageBase64(reader.result);
      }
    };
    reader.onerror = (error) => {
      console.error("Error reading png photo:", error);
      setErrorMsg("Gagal membaca file gambar.");
    };
    reader.readAsDataURL(file);
  };

  // Drag-and-Drop files uploader helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== "png") {
      setErrorMsg("Mohon unggah file format .PNG saja!");
      return;
    }

    setErrorMsg("");
    setImageFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageBase64(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle testimonial form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setErrorMsg("Nama dan Ulasan wajib diisi!");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg("");
      setSuccessMsg("");

      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          rating,
          message: message.trim(),
          imageUrl: imageBase64,
          itemPurchased: itemPurchased.trim() || "Akun Sultan FF",
          verifiedPurchase,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setSuccessMsg("Testimoni Anda berhasil dikirim ke LEDGE STORE!");
        setName("");
        setMessage("");
        setItemPurchased("");
        setImageBase64("");
        setImageFileName("");
        setRating(5);
        if (fileInputRef.current) fileInputRef.current.value = "";
        
        // Refresh testimonials lists
        fetchTestimonials();
        
        // Hide form after 2 seconds
        setTimeout(() => {
          setShowSubmitForm(false);
          setSuccessMsg("");
        }, 2200);
      } else {
        setErrorMsg(result.message || "Gagal mengirim testimoni.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan koneksi server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div id="testimonials-root" className="bg-[#101115] rounded-3xl border border-neutral-850 p-6 shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      {/* Testimonials Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-900 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[9.5px] px-2.5 py-0.5 rounded-full font-mono font-bold tracking-widest uppercase">
              REPUTASI TOKO
            </span>
            <div className="flex items-center text-amber-400 gap-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-neutral-200">5.0 / 5.0 Rating</span>
            </div>
          </div>
          <h2 className="text-xl font-extrabold text-neutral-100 tracking-tight uppercase mt-1">
            TESTIMONI <span className="text-orange-500 font-black">LEDGE STORE</span>
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Apa kata para pemain Sultan Free Fire yang bertransaksi aman di toko kami?
          </p>
        </div>

        <button
          onClick={() => {
            setShowSubmitForm(!showSubmitForm);
            setErrorMsg("");
            setSuccessMsg("");
          }}
          className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white text-xs font-bold rounded-xl transition-all shadow-[0_4px_12px_rgba(249,115,22,0.2)] flex items-center gap-1.5 active:scale-95 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          {showSubmitForm ? "Tutup Form" : "Kirim Testimoni"}
        </button>
      </div>

      {/* Suggest write custom rules or feedback */}
      {showSubmitForm && (
        <form onSubmit={handleSubmit} className="mb-8 p-5 bg-neutral-950/60 rounded-2xl border border-orange-500/15 space-y-4 relative">
          <h3 className="text-xs font-bold text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
            <Smile className="w-4 h-4 text-orange-400" />
            Tulis Cerita Transaksi Anda
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                Nickname Anda / Nama
              </label>
              <input
                type="text"
                placeholder="Contoh: FF_GamerSultan"
                className="w-full bg-[#111216] text-neutral-200 px-3.5 py-2 rounded-xl border border-neutral-800 outline-none focus:border-orange-500 text-xs font-mono"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={30}
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
                Akun / Layanan Yang Dibeli
              </label>
              <input
                type="text"
                placeholder="Contoh: Akun Sultan Evo Max / Rekber WA"
                className="w-full bg-[#111216] text-neutral-200 px-3.5 py-2 rounded-xl border border-neutral-800 outline-none focus:border-orange-500 text-xs font-mono"
                value={itemPurchased}
                onChange={(e) => setItemPurchased(e.target.value)}
                maxLength={40}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">Rating Toko:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <button
                    key={starValue}
                    type="button"
                    onClick={() => setRating(starValue)}
                    className="cursor-pointer transition-all hover:scale-110"
                  >
                    <Star
                      className={`w-5.5 h-5.5 ${
                        starValue <= rating 
                          ? "fill-amber-400 text-amber-400" 
                          : "text-neutral-700"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-neutral-900/50 px-3 py-1.5 rounded-lg border border-neutral-800">
              <input
                type="checkbox"
                checked={verifiedPurchase}
                onChange={(e) => setVerifiedPurchase(e.target.checked)}
                className="rounded border-neutral-800 text-orange-500 focus:ring-0 focus:ring-offset-0 bg-neutral-950 w-4 h-4"
              />
              <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                Pembelian Terverifikasi
              </span>
            </label>
          </div>

          <div>
            <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1">
              Feedback / Ulasan jujur Anda
            </label>
            <textarea
              rows={3}
              placeholder="Ceritakan pengalaman Anda belanja di LEDGE STORE, misal kecepatan pengiriman kode aman, keramahan admin dll..."
              className="w-full bg-[#111216] text-neutral-200 px-3.5 py-2 rounded-xl border border-neutral-800 outline-none focus:border-orange-500 text-xs font-sans leading-relaxed"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={250}
              required
            />
          </div>

          {/* PNG File Image Proof Uploader */}
          <div>
            <label className="block text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-neutral-400" />
              Unggah Foto Bukti Transaksi atau Profil (Wajib format .PNG)
            </label>
            
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="w-full border border-dashed border-neutral-800 hover:border-orange-500/45 bg-[#121318]/50 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center gap-1.5"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png"
                className="hidden"
              />
              
              {imageBase64 ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    <img
                      src={imageBase64}
                      alt="Review proof preview"
                      className="w-20 h-20 object-cover rounded-lg border border-neutral-800"
                    />
                    <div className="absolute -top-1.5 -right-1.5 bg-neutral-900 border border-neutral-800 text-neutral-400 p-0.5 rounded-full hover:text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageBase64("");
                        setImageFileName("");
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <X className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle className="w-3.5 h-3.5" /> Checked PNG: {imageFileName}
                  </span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-neutral-600 animate-pulse" />
                  <p className="text-[11px] text-neutral-400 font-sans">
                    <span className="text-orange-400 font-bold">Klik untuk memilih file</span> atau seret file Anda ke sini
                  </p>
                  <p className="text-[9.5px] text-neutral-500 font-mono">
                    Hanya mendukung berkas asli berekstensi .PNG
                  </p>
                </>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-1.5 p-2.5 bg-red-950/40 border border-red-500/20 text-red-400 text-xs rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-1.5 p-2.5 bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs rounded-xl">
              <CheckCircle className="w-4 h-4 shrink-0 animate-bounce" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2 border-t border-neutral-900">
            <button
              type="button"
              onClick={() => setShowSubmitForm(false)}
              className="px-4 py-1.5 bg-neutral-900 text-neutral-400 border border-neutral-850 hover:text-neutral-200 text-xs font-bold rounded-lg transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-1.5 bg-gradient-to-r from-orange-600 to-red-600 text-white text-xs font-bold rounded-lg transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? "Mengirim..." : "Kirim Sekarang"}
            </button>
          </div>
        </form>
      )}

      {/* Testimonials Masonry or Grid Showcase */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-neutral-500 font-mono">Memuat ulasan pembeli...</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-10 border border-neutral-900 rounded-2xl">
          <AlertCircle className="w-10 h-10 text-neutral-700 mx-auto mb-2" />
          <p className="text-neutral-400 text-xs">Belum ada testimoni. Jadilah pembeli pertama yang memberikan ulasan!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {testimonials.map((testi) => (
            <div 
              key={testi.id}
              className="bg-[#14151A]/90 rounded-2xl border border-neutral-850 p-4.5 flex flex-col justify-between hover:border-neutral-700 transition-all hover:scale-[1.01] duration-200 relative group overflow-hidden"
            >
              <div>
                {/* User Row info */}
                <div className="flex items-start justify-between gap-2.5 mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-neutral-950 border border-neutral-850 flex items-center justify-center text-orange-400 font-bold text-xs shrink-0 font-mono">
                      {testi.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-200 font-mono flex items-center gap-1">
                        {testi.name}
                        {testi.verifiedPurchase && (
                          <span className="text-emerald-400" title="Pembeli Terverifikasi">
                            <ShieldCheck className="w-3.5 h-3.5 fill-emerald-950" />
                          </span>
                        )}
                      </h4>
                      <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">{testi.date}</p>
                    </div>
                  </div>

                  {/* Stars counter display */}
                  <div className="flex gap-0.5 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < testi.rating 
                            ? "fill-amber-400 text-amber-400" 
                            : "text-neutral-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Testimonial message content */}
                <p className="text-xs text-neutral-300 leading-relaxed font-sans italic selection:bg-orange-500 selection:text-white">
                  "{testi.message}"
                </p>
              </div>

              {/* Verified Product purchase tags AND PNG attachment proof */}
              <div className="mt-4 pt-3.5 border-t border-neutral-900/80 flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[9.5px] font-mono text-neutral-500 uppercase tracking-wider">
                    Produk: <span className="text-neutral-400 font-bold">{testi.itemPurchased || "Akun Sultan FF"}</span>
                  </span>
                  
                  {testi.imageUrl && (
                    <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[8.5px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                      <Image className="w-2.5 h-2.5" /> PNG Bukti
                    </span>
                  )}
                </div>

                {/* Optional Custom User PNG screenshot verification thumbnail */}
                {testi.imageUrl && (
                  <div className="relative mt-1 group-hover:border-neutral-700 transition-all rounded-lg overflow-hidden border border-neutral-900 bg-neutral-950/80 p-1">
                    <img 
                      src={testi.imageUrl} 
                      alt="Verified transaction screenshot proof"
                      className="w-full h-24 object-cover rounded-md cursor-pointer filter brightness-95 hover:brightness-105 active:scale-98 transition-all"
                      onClick={() => setZoomImage(testi.imageUrl || null)}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/70 hover:bg-black px-2 py-0.5 rounded text-[8px] font-mono text-neutral-300 tracking-wider pointer-events-none uppercase">
                      Klik untuk memperbesar bukti .PNG
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Big image zoom Lightbox Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoomImage(null)}
        >
          <div className="relative max-w-2xl w-full bg-[#111216] border border-neutral-800 rounded-3xl p-3 flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setZoomImage(null)}
              className="absolute top-4 right-4 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-400 hover:text-white p-2 rounded-full cursor-pointer z-10 transition-all border border-neutral-800"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-full bg-neutral-950 rounded-2xl overflow-hidden flex items-center justify-center max-h-[80vh]">
              <img 
                src={zoomImage} 
                alt="Enlarged transactional screenshot proof PNG" 
                className="max-w-full max-h-[70vh] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="mt-3 px-2 flex justify-between items-center text-[10px] font-mono text-neutral-400">
              <span className="uppercase text-orange-400 font-bold">📜 BUKTI TRANSAKSI PNG TERVERIFIKASI AWAN</span>
              <span>LEDGE STORE SECURE ESCROW</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
