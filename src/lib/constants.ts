/**
 * Application Constants
 * Centralized configuration values for PLTS Supply Tracker
 */

/** Application metadata */
export const APP_NAME = "PLTS Supply Tracker";
export const APP_DESCRIPTION =
  "Sistem manajemen stok, penjualan, dan bagi hasil untuk usaha supply produk PLTS";

/** User roles */
export const ROLES = {
  ADMIN: "admin",
  MITRA: "mitra",
  OPERATOR: "operator",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

/** Role display labels */
export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin / Pengelola",
  mitra: "Mitra / Investor",
  operator: "Operator / Staf",
};

/** Product categories */
export const PRODUCT_CATEGORIES = [
  "Panel Surya",
  "Inverter",
  "Baterai",
  "Controller",
  "Mounting",
  "Kabel & Konektor",
  "Aksesoris",
  "Lainnya",
] as const;

/** Product units */
export const PRODUCT_UNITS = [
  "pcs",
  "unit",
  "set",
  "meter",
  "roll",
  "pack",
] as const;

/** Payment statuses */
export const PAYMENT_STATUSES = [
  "Lunas",
  "Cicilan",
  "Belum Bayar",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Payment status colors for badges */
export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  Lunas: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Cicilan: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Belum Bayar": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

/** Stock status thresholds */
export const STOCK_STATUS = {
  SAFE: "Aman",
  REORDER: "Reorder",
  OUT: "Habis",
} as const;

export type StockStatus = (typeof STOCK_STATUS)[keyof typeof STOCK_STATUS];

/** Stock status badge colors */
export const STOCK_STATUS_COLORS: Record<StockStatus, string> = {
  Aman: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Reorder: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Habis: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

/** Price schemes for installers */
export const PRICE_SCHEMES = ["Harga A", "Harga B", "Harga C"] as const;

/** Navigation items — role-based visibility */
export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
    roles: ["admin", "mitra", "operator"],
  },
  {
    title: "Stok",
    icon: "Package",
    roles: ["admin", "operator", "mitra"],
    children: [
      {
        title: "Batch Masuk",
        href: "/stok/batch-masuk",
        roles: ["admin", "operator"],
      },
      {
        title: "Saldo Stok",
        href: "/stok/saldo",
        roles: ["admin", "mitra", "operator"],
      },
    ],
  },
  {
    title: "Transaksi",
    icon: "ShoppingCart",
    roles: ["admin", "operator"],
    children: [
      {
        title: "Daftar Transaksi",
        href: "/transaksi",
        roles: ["admin", "operator"],
      },
      {
        title: "Tambah Transaksi",
        href: "/transaksi/baru",
        roles: ["admin", "operator"],
      },
    ],
  },
  {
    title: "Keuangan",
    icon: "Wallet",
    roles: ["admin", "mitra"],
    children: [
      {
        title: "Dashboard Keuangan",
        href: "/keuangan",
        roles: ["admin", "mitra"],
      },
      {
        title: "Rekap & Bagi Hasil",
        href: "/keuangan/laporan",
        roles: ["admin", "mitra"],
      },
    ],
  },
  {
    title: "Master Data",
    icon: "Database",
    roles: ["admin"],
    children: [
      { title: "Produk", href: "/master/produk", roles: ["admin"] },
      { title: "Installer", href: "/master/installer", roles: ["admin"] },
    ],
  },
  {
    title: "Pengaturan",
    href: "/settings",
    icon: "Settings",
    roles: ["admin"],
  },
] as const;

/** Currency formatter (Indonesian Rupiah) */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Number formatter */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}

/** Date formatter (Indonesian locale) */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Short date formatter */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
