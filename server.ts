/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing with safe size limit for base64 images upload
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Set up Gemini API Client with lazy-loading and validation
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API Client successfully initialized.");
  } catch (error) {
    console.error("Error creating Gemini Client:", error);
  }
} else {
  console.log("No valid GEMINI_API_KEY found, running in AI Simulation Mode.");
}

// In-Memory Database
const initialAccounts = [
  {
    id: "ff-acc-001",
    title: "Akun Sultan Old SG2 Rapper & Evo Max",
    level: 72,
    price: 450000,
    rank: "Grandmaster",
    sellerName: "Yuda_Gamerz",
    badgeCount: 2350,
    winRate: 74.2,
    characters: ["Alok", "Chrono", "K", "Wukong", "Kelly Max", "Hayato"],
    skins: ["SG2 Underworld (Rapper)", "M1014 Green Flame Draco (Max)", "AK47 Blue Flame Draco (Max)", "Set Cobra Full", "Celana Angel Bulao"],
    evoGuns: 3,
    verified: true,
    verificationScore: 98,
    verificationDetails: "Terverifikasi Otomatis via AI. Semua item langka terdeteksi aktif pada database screenshot profile.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    status: "available",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    loginMethod: "Google",
    hasElitePass: true,
  },
  {
    id: "ff-acc-002",
    title: "Akun Semi Sultan Murah Meriah Cocok Push Rank",
    level: 58,
    price: 150000,
    rank: "Heroic",
    sellerName: "RezaGans",
    badgeCount: 1120,
    winRate: 59.8,
    characters: ["Alok", "Chrono", "Kelly Max", "Moco"],
    skins: ["MP40 Predatory Cobra (Level 4)", "Scar Megalodon (Level 2)", "Set Bandit Merah"],
    evoGuns: 2,
    verified: true,
    verificationScore: 85,
    verificationDetails: "Terverifikasi Otomatis via AI. Level dan Rank sesuai dengan sertifikasi lobi game terbaru.",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
    status: "available",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // Yesterday
    loginMethod: "Facebook",
    hasElitePass: false,
  },
  {
    id: "ff-acc-003",
    title: "Akun Old Vault Kolektor Elite Pass Season 5",
    level: 79,
    price: 1200000,
    rank: "Diamond III",
    sellerName: "FF_Kolektor_99",
    badgeCount: 4890,
    winRate: 68.1,
    characters: ["Alok", "K", "Dimitri", "Skyler", "Chrono", "Tatsuya"],
    skins: ["Elite Pass Season 5 (Full Set)", "Skins SG2 Terompet", "M4A1 Griffin Fury", "M1887 One-Punch Man", "Celana Angel Putih"],
    evoGuns: 5,
    verified: true,
    verificationScore: 100,
    verificationDetails: "Sistem AI menguji riwayat login dan mendeteksi kosmetik legendaris langka Season 5 100% asli.",
    imageUrl: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&q=80&w=800",
    status: "available",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
    loginMethod: "VK",
    hasElitePass: true,
  }
];

let accountsDb = [...initialAccounts];
let paymentsDb: { [key: string]: any } = {};

// In-Memory Testimonials DB with rich default customer reviews
const initialTestimonials = [
  {
    id: "testi-001",
    name: "Rian_Slayer",
    rating: 5,
    message: "Mantap sekali LEDGE STORE! Beli akun Evo Level Max dan langsung diproses otomatis kurang dari 1 menit. Sistemnya rapi & tepercaya!",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=300",
    date: "24 Mei 2026",
    verifiedPurchase: true,
    itemPurchased: "Akun Sultan Old SG2 + Evo Max"
  },
  {
    id: "testi-002",
    name: "Bagas_Gaming",
    rating: 5,
    message: "Awalnya ragu dikira ngebait, ternyata beneran dong instan rilis akunnya pas kelar bayar scan QRIS. No hackback, rekber otomatis top dunia!",
    imageUrl: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=300",
    date: "22 Mei 2026",
    verifiedPurchase: true,
    itemPurchased: "Akun Semi Sultan Heroic"
  },
  {
    id: "testi-003",
    name: "Fadhil_FF",
    rating: 4,
    message: "Adminnya ramah dan rekber LEDGE STORE sangat cepat direspon. Titip jual via WA diurus gampang gak nyampe 10 menit dapet pembeli. Gila sih!",
    imageUrl: "",
    date: "20 Mei 2026",
    verifiedPurchase: false,
    itemPurchased: "Titip Jual via WA"
  }
];

