"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, PieChart, ArrowUpRight, ArrowDownRight, Wallet, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { toast } from "sonner";
import Link from "next/link";

export default function FinanceDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/finance/summary")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setData(data);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) return <div className="p-8 text-center">Memuat ringkasan keuangan...</div>;

  if (!data || !data.summary) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-muted-foreground">Gagal memuat data keuangan.</p>
        <Button onClick={() => window.location.reload()}>Coba Lagi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard Keuangan</h1>
          <p className="text-muted-foreground text-sm">Analisis profitabilitas dan tren performa bisnis</p>
        </div>
        <Link href="/keuangan/laporan">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            Laporan & Bagi Hasil
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-blue-50/30 border-blue-100 dark:bg-blue-950/10 dark:border-blue-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">Omzet Bulan Ini</CardTitle>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.revenue)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              Total pendapatan kotor
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50/30 border-amber-100 dark:bg-amber-950/10 dark:border-amber-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-amber-600 dark:text-amber-400">Gross Profit</CardTitle>
            <PieChart className="w-4 h-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.grossProfit)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Laba sebelum biaya operasional
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-50/30 border-red-100 dark:bg-red-950/10 dark:border-red-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-600 dark:text-red-400">Biaya Ops.</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(data.summary.opCost)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Biaya operasional bulan ini
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/30 border-emerald-100 dark:bg-emerald-950/10 dark:border-emerald-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Net Profit</CardTitle>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(data.summary.profit)}</div>
            <div className="flex items-center mt-1">
               <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 border-none text-[10px] h-5">
                 Margin {data.summary.margin.toFixed(1)}%
               </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Tren Performa 6 Bulan Terakhir</CardTitle>
          <CardDescription>Perbandingan Omzet dan Laba Kotor bulanan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    fontSize: '12px'
                  }}
                  formatter={(value: any) => [formatCurrency(Number(value) || 0), '']}
                />
                <Bar dataKey="revenue" name="Omzet" radius={[4, 4, 0, 0]} fill="#3b82f6" barSize={30} />
                <Bar dataKey="profit" name="Profit" radius={[4, 4, 0, 0]} fill="#10b981" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>Omzet</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded bg-emerald-500" />
              <span>Net Profit</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper components for Card and Badge (assuming standard shadcn)
function Badge({ className, children }: any) {
  return (
    <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
