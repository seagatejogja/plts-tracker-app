/**
 * Dashboard Home Page
 * Shows KPI cards, charts, and recent activity
 * Phase 5 will populate with real data — this is the placeholder layout
 */
"use client";

import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatNumber } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
} from "lucide-react";

/** Mock KPI data — will be replaced with API data in Phase 5 */
const MOCK_KPIS = {
  totalRevenue: 125_000_000,
  revenueChange: 12.5,
  grossProfit: 32_500_000,
  profitChange: 8.3,
  netProfit: 24_200_000,
  netProfitChange: -2.1,
  stockValue: 450_000_000,
  stockChangePercent: 5.0,
};

const MOCK_RECENT_TRANSACTIONS = [
  {
    id: "1",
    invoiceNumber: "INV-2504-001",
    installer: "PT Solar Prima",
    total: 45_000_000,
    status: "Lunas" as const,
    date: "24 Apr 2026",
  },
  {
    id: "2",
    invoiceNumber: "INV-2504-002",
    installer: "CV Energi Mandiri",
    total: 28_500_000,
    status: "Belum Bayar" as const,
    date: "22 Apr 2026",
  },
  {
    id: "3",
    invoiceNumber: "INV-2504-003",
    installer: "PT Sinar Jaya",
    total: 15_750_000,
    status: "Cicilan" as const,
    date: "20 Apr 2026",
  },
  {
    id: "4",
    invoiceNumber: "INV-2504-004",
    installer: "PT Solar Prima",
    total: 62_000_000,
    status: "Lunas" as const,
    date: "18 Apr 2026",
  },
  {
    id: "5",
    invoiceNumber: "INV-2503-015",
    installer: "CV Matahari Energy",
    total: 33_200_000,
    status: "Lunas" as const,
    date: "15 Apr 2026",
  },
];

const MOCK_CRITICAL_STOCK = [
  { product: "Panel Surya 450W Mono", remaining: 2, reorderPoint: 5, status: "Reorder" as const },
  { product: "Inverter 5kW Hybrid", remaining: 0, reorderPoint: 3, status: "Habis" as const },
  { product: "Baterai LiFePO4 5kWh", remaining: 1, reorderPoint: 3, status: "Reorder" as const },
];

/** Status badge variant colors */
const statusColors = {
  Lunas: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Cicilan: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Belum Bayar": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Reorder: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Habis: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang, <span className="font-medium text-foreground">{user?.name}</span>. 
          Berikut ringkasan bisnis Anda.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Revenue */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Penjualan Bulan Ini
            </CardTitle>
            <DollarSign className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(MOCK_KPIS.totalRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">
                +{MOCK_KPIS.revenueChange}%
              </span>
              <span className="text-xs text-muted-foreground">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        {/* Gross Profit */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Laba Kotor
            </CardTitle>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(MOCK_KPIS.grossProfit)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">
                +{MOCK_KPIS.profitChange}%
              </span>
              <span className="text-xs text-muted-foreground">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Laba Bersih
            </CardTitle>
            <ShoppingCart className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(MOCK_KPIS.netProfit)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingDown className="w-3 h-3 text-red-500" />
              <span className="text-xs text-red-500 font-medium">
                {MOCK_KPIS.netProfitChange}%
              </span>
              <span className="text-xs text-muted-foreground">vs bulan lalu</span>
            </div>
          </CardContent>
        </Card>

        {/* Stock Value */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-purple-500/10 to-transparent rounded-bl-full" />
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nilai Stok
            </CardTitle>
            <Package className="w-4 h-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(MOCK_KPIS.stockValue)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-xs text-emerald-500 font-medium">
                +{MOCK_KPIS.stockChangePercent}%
              </span>
              <span className="text-xs text-muted-foreground">aset tersedia</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row — Tables */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Recent Transactions */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Transaksi Terbaru</CardTitle>
            <CardDescription>5 transaksi jual terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_RECENT_TRANSACTIONS.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{tx.invoiceNumber}</span>
                    <span className="text-xs text-muted-foreground">
                      {tx.installer} · {tx.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {formatCurrency(tx.total)}
                    </span>
                    <Badge
                      variant="secondary"
                      className={statusColors[tx.status]}
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Critical Stock Alert */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              Stok Kritis
            </CardTitle>
            <CardDescription>Produk perlu restock segera</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {MOCK_CRITICAL_STOCK.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{item.product}</span>
                    <span className="text-xs text-muted-foreground">
                      Sisa: {formatNumber(item.remaining)} · Min: {formatNumber(item.reorderPoint)}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={statusColors[item.status]}
                  >
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