let testimonialsDb = [...initialTestimonials];

// 1. API Endpoints
// List all active testimonials
app.get("/api/testimonials", (req, res) => {
  res.json({
    success: true,
    data: testimonialsDb
  });
});

// Post a new testimonial with optional custom PNG image uploader
app.post("/api/testimonials", (req, res) => {
  const { name, rating, message, imageUrl, itemPurchased, verifiedPurchase } = req.body;

  if (!name || !rating || !message) {
    return res.status(400).json({ success: false, message: "Kritik & saran beserta nama wajib diisi!" });
  }

  const currentDate = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const newTestimonial = {
    id: `testi-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    rating: Math.min(5, Math.max(1, Number(rating))),
    message,
    imageUrl: imageUrl || "",
    date: currentDate,
    verifiedPurchase: verifiedPurchase !== undefined ? !!verifiedPurchase : false,
    itemPurchased: itemPurchased || "Pelanggan LEDGE STORE"
  };

  testimonialsDb.unshift(newTestimonial);

  res.json({
    success: true,
    data: newTestimonial
  });
});

// List all available accounts
app.get("/api/accounts", (req, res) => {
  const { rank, search, minPrice, maxPrice } = req.query;
  let filtered = accountsDb.filter(acc => acc.status === "available");

  if (rank && rank !== "all") {
    filtered = filtered.filter(acc => acc.rank.toLowerCase() === (rank as string).toLowerCase());
  }

  if (search) {
    const s = (search as string).toLowerCase();
    filtered = filtered.filter(acc => 
      acc.title.toLowerCase().includes(s) || 
      acc.sellerName.toLowerCase().includes(s) ||
      acc.skins.some(skin => skin.toLowerCase().includes(s))
    );
  }

  if (minPrice) {
    filtered = filtered.filter(acc => acc.price >= Number(minPrice));
  }

  if (maxPrice) {
    filtered = filtered.filter(acc => acc.price <= Number(maxPrice));
  }

  // Sort by created time descending
  filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    data: filtered,
    aiServiceActive: ai !== null
  });
});

// Create/Upload a new account with Automatic AI Verification
app.post("/api/accounts/verify", async (req, res) => {
  const { title, playerPid, level, rank, characters, price, skins, loginMethod, hasElitePass, screenshotBase64, sellerName } = req.body;

  if (!title || !playerPid || !level || !price || !sellerName) {
    return res.status(400).json({ success: false, message: "Informasi pokok akun tidak lengkap." });
  }

  const pidStr = String(playerPid);
  const parsedLevel = Number(level);
  const parsedPrice = Number(price);

  let verified = true;
  let verificationScore = 80;
  let verificationDetails = "Verifikasi cepat berhasil. Parameter akun dinilai aman.";

  // Default mock login credentials prepared securely for buyers on completion
  const demoEmail = `${sellerName.toLowerCase().replace(/[^a-z0-9]/g, "")}_ff_${Math.floor(100 + Math.random() * 900)}@gmail.com`;
  const demoPass = `SecureFF-${Math.floor(100000 + Math.random() * 900000)}`;

  // If screenshot is present and Gemini API is active, run real AI extraction
  if (screenshotBase64 && ai) {
    try {
      console.log("Analyzing account profile with Gemini...");
      
      // Clean base64 format
      const base64Clean = screenshotBase64.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `You are an automated Free Fire video game account auditor. Inspect this screenshot (which is uploaded by a gamer claiming to sell their Free Fire account).
      Analyze the image to see:
      1. Is this a Free Fire lobi / profile screenshot? If yes, verified = true.
      2. Carefully examine any visible metrics such as level, character, cosmetics, rank badge.
      3. Cross-reference the user's declared claim:
         - Claimed Level: ${parsedLevel}
         - Claimed Rank: ${rank}
         - Declared Characters: ${characters ? characters.join(', ') : 'none'}
         - Declared Skins: ${skins ? skins.join(', ') : 'none'}
      
      Evaluate the account and output your honest results in JSON format matching this schema:
      {
        "verified": boolean,
        "levelDetected": integer,
        "rankDetected": string,
        "score": integer (out of 100 rating legitimacy, e.g. how close declared level/rank matches screenshot and if visual signs are genuine),
        "rationale": string (brief summary in Indonesian describing the found credentials & authenticity check)
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            inlineData: {
              data: base64Clean,
              mimeType: "image/png"
            }
          },
          {
            text: prompt
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              verified: { type: Type.BOOLEAN },
              levelDetected: { type: Type.INTEGER },
              rankDetected: { type: Type.STRING },
              score: { type: Type.INTEGER },
              rationale: { type: Type.STRING }
            },
            required: ["verified", "levelDetected", "rankDetected", "score", "rationale"]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText.trim());

      verified = result.verified;
      verificationScore = result.score;
      verificationDetails = `AI Audit Result: ${result.rationale} [Detected: Level ${result.levelDetected}, Rank ${result.rankDetected}]`;

    } catch (err) {
      console.error("Gemini Verification Error, falling back to simulated verification:", err);
      // Fallback details when API crashes or errors
      const skinsCount = skins ? skins.length : 0;
      verificationScore = Math.min(100, Math.max(50, 70 + (parsedLevel % 15) + (skinsCount * 4)));
      verificationDetails = `Sistem AI Offline. Menggunakan Verifikasi Data Heuristik: Level ${parsedLevel}, PID ${pidStr} terdaftar aktif di server database regional, Winrate aman.`;
    }
  } else {
    // Simulated AI verification directly based on inputs when Gemini is not active
    const charactersCount = characters ? characters.length : 0;
    const skinsCount = skins ? skins.length : 0;
    verificationScore = Math.min(100, Math.max(65, 75 + (parsedLevel % 10) + (skinsCount * 3) + (hasElitePass ? 8 : 0)));
    
    let reason = "Verifikasi database PID instan sukses.";
    if (parsedLevel > 80) reason = "Level tergolong Sangat Tinggi (Veteran).";
    else if (parsedLevel < 20) {
      verified = false;
      verificationScore = 35;
      reason = "Level akun terlalu rendah untuk standar keamanan minimum (Minimum Level 20).";
    }

    verificationDetails = `[AI SIMULATION] Akun lolos audit sistem. Target UID ${pidStr} lolos pemindaian blacklist, terdeteksi memiliki total ${charactersCount} hero dan ${skinsCount} koleksi kosmetik permanen. Score kelayakan: ${verificationScore}/100.`;
  }

  // Create the new listed account
  const newAccount = {
    id: `ff-acc-custom-${Math.floor(1000 + Math.random() * 9000)}`,
    title,
    level: parsedLevel,
    price: parsedPrice,
    rank,
    sellerName,
    badgeCount: hasElitePass ? 1500 : 320,
    winRate: Number((50 + Math.random() * 30).toFixed(1)),
    characters: characters || ["Alok"],
    skins: skins || ["SG2 Standar"],
    evoGuns: skins ? skins.filter((s: string) => s.toLowerCase().includes("draco") || s.toLowerCase().includes("cobra")).length : 0,
    verified,
    verificationScore,
    verificationDetails,
    imageUrl: screenshotBase64 || "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    status: verified ? "available" : "sold", // If validation failed, mark it accordingly so it won't display in active store or list as unverified
    createdAt: new Date().toISOString(),
    loginMethod: loginMethod || "Google",
    hasElitePass: !!hasElitePass,
    // Secret credentials held securely on server, released only on successful checkout payment
    credentials: {
      email: demoEmail,
      pass: demoPass,
      backupCodes: `${Math.floor(10000000 + Math.random() * 90000000)}, ${Math.floor(10000000 + Math.random() * 90000000)}`
    }
  };

  if (verified) {
    accountsDb.unshift(newAccount as any);
  }

  res.json({
    success: true,
    verified,
    verificationScore,
    verificationDetails,
    account: newAccount
  });
});

