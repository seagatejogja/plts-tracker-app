import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * PUT /api/users/[id]
 * Update user details
 */
export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, name, role, isActive, password } = body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update data
    const updatedData: any = {
      email: email?.toLowerCase().trim(),
      name,
      role,
      isActive,
    };

    // Only update password if provided
    if (password) {
      updatedData.password = password;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updatedData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
      message: "User berhasil diperbarui",
    });
  } catch (error) {
    console.error("[API] Update user error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memperbarui user" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/users/[id]
 * Soft delete (toggle isActive)
 */
export async function DELETE(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Toggle active status
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return NextResponse.json({
      success: true,
      message: `User berhasil ${updatedUser.isActive ? "diaktifkan" : "dinonaktifkan"}`,
    });
  } catch (error) {
    console.error("[API] Delete user error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengubah status user" },
      { status: 500 }
    );
  }
}
