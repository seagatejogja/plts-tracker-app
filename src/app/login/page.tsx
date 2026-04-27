/**
 * Login Page
 * Authentication form with solar-themed design
 * Route: /login
 */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Zap, Eye, EyeOff, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  /**
   * Handle form submission
   * Validates input and calls auth login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Client-side validation
    if (!email.trim()) {
      setError("Email wajib diisi");
      return;
    }
    if (!password) {
      setError("Password wajib diisi");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(email.trim(), password);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Quick login for development testing
   */
  const handleQuickLogin = async (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setIsSubmitting(true);
    setError("");
    try {
      const result = await login(e, p);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orb top-right */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        {/* Gradient orb bottom-left */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md mx-4 bg-white/5 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="text-center pb-2">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold text-white">
            PLTS Supply Tracker
          </CardTitle>
          <CardDescription className="text-slate-400">
            Masuk ke dashboard untuk mengelola stok & penjualan
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@plts-tracker.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-amber-500/20 pr-10"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold shadow-lg shadow-amber-500/25 transition-all duration-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>

            {/* Demo credentials interactive switcher */}
            <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 text-center mb-3 font-bold">
                Akses Cepat (Dev Mode)
              </p>
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("admin@plts-tracker.com", "admin123")}
                  className="justify-start bg-slate-900/50 border-amber-500/20 hover:bg-amber-500/10 hover:border-amber-500/40 text-slate-300 text-xs h-9"
                  disabled={isSubmitting}
                >
                  <Zap className="w-3.5 h-3.5 mr-2 text-amber-500" />
                  Login sebagai <span className="text-amber-500 ml-1 font-bold">Admin</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("mitra@plts-tracker.com", "mitra123")}
                  className="justify-start bg-slate-900/50 border-orange-500/20 hover:bg-orange-500/10 hover:border-orange-500/40 text-slate-300 text-xs h-9"
                  disabled={isSubmitting}
                >
                  <Zap className="w-3.5 h-3.5 mr-2 text-orange-500" />
                  Login sebagai <span className="text-orange-500 ml-1 font-bold">Mitra</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("operator@plts-tracker.com", "operator123")}
                  className="justify-start bg-slate-900/50 border-blue-500/20 hover:bg-blue-500/10 hover:border-blue-500/40 text-slate-300 text-xs h-9"
                  disabled={isSubmitting}
                >
                  <Zap className="w-3.5 h-3.5 mr-2 text-blue-500" />
                  Login sebagai <span className="text-blue-500 ml-1 font-bold">Operator</span>
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center w-full">
        <p className="text-[10px] text-slate-600 uppercase tracking-widest">
          © 2026 PLTS Supply Tracker · Enterprise Edition
        </p>
      </div>
    </div>
  );
}
