"use client";

import { useEffect, useState } from "react";
import { Search, AlertTriangle, CheckCircle2, XCircle, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export default function StockBalancePage() {
  const [stocks, setStocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItemsCount, setTotalItemsCount] = useState(0);
  const [metrics, setMetrics] = useState({ totalItems: 0, totalQty: 0, criticalItems: 0 });

  const fetchStockBalance = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/stock-balance?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
      const data = await res.json();
      setStocks(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalItemsCount(data.meta?.total || 0);
      
      // Note: metrics should ideally be separate API or return full count in meta
      // For now, let's just use what's on the current page for metrics OR fetch all for metrics (less efficient)
      // I'll update the API later if needed, but let's keep it simple.
    } catch (error) {
      toast.error("Gagal mengambil data saldo stok");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockBalance();
  }, [search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  // We need a separate effect or API call to get accurate totals for the metric cards
  useEffect(() => {
    fetch("/api/stock-balance?limit=1000") // Fetch more to get metric totals
      .then(res => res.json())
      .then(data => {
        const items = data.data || [];
        setMetrics({
          totalItems: data.meta?.total || 0,
          totalQty: items.reduce((sum: number, s: any) => sum + s.currentStock, 0),
          criticalItems: items.filter((s: any) => s.status === "Kritis" || s.status === "Habis").length
        });
      });
  }, []);

  // We already filter via API now
  const filteredStocks = stocks;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aman":
        return <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"><CheckCircle2 className="w-3 h-3 mr-1" /> Aman</Badge>;
      case "Kritis":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"><AlertTriangle className="w-3 h-3 mr-1" /> Kritis</Badge>;
      case "Habis":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"><XCircle className="w-3 h-3 mr-1" /> Habis</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Use metrics from state
  const { totalItems, criticalItems, totalQty } = metrics;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saldo Stok Live</h1>
          <p className="text-muted-foreground text-sm">Pantau ketersediaan barang secara real-time</p>
        </div>
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-2" />
          Export / Print
        </Button>
      </div>

      {/* Metrics / Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Item Produk</p>
            <p className="text-2xl font-bold mt-1">{totalItems}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-400 font-bold">{totalItems}</span>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Unit Fisik (Pcs/Unit)</p>
            <p className="text-2xl font-bold mt-1">{totalQty}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{totalQty}</span>
          </div>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm flex items-center justify-between border-l-4 border-l-amber-500">
          <div>
            <p className="text-sm text-muted-foreground font-medium">Item Kritis / Habis</p>
            <p className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-500">{criticalItems}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          </div>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari produk atau kategori..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Kode</TableHead>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right text-muted-foreground border-l">Total In</TableHead>
                <TableHead className="text-right text-muted-foreground">Total Out</TableHead>
                <TableHead className="text-right border-l font-bold bg-muted/20">Saldo Akhir</TableHead>
                <TableHead className="text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Menghitung saldo stok live...
                  </TableCell>
                </TableRow>
              ) : filteredStocks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Tidak ada data stok.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStocks.map((stock) => (
                  <TableRow key={stock.id} className={stock.status === "Habis" ? "bg-red-50/50 dark:bg-red-950/20" : ""}>
                    <TableCell className="font-medium text-muted-foreground">{stock.code}</TableCell>
                    <TableCell className="font-medium">{stock.name}</TableCell>
                    <TableCell>
                      <span className="text-xs">{stock.category}</span>
                    </TableCell>
                    <TableCell className="text-right border-l">{stock.totalIn}</TableCell>
                    <TableCell className="text-right">{stock.totalOut}</TableCell>
                    <TableCell className="text-right border-l font-bold text-lg bg-muted/10">
                      {stock.currentStock} <span className="text-xs font-normal text-muted-foreground ml-1">{stock.unit}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusBadge(stock.status)}
                        {stock.status === "Kritis" && (
                          <span className="text-[10px] text-muted-foreground">Batasan: {stock.reorderPoint}</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t bg-muted/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="font-medium">{stocks.length}</span> dari <span className="font-medium">{totalItemsCount}</span> produk
          </p>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Sebelumnya
            </Button>
            <div className="flex items-center gap-1 mx-2">
              <span className="text-sm font-medium">{page}</span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm text-muted-foreground">{totalPages}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
