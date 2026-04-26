"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BatchForm } from "@/components/features/stok/batch-form";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function StockBatchPage() {
  const { user } = useAuth();
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<any | null>(null);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/batches?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
      const data = await res.json();
      setBatches(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalItems(data.meta?.total || 0);
    } catch (error) {
      toast.error("Gagal mengambil data batch masuk");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, [search, page]);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus batch ini? Ini bisa mempengaruhi perhitungan stok jika barang sudah terjual.")) return;
    
    try {
      const res = await fetch(`/api/batches/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      
      toast.success(data.message || "Batch berhasil dihapus");
      fetchBatches();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openAddForm = () => {
    setSelectedBatch(null);
    setFormOpen(true);
  };

  const openEditForm = (batch: any) => {
    setSelectedBatch(batch);
    setFormOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Batch Barang Masuk</h1>
          <p className="text-muted-foreground text-sm">Catat setiap stok baru untuk mengunci HPP (Harga Pokok Penjualan)</p>
        </div>
        <Button onClick={openAddForm} className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Catat Barang Masuk
        </Button>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari no. batch, supplier, atau nama produk..."
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
                <TableHead>Tgl Masuk</TableHead>
                <TableHead>No. Batch</TableHead>
                <TableHead>Produk</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Qty Masuk</TableHead>
                <TableHead className="text-right">HPP/Unit</TableHead>
                <TableHead className="text-right">Total Nilai</TableHead>
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
              ) : batches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                    Tidak ada data batch yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                batches.map((batch) => (
                  <TableRow key={batch.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(new Date(batch.entryDate), "dd MMM yyyy", { locale: localeID })}
                    </TableCell>
                    <TableCell className="font-medium text-amber-600 dark:text-amber-500">
                      {batch.batchNumber}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{batch.product?.name}</div>
                      <div className="text-xs text-muted-foreground">{batch.product?.code}</div>
                    </TableCell>
                    <TableCell>{batch.supplierName}</TableCell>
                    <TableCell className="text-right font-bold">
                      {batch.qtyIn} {batch.product?.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(batch.hppPerUnit)}
                    </TableCell>
                    <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-500">
                      {formatCurrency(batch.totalHpp)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Note: Edit might be restricted if it has sales, but we'll show it and let API handle validation if needed */}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(batch)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        {user?.role === "admin" && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDelete(batch.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
            Menampilkan <span className="font-medium">{batches.length}</span> dari <span className="font-medium">{totalItems}</span> batch barang masuk
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

      <BatchForm 
        open={formOpen} 
        onOpenChange={setFormOpen}
        initialData={selectedBatch}
        onSuccess={() => {
          setFormOpen(false);
          fetchBatches();
        }}
      />
    </div>
  );
}
