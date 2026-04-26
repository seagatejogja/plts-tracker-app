"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const formSchema = z.object({
  batchNumber: z.string().min(3, "Nomor batch wajib diisi"),
  productId: z.string().min(1, "Produk wajib dipilih"),
  supplierName: z.string().min(2, "Nama supplier wajib diisi"),
  entryDate: z.string().min(1, "Tanggal masuk wajib diisi"),
  qtyIn: z.coerce.number().min(1, "Jumlah masuk minimal 1"),
  hppPerUnit: z.coerce.number().min(0, "HPP minimal 0"),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
  onSuccess: () => void;
}

export function BatchForm({ open, onOpenChange, initialData, onSuccess }: BatchFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);

  // Format today as YYYY-MM-DD for default date input
  const today = format(new Date(), "yyyy-MM-dd");

  // Generate a default batch number for new entry
  const generateDefaultBatchNumber = () => {
    const d = new Date();
    const yymmdd = format(d, "yyMMdd");
    const rnd = Math.floor(100 + Math.random() * 900);
    return `BCH-${yymmdd}-${rnd}`;
  };

  const form = useForm<z.input<typeof formSchema>, any, z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      batchNumber: initialData?.batchNumber || generateDefaultBatchNumber(),
      productId: initialData?.productId || "",
      supplierName: initialData?.supplierName || "",
      entryDate: initialData?.entryDate ? format(new Date(initialData.entryDate), "yyyy-MM-dd") : today,
      qtyIn: initialData?.qtyIn || 1,
      hppPerUnit: initialData?.hppPerUnit || 0,
      notes: initialData?.notes || "",
    },
  });

  // Watch values for computed field
  const qtyIn = form.watch("qtyIn");
  const hppPerUnit = form.watch("hppPerUnit");
  const totalHpp = (Number(qtyIn) || 0) * (Number(hppPerUnit) || 0);

  // Fetch active products for dropdown
  useEffect(() => {
    if (open) {
      fetch("/api/products?limit=100") // Increase limit for dropdown
        .then(res => res.json())
        .then(resData => {
          if (resData.data && Array.isArray(resData.data)) {
            setProducts(resData.data);
          } else if (Array.isArray(resData)) {
            setProducts(resData);
          }
        })
        .catch(err => console.error("Failed to load products", err));
        
      if (!initialData) {
        form.reset({
          batchNumber: generateDefaultBatchNumber(),
          productId: "",
          supplierName: "",
          entryDate: today,
          qtyIn: 1,
          hppPerUnit: 0,
          notes: "",
        });
      } else {
        form.reset({
          batchNumber: initialData.batchNumber,
          productId: initialData.productId,
          supplierName: initialData.supplierName,
          entryDate: format(new Date(initialData.entryDate), "yyyy-MM-dd"),
          qtyIn: initialData.qtyIn,
          hppPerUnit: initialData.hppPerUnit,
          notes: initialData.notes || "",
        });
      }
    }
  }, [open, initialData, form, today]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const url = initialData ? `/api/batches/${initialData.id}` : "/api/batches";
      const method = initialData ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, createdBy: user?.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Terjadi kesalahan");
      }

      toast.success(initialData ? "Batch berhasil diperbarui" : "Batch berhasil dicatat");
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Batch Masuk" : "Catat Batch Barang Masuk"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit((values) => onSubmit(values as FormValues))} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="batchNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. Batch</FormLabel>
                    <FormControl>
                      <Input placeholder="BCH-..." disabled={!!initialData} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tanggal Masuk</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pilih Produk</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={!!initialData}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="-- Pilih Produk --" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>Pilih produk yang sesuai, jika belum ada buat di Master Produk.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="supplierName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Supplier / Toko</FormLabel>
                  <FormControl>
                    <Input placeholder="Toko ABC / Distributor XYZ" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg border">
              <FormField
                control={form.control}
                name="qtyIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Qty (Jumlah Masuk)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} value={field.value as string | number} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="hppPerUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Beli per Unit (Rp)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1000" {...field} value={field.value as string | number} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="col-span-2 pt-2 flex items-center justify-between border-t mt-2">
                <span className="text-sm font-medium">Total Nilai Batch:</span>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-500">
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(totalHpp)}
                </span>
              </div>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (Opsional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Kondisi barang, garansi, dll." 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Menyimpan..." : "Simpan Batch"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
