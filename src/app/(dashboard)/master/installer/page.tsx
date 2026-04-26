"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
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
import { InstallerForm } from "@/components/features/master/installer-form";
import { toast } from "sonner";

export default function InstallerPage() {
  const [installers, setInstallers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [selectedInstaller, setSelectedInstaller] = useState<any | null>(null);

  const fetchInstallers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/installers?search=${encodeURIComponent(search)}&page=${page}&limit=10`);
      const data = await res.json();
      setInstallers(data.data || []);
      setTotalPages(data.meta?.totalPages || 1);
      setTotalItems(data.meta?.total || 0);
    } catch (error) {
      toast.error("Gagal mengambil data installer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstallers();
  }, [search, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus installer ini?")) return;
    
    try {
      const res = await fetch(`/api/installers/${id}`, { method: "DELETE" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menghapus");
      
      toast.success(data.message || "Installer berhasil dihapus");
      fetchInstallers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const openAddForm = () => {
    setSelectedInstaller(null);
    setFormOpen(true);
  };

  const openEditForm = (installer: any) => {
    setSelectedInstaller(installer);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Master Installer</h1>
          <p className="text-muted-foreground text-sm">Kelola data mitra installer dan skema harga</p>
        </div>
        <Button onClick={openAddForm} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Installer
        </Button>
      </div>

      {/* Metrics / Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-muted-foreground font-medium">Total Mitra Aktif</p>
          <p className="text-2xl font-bold mt-1">{installers.length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-muted-foreground font-medium">Mitra Reguler (B)</p>
          <p className="text-2xl font-bold mt-1">{installers.filter(i => i.priceScheme?.includes("Harga B")).length}</p>
        </div>
        <div className="bg-card border rounded-lg p-4 shadow-sm">
          <p className="text-sm text-muted-foreground font-medium">Grosir Besar (A)</p>
          <p className="text-2xl font-bold mt-1">{installers.filter(i => i.priceScheme?.includes("Harga A")).length}</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari kode, nama, atau kota..."
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
                <TableHead className="w-[100px]">Kode</TableHead>
                <TableHead>Nama Mitra</TableHead>
                <TableHead>Kontak & PIC</TableHead>
                <TableHead>Kota</TableHead>
                <TableHead>Skema Harga</TableHead>
                <TableHead className="text-right w-[100px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Memuat data...
                  </TableCell>
                </TableRow>
              ) : installers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    Tidak ada installer yang ditemukan.
                  </TableCell>
                </TableRow>
              ) : (
                installers.map((installer) => (
                  <TableRow key={installer.id}>
                    <TableCell className="font-medium">{installer.code}</TableCell>
                    <TableCell>
                      <div className="font-medium">{installer.name}</div>
                      {installer.notes && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate max-w-[200px]">{installer.notes}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{installer.picName || "-"}</div>
                      <div className="text-xs text-muted-foreground">{installer.phone || "-"}</div>
                    </TableCell>
                    <TableCell>{installer.city || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {installer.priceScheme}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditForm(installer)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => handleDelete(installer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
            Menampilkan <span className="font-medium">{installers.length}</span> dari <span className="font-medium">{totalItems}</span> installer
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

      <InstallerForm 
        open={formOpen} 
        onOpenChange={setFormOpen}
        initialData={selectedInstaller}
        onSuccess={() => {
          setFormOpen(false);
          fetchInstallers();
        }}
      />
    </div>
  );
}
