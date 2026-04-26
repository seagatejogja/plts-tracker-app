"use client";

import { useEffect, useState, use } from "react";
import { ArrowLeft, Printer, AlertTriangle, FileText, Download } from "lucide-react";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function InvoiceDetailPage({ params }: { params: Promise<{ invoiceNumber: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  const resolvedParams = use(params);
  
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetch(`/api/sales/${resolvedParams.invoiceNumber}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setInvoice(data);
      })
      .catch((err) => toast.error(err.message || "Gagal memuat detail invoice"))
      .finally(() => setLoading(false));
  }, [resolvedParams.invoiceNumber]);

  const updatePaymentStatus = async (status: string) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/sales/${resolvedParams.invoiceNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: status }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      toast.success("Status pembayaran diperbarui");
      setInvoice({ ...invoice, paymentStatus: status });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
  };

  if (loading) {
    return <div className="flex justify-center p-12">Memuat detail invoice...</div>;
  }

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Invoice Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-6">Nomor invoice {resolvedParams.invoiceNumber} tidak ada di database.</p>
        <Button onClick={() => router.push("/transaksi")}>Kembali ke Daftar Transaksi</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/transaksi")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Detail Transaksi</h1>
            <p className="text-muted-foreground text-sm">Review dan print rincian invoice penjualan</p>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-sm font-medium">Status:</span>
            <Select 
              disabled={updating}
              value={invoice.paymentStatus} 
              onValueChange={updatePaymentStatus}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lunas">Lunas</SelectItem>
                <SelectItem value="Belum Bayar">Belum Bayar</SelectItem>
                <SelectItem value="Cicilan">Cicilan</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Invoice Document (Printable Area) */}
      <div className="bg-card border rounded-xl p-8 shadow-sm print:shadow-none print:border-none print:p-0">
        
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-primary tracking-tight">INVOICE</h2>
              <p className="text-muted-foreground">{invoice.invoiceNumber}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-lg mb-1">PLTS Supply Tracker (Internal)</div>
            <p className="text-sm text-muted-foreground">Jl. Contoh Surya No. 123</p>
            <p className="text-sm text-muted-foreground">Tanggal: {format(new Date(invoice.saleDate), "dd MMMM yyyy", { locale: localeID })}</p>
            <div className="mt-2 inline-block">
              <Badge variant="outline" className={`
                text-sm px-3 py-1 border-2 
                ${invoice.paymentStatus === 'Lunas' ? 'border-emerald-500 text-emerald-600' : ''}
                ${invoice.paymentStatus === 'Belum Bayar' ? 'border-red-500 text-red-600' : ''}
                ${invoice.paymentStatus === 'Cicilan' ? 'border-amber-500 text-amber-600' : ''}
              `}>
                {invoice.paymentStatus.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">Ditagihkan Kepada:</p>
            <p className="text-lg font-bold">{invoice.installer.name}</p>
            <p className="text-sm mt-1">PIC: {invoice.installer.picName || "-"}</p>
            <p className="text-sm">Telepon: {invoice.installer.phone || "-"}</p>
            <p className="text-sm">Kota: {invoice.installer.city || "-"}</p>
          </div>
          <div>
            {invoice.notes && (
              <>
                <p className="text-sm text-muted-foreground font-medium mb-1">Catatan:</p>
                <div className="text-sm bg-muted/30 p-3 rounded-lg border">
                  {invoice.notes}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow>
                <TableHead className="w-[50px] text-center">No</TableHead>
                <TableHead>Deskripsi Barang</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Harga Satuan</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.items.map((item: any, idx: number) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">{idx + 1}</TableCell>
                  <TableCell>
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-muted-foreground">
                      Kode: {item.productCode} | Batch: {item.batchNumber}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.qtySold}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.sellingPricePerUnit)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.totalRevenue)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Summary Footer */}
        <div className="flex justify-end border-t pt-6">
          <div className="w-full sm:w-1/2 md:w-1/3 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({invoice.summary.totalItems} item)</span>
              <span className="font-medium">{formatCurrency(invoice.summary.totalRevenue)}</span>
            </div>
            {/* If there were taxes/discounts, they would go here */}
            <div className="flex justify-between items-center border-t pt-3 mt-3">
              <span className="font-bold text-lg">Total Tagihan</span>
              <span className="font-bold text-2xl text-emerald-600 dark:text-emerald-500">
                {formatCurrency(invoice.summary.totalRevenue)}
              </span>
            </div>

            {/* Admin Only Profit Info - Hidden in Print */}
            {user?.role === "admin" && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900 print:hidden">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-2 uppercase tracking-wider">Internal Admin Info</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Proyeksi Gross Profit</span>
                  <span className="font-bold text-emerald-600">{formatCurrency(invoice.summary.totalGrossProfit)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground border-t pt-8">
          <p>Terima kasih atas kerjasama Anda dengan PLTS Supply Tracker.</p>
          <p>Dokumen ini dicetak otomatis oleh sistem.</p>
        </div>

      </div>
    </div>
  );
}
