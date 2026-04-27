import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/users
 * List all users (Admin only)
 */
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("[API] Get users error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data user" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/users
 * Create a new user (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, role } = body;

    // Validation
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { success: false, error: "Semua field wajib diisi" },
        { status: 400 }
      );
    }

    // Check existing email
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name,
        password, // In production, hash this!
        role,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: user,
      message: "User berhasil dibuat",
    });
  } catch (error) {
    console.error("[API] Create user error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal membuat user baru" },
      { status: 500 }
    );
  }
}
