"use client";

import { useEffect, useState } from "react";
import { Settings, Save, Percent, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [settings, setSettings] = useState({
    investor_share: "60",
    manager_share: "40",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setSettings(data);
      })
      .catch(err => toast.error(err.message))
      .finally(() => setFetching(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Total must be 100
    const total = parseInt(settings.investor_share) + parseInt(settings.manager_share);
    if (total !== 100) {
      toast.error("Total persentase harus 100%");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Pengaturan berhasil disimpan");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return <div className="p-8 text-center text-red-500">Akses Dibatasi. Hanya Admin yang dapat mengakses halaman ini.</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pengaturan Sistem</h1>
        <p className="text-muted-foreground text-sm">Konfigurasi parameter bisnis dan operasional</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="w-5 h-5 text-primary" />
              <CardTitle>Konfigurasi Bagi Hasil</CardTitle>
            </div>
            <CardDescription>Atur porsi pembagian keuntungan antara Investor dan Pengelola</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Porsi Investor (%)</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={settings.investor_share}
                  onChange={(e) => setSettings({ ...settings, investor_share: e.target.value })}
                  disabled={fetching}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Porsi Pengelola (%)</label>
                <Input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={settings.manager_share}
                  onChange={(e) => setSettings({ ...settings, manager_share: e.target.value })}
                  disabled={fetching}
                />
              </div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Perubahan ini akan langsung berdampak pada seluruh perhitungan laporan keuangan.
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading || fetching}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </form>
    </div>
  );
}
