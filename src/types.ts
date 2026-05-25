/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FreeFireAccount {
  id: string;
  title: string;
  level: number;
  price: number;
  rank: string;
  sellerName: string;
  badgeCount: number;
  winRate: number;
  characters: string[];
  skins: string[];
  evoGuns: number;
  verified: boolean;
  verificationScore: number;
  verificationDetails: string;
  imageUrl: string;
  status: 'available' | 'pending' | 'sold';
  createdAt: string;
  loginMethod: 'Facebook' | 'VK' | 'Google' | 'Huawei';
  hasElitePass: boolean;
}

export interface PaymentDetails {
  paymentId: string;
  accountId: string;
  amount: number;
  method: 'QRIS' | 'VA_BCA' | 'VA_MANDIRI' | 'DANA';
  status: 'pending' | 'completed' | 'timeout' | 'failed';
  qrCode?: string;
  vaNumber?: string;
  phoneNumber?: string;
  expiryTime: string;
  gameCredentials?: {
    email: string;
    pass: string;
    backupCodes?: string;
  };
}

export interface Transaction {
  id: string;
  accountId: string;
  accountTitle: string;
  buyerEmail: string;
  amount: number;
  status: 'pending' | 'completed';
  paymentMethod: string;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  rating: number;
  message: string;
  imageUrl?: string;
  date: string;
  verifiedPurchase: boolean;
  itemPurchased?: string;
}

