
export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number; // In Libyan Dinar
  cost: number;
  stock: number;
  category: string;
  expiryDate?: number; // Timestamp
}

export interface Customer {
  id: string;
  name: string;
  status: string;
  phone?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
}

export type PaymentMethod = 'Cash' | 'Bank Card' | 'Yusur Pay' | 'MobiCash' | 'Masrafy Pay' | 'Sahary Pay' | 'One Pay' | 'Transfer';

export interface Sale {
  id: string;
  items: CartItem[];
  total: number;
  date: number;
  paymentMethod: PaymentMethod;
  userName?: string; // Cashier name
  amountPaid?: number; // Amount given by customer
  change?: number; // Change returned to customer
}

export interface ReturnRecord {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  amount: number; // Value returned (price * qty)
  date: number;
  reason?: string;
}

export type UserRole = 'ADMIN' | 'CASHIER';

export interface User {
  id: string;
  name: string;
  password?: string;
  role: UserRole;
  createdAt: number;
}

export interface StoreSettings {
  id: 'settings';
  storeName: string;
  address: string;
  phone: string;
  description?: string; // New: Slogan or short desc
  isSetupComplete: boolean;
}

export type ViewState = 'SETUP' | 'LOGIN' | 'DASHBOARD' | 'INVENTORY' | 'POS' | 'REPORTS' | 'RETURNS' | 'SETTINGS' | 'USERS';
