"use client";

import { useEffect, useState } from "react";
import { Plus, Search, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/lib/auth-context";

export default function SalesTransactionPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
      const data = await res.json();
      setInvoices(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalItems(data.meta?.total || 0);
    } catch (error) {
      toast.error("Gagal mengambil histori transaksi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "Lunas":
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-none">Lunas</Badge>;
      case "Belum Bayar":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none">Belum Bayar</Badge>;
      case "Cicilan":
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-none">Cicilan</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daftar Transaksi</h1>
          <p className="text-muted-foreground text-sm">Histori faktur penjualan ke installer/mitra</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="w-full sm:w-auto" onClick={() => window.print()}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Link href="/transaksi/baru">
            <Button className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Buat Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari no invoice atau mitra..."
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
                <TableHead>Tgl Transaksi</TableHead>
                <TableHead>No. Invoice</TableHead>
                <TableHead>Mitra / Installer</TableHead>
                <TableHead className="text-center">Total Item</TableHead>
                <TableHead className="text-right">Total Penjualan</TableHead>
                <TableHead className="text-right">Gross Profit</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : invoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Belum ada histori transaksi.
                  </TableCell>
                </TableRow>
              ) : (
                invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(invoice.saleDate), "dd MMM yyyy", { locale: localeID })}
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{invoice.installerName}</div>
                      <div className="text-xs text-muted-foreground">{invoice.installerCity || "-"}</div>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {invoice.totalItems}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(invoice.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600 dark:text-emerald-500 font-medium">
                      {user?.role === "admin" ? formatCurrency(invoice.grossProfit) : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPaymentBadge(invoice.paymentStatus)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/transaksi/${invoice.invoiceNumber}`}>
                        <Button variant="ghost" size="sm" className="h-8">
                          <FileText className="h-4 w-4 mr-2 text-blue-500" />
                          Detail
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t bg-muted/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Menampilkan <span className="font-medium">{invoices.length}</span> dari <span className="font-medium">{totalItems}</span> invoice
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
