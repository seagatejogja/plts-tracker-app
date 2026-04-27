/**
 * Auth API Route — Login
 * Validates email/password against SQLite users table
 * POST /api/auth/login
 */
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/**
 * Handle login request
 * @param request - Contains email and password in body
 * @returns User data on success, error message on failure
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Input validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan password wajib diisi" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: "Akun tidak aktif. Hubungi Admin." },
        { status: 403 }
      );
    }

    // Simple password check (mock mode — no bcrypt for SQLite simplicity)
    // In production with Supabase, this will use Supabase Auth
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Return user data (exclude password)
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    console.info(`[Auth] Login success: ${user.email} (${user.role})`);

    return NextResponse.json({
      success: true,
      data: authUser,
      message: "Login berhasil",
    });
  } catch (error: any) {
    console.error("[Auth] Login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server: " + (error?.message || String(error)) },
      { status: 500 }
    );
  }
}
