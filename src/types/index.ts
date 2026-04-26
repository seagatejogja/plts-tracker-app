/**
 * TypeScript Type Definitions
 * Shared types for PLTS Supply Tracker
 */

import type { UserRole } from "@/lib/constants";

/** Authenticated user session */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/** Auth context state */
export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/** API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Navigation item type */
export interface NavItem {
  title: string;
  href?: string;
  icon: string;
  roles: readonly string[];
  children?: NavItem[];
}

/** Stock balance (aggregated view) */
export interface StockBalance {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  totalIn: number;
  totalSold: number;
  remaining: number;
  reorderPoint: number;
  status: "Aman" | "Reorder" | "Habis";
  stockValue: number;
}

/** Dashboard KPI data */
export interface DashboardKPIs {
  totalRevenueThisMonth: number;
  totalGrossProfitThisMonth: number;
  netProfitThisMonth: number;
  totalStockValue: number;
  revenueChange: number;
  profitChange: number;
}

/** Monthly report row */
export interface MonthlyReport {
  yearMonth: string;
  totalRevenue: number;
  totalHpp: number;
  grossProfit: number;
  operationalCost: number;
  netProfit: number;
  margin: number;
  isFinalized: boolean;
}

/** Batch with remaining stock */
export interface BatchWithStock {
  id: string;
  batchNumber: string;
  productId: string;
  productName: string;
  supplierName: string;
  entryDate: string;
  qtyIn: number;
  qtySold: number;
  remaining: number;
  hppPerUnit: number;
  totalHpp: number;
  status: "Tersisa" | "Habis";
}
