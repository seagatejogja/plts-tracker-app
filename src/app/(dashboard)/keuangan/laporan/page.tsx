"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Printer, FileText, Download, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function FinancialReportPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  
  // Date selection state
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Operational expense state
  const [opAmount, setOpAmount] = useState<string>("0");
  const [opNotes, setOpNotes] = useState<string>("");
  const [isSavingOp, setIsSavingOp] = useState(false);

  const months = [
    { value: 1, label: "Januari" }, { value: 2, label: "Februari" }, { value: 3, label: "Maret" },
    { value: 4, label: "April" }, { value: 5, label: "Mei" }, { value: 6, label: "Juni" },
    { value: 7, label: "Juli" }, { value: 8, label: "Agustus" }, { value: 9, label: "September" },
    { value: 10, label: "Oktober" }, { value: 11, label: "November" }, { value: 12, label: "Desember" }
  ];

  const years = [2024, 2025, 2026];

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/finance/report?month=${month}&year=${year}`);
      const result = await res.json();
      if (result.error) throw new Error(result.error);
      setData(result);
      setOpAmount(result.operationalExpense?.toString() || "0");
      // Fetch expense notes specifically if needed or if returned by report API
      // Since I didn't return notes in report API, let's fetch it separately if needed
      // Actually, I'll just return it in report API to be simpler.
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExpense = async () => {
    setIsSavingOp(true);
    try {
      const res = await fetch("/api/finance/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          year,
          amount: parseFloat(opAmount) || 0,
          notes: opNotes,
          createdBy: user?.id
        })
      });
      if (!res.ok) throw new Error("Gagal menyimpan biaya");
      toast.success("Biaya operasional berhasil disimpan");
      fetchReport(); // Refresh calculations
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingOp(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [month, year]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/keuangan")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Rekap & Bagi Hasil</h1>
            <p className="text-muted-foreground text-sm">Laporan performa bulanan dan distribusi laba</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={month.toString()} onValueChange={(v) => setMonth(parseInt(v || "1"))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => <SelectItem key={m.value} value={m.value.toString()}>{m.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={year.toString()} onValueChange={(v) => setYear(parseInt(v || "2025"))}>
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">Menghitung laporan bulanan...</div>
      ) : data ? (
        <div className="space-y-6">
          
          {/* Main Report Document */}
          <Card className="shadow-sm border-none sm:border print:shadow-none print:border-none">
            <CardHeader className="border-b bg-muted/10 print:bg-transparent">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    LAPORAN PERFORMA BULANAN
                  </CardTitle>
                  <CardDescription className="text-base">
                    Periode: {months.find(m => m.value === month)?.label} {year}
                  </CardDescription>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">PLTS Supply Tracker</p>
                  <p className="text-xs text-muted-foreground">ID Laporan: {year}{month.toString().padStart(2, '0')}-FIN</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              
              {/* Overall Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 border-b pb-8">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Total Omzet</p>
                  <p className="text-xl font-bold">{formatCurrency(data.totalRevenue)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Gross Profit</p>
                  <p className="text-xl font-bold text-blue-600">{formatCurrency(data.totalProfit)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Biaya Op.</p>
                  <p className="text-xl font-bold text-red-500">-{formatCurrency(data.operationalExpense)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase">Net Profit</p>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(data.netProfit)}</p>
                </div>
              </div>

              {/* Breakdown Table */}
              <div className="space-y-4">
                <h3 className="font-bold flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Rincian Penjualan per Kategori
                </h3>
                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>Kategori Produk</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Penjualan</TableHead>
                        <TableHead className="text-right">Gross Profit</TableHead>
                        <TableHead className="text-right">Margin</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.categories.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Tidak ada transaksi di periode ini.</TableCell>
                        </TableRow>
                      ) : data.categories.map((cat: any) => (
                        <TableRow key={cat.category}>
                          <TableCell className="font-medium">{cat.category}</TableCell>
                          <TableCell className="text-center">{cat.items}</TableCell>
                          <TableCell className="text-right">{formatCurrency(cat.revenue)}</TableCell>
                          <TableCell className="text-right font-medium text-emerald-600">{formatCurrency(cat.profit)}</TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {((cat.profit / cat.revenue) * 100).toFixed(1)}%
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Operational Expense Input */}
              <div className="bg-muted/30 p-6 rounded-xl border space-y-4 print:hidden">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-500" />
                    Biaya Operasional Bulanan
                  </h3>
                  <Badge variant="outline" className="bg-background">Manual Input</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Total Biaya (Rp)</p>
                    <Input 
                      type="number" 
                      placeholder="Gaji, Listrik, Sewa, dll" 
                      value={opAmount}
                      onChange={(e) => setOpAmount(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Catatan / Rincian</p>
                    <Input 
                      placeholder="Contoh: Gaji 2 org, Listrik, Internet" 
                      value={opNotes}
                      onChange={(e) => setOpNotes(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button size="sm" onClick={handleSaveExpense} disabled={isSavingOp}>
                    {isSavingOp ? "Menyimpan..." : "Update Biaya & Kalkulasi"}
                  </Button>
                </div>
              </div>

              {/* Profit Sharing Calculation */}
              <div className="space-y-4 pt-4">
                <h3 className="font-bold flex items-center gap-2">
                  <Download className="w-4 h-4 text-purple-500" />
                  Distribusi Bagi Hasil (Estimasi)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-purple-50 dark:bg-purple-950/20 border-2 border-purple-100 dark:border-purple-900/50 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <FileText className="w-16 h-16" />
                    </div>
                    <p className="text-sm font-bold text-purple-700 dark:text-purple-400 mb-4">PORSI INVESTOR ({data.sharing.investorRate}%)</p>
                    <p className="text-3xl font-extrabold text-purple-800 dark:text-purple-300">
                      {formatCurrency(data.sharing.investorAmount)}
                    </p>
                    <p className="text-xs text-purple-600/80 mt-2">Dihitung dari Net Profit (Gross - Op.)</p>
                  </div>

                  <div className="p-6 bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-100 dark:border-blue-900/50 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <TrendingUp className="w-16 h-16" />
                    </div>
                    <p className="text-sm font-bold text-blue-700 dark:text-blue-400 mb-4">PORSI PENGELOLA ({data.sharing.managerRate}%)</p>
                    <p className="text-3xl font-extrabold text-blue-800 dark:text-blue-300">
                      {formatCurrency(data.sharing.managerAmount)}
                    </p>
                    <p className="text-xs text-blue-600/80 mt-2">Porsi sisa setelah bagian investor</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 text-center text-[10px] text-muted-foreground border-t pt-6 hidden print:block">
                Dokumen ini merupakan laporan internal otomatis yang dihasilkan oleh PLTS Supply Tracker pada {format(new Date(), "dd/MM/yyyy HH:mm")}.
              </div>

            </CardContent>
          </Card>

        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground border rounded-xl bg-muted/5">Pilih periode untuk melihat laporan.</div>
      )}
    </div>
  );
}
