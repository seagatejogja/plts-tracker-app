"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

const itemSchema = z.object({
  batchId: z.string().min(1, "Batch wajib dipilih"),
  productId: z.string(), // Hidden field, set automatically from batch
  qtySold: z.number().min(1, "Minimal 1"),
  sellingPricePerUnit: z.number().min(0, "Harga minimal 0"),
});

const formSchema = z.object({
  invoiceNumber: z.string().min(3, "No Invoice wajib diisi"),
  saleDate: z.string().min(1, "Tanggal wajib diisi"),
  installerId: z.string().min(1, "Mitra wajib dipilih"),
  paymentStatus: z.string().min(1, "Status pembayaran wajib dipilih"),
  notes: z.string().optional(),
  items: z.array(itemSchema).min(1, "Minimal 1 item barang"),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewTransactionPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [installers, setInstallers] = useState<any[]>([]);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);

  // Generate a default invoice number
  const generateDefaultInvoiceNumber = () => {
    const yymmdd = format(new Date(), "yyMMdd");
    const rnd = Math.floor(1000 + Math.random() * 9000);
    return `INV-${yymmdd}-${rnd}`;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      invoiceNumber: generateDefaultInvoiceNumber(),
      saleDate: format(new Date(), "yyyy-MM-dd"),
      installerId: "",
      paymentStatus: "Belum Bayar",
      notes: "",
      items: [{ batchId: "", productId: "", qtySold: 1, sellingPricePerUnit: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    // Fetch Installers
    fetch("/api/installers?limit=100") // Increase limit for dropdown
      .then(res => res.json())
      .then(resData => {
        if (resData.data && Array.isArray(resData.data)) {
          setInstallers(resData.data);
        } else if (Array.isArray(resData)) {
          setInstallers(resData);
        }
      })
      .catch(() => toast.error("Gagal memuat data mitra"));

    // Fetch Available Batches
    fetch("/api/batches/available")
      .then(res => res.json())
      .then(data => setAvailableBatches(data))
      .catch(() => toast.error("Gagal memuat data stok"));
  }, []);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await fetch("/api/sales/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, createdBy: user?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal menyimpan transaksi");
      }

      toast.success("Transaksi berhasil dicatat");
      router.push("/transaksi");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
  };

  // Kalkulasi Total Real-time
  const watchItems = form.watch("items");
  const totalInvoice = watchItems.reduce((sum, item) => sum + ((item.qtySold || 0) * (item.sellingPricePerUnit || 0)), 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Buat Invoice Baru</h1>
          <p className="text-muted-foreground text-sm">Catat transaksi penjualan multi-item ke mitra installer</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Header Section */}
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="font-semibold text-lg border-b pb-2 mb-4">Informasi Umum</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Faktur (Invoice)</FormLabel>
                    <FormControl>
                      <Input placeholder="INV-..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="saleDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Transaksi</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="installerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mitra Installer</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Pilih Mitra --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {installers.map((inst) => (
                          <SelectItem key={inst.id} value={inst.id}>
                            {inst.code} - {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="paymentStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status Pembayaran</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="-- Pilih Status --" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Lunas">Lunas</SelectItem>
                        <SelectItem value="Belum Bayar">Belum Bayar</SelectItem>
                        <SelectItem value="Cicilan">Cicilan / Termin</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Catatan tambahan untuk transaksi ini..." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Items Section */}
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2 mb-4">
              <h2 className="font-semibold text-lg">Detail Item Penjualan</h2>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => append({ batchId: "", productId: "", qtySold: 1, sellingPricePerUnit: 0 })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Tambah Item
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-end p-4 bg-muted/20 border rounded-lg relative">
                
                <div className="col-span-12 md:col-span-5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.batchId`}
                    render={({ field: selectField }) => (
                      <FormItem>
                        <FormLabel>Pilih Produk (Dari Batch Stok)</FormLabel>
                        <Select 
                          onValueChange={(val) => {
                            selectField.onChange(val);
                            // Auto-set productId based on batch
                            const batch = availableBatches.find(b => b.id === val);
                            if (batch) {
                              form.setValue(`items.${index}.productId`, batch.productId);
                            }
                          }} 
                          defaultValue={selectField.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="-- Pilih Produk & Batch --" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableBatches.map((batch) => (
                              <SelectItem key={batch.id} value={batch.id}>
                                {batch.productCode} - {batch.productName} | Sisa Stok: {batch.availableStock}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.qtySold`}
                    render={({ field: qtyField }) => (
                      <FormItem>
                        <FormLabel>Qty</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="1" 
                            {...qtyField} 
                            onChange={(e) => qtyField.onChange(Number(e.target.value))}
                            value={qtyField.value} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6 md:col-span-4">
                  <FormField
                    control={form.control}
                    name={`items.${index}.sellingPricePerUnit`}
                    render={({ field: priceField }) => (
                      <FormItem>
                        <FormLabel>Harga Jual / Unit (Rp)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            step="1000" 
                            {...priceField} 
                            onChange={(e) => priceField.onChange(Number(e.target.value))}
                            value={priceField.value} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center">
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
                
                {/* Subtotal Row */}
                <div className="col-span-12 text-right mt-2 text-sm text-muted-foreground">
                  Subtotal: <span className="font-medium text-foreground">{formatCurrency((watchItems[index]?.qtySold || 0) * (watchItems[index]?.sellingPricePerUnit || 0))}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Grand Total & Submit */}
          <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Nilai Invoice</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">
                {formatCurrency(totalInvoice)}
              </p>
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={loading}>
              {loading ? "Menyimpan..." : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Simpan Transaksi
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