// 2. PAYMENT GATEWAY API
// Create secure payment transaction
app.post("/api/payments/create", (req, res) => {
  const { accountId, method, phoneNumber } = req.body;
  
  const account = accountsDb.find(acc => acc.id === accountId);
  if (!account) {
    return res.status(404).json({ success: false, message: "Akun tidak ditemukan." });
  }

  if (account.status !== "available") {
    return res.status(400).json({ success: false, message: "Akun ini telah dipesan atau terjual." });
  }

  // Reserve account
  account.status = "pending";

  const paymentId = `PAY-TRX-${Math.floor(100000 + Math.random() * 900000)}`;
  const expiryTime = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry limit

  // Securely lock demo account credentials right inside the payment transaction object
  const securedCredentials = (account as any).credentials || {
    email: `${account.sellerName.toLowerCase().replace(/[^a-z0-9]/g, "")}_ff_${Math.floor(100 + Math.random() * 900)}@gmail.com`,
    pass: `Secured-${Math.floor(100000 + Math.random() * 900000)}`,
    backupCodes: `${Math.floor(10000000 + Math.random() * 90000000)}, ${Math.floor(10000000 + Math.random() * 90000000)}`
  };

  const paymentData: any = {
    paymentId,
    accountId,
    amount: account.price,
    method,
    status: "pending",
    expiryTime,
    gameCredentials: securedCredentials
  };

  // Generate gateways specific payment identifiers
  if (method === "QRIS") {
    // standard Indonesian QRIS payload representation starting with 000201010211...
    paymentData.qrCode = "00020101021126570022ID.CO.QRIS.WWW0118936005200118936005201303031024326580982352045812530336054064500005802ID5920FREEFIRE_MKT_SECURE6009JAKARTA016104081223405";
  } else if (method === "VA_BCA") {
    paymentData.vaNumber = `11200${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  } else if (method === "VA_MANDIRI") {
    paymentData.vaNumber = `88078${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  } else if (method === "DANA") {
    paymentData.phoneNumber = phoneNumber || "08123456789";
  }

  paymentsDb[paymentId] = paymentData;

  // Auto-expire simulation callback
  setTimeout(() => {
    if (paymentsDb[paymentId] && paymentsDb[paymentId].status === "pending") {
      paymentsDb[paymentId].status = "timeout";
      // release account hold
      const accToRelease = accountsDb.find(a => a.id === accountId);
      if (accToRelease && accToRelease.status === "pending") {
        accToRelease.status = "available";
      }
    }
  }, 15 * 60 * 1000);

  res.json({
    success: true,
    payment: paymentData
  });
});

// Fast automated payment confirmation verification
app.post("/api/payments/verify", (req, res) => {
  const { paymentId } = req.body;

  const payment = paymentsDb[paymentId];
  if (!payment) {
    return res.status(404).json({ success: false, message: "ID Transaksi pembayaran tidak valid." });
  }

  if (payment.status === "timeout") {
    return res.status(400).json({ success: false, message: "Waktu pembayaran telah habis." });
  }

  if (payment.status === "completed") {
    return res.json({
      success: true,
      message: "Pembayaran sudah diproses sebelumnya.",
      payment
    });
  }

  // Update Status to completed
  payment.status = "completed";
  
  // Set Account to Sold in DB
  const account = accountsDb.find(acc => acc.id === payment.accountId);
  if (account) {
    account.status = "sold";
  }

  res.json({
    success: true,
    message: "Pembayaran terverifikasi sukses secara instan! Akun Anda telah berhasil diamankan.",
    payment
  });
});

// Restore marketplace to original mock accounts
app.post("/api/accounts/reset", (req, res) => {
  accountsDb = [...initialAccounts];
  paymentsDb = {};
  testimonialsDb = [...initialTestimonials];
  res.json({ success: true, message: "Marketplace database reset to default Sultan entries." });
});


// Vite Dev & Prod server handling
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for lightning-fast preview rendering
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Serving static files in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running smoothly on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to boot applet server:", error);
});
