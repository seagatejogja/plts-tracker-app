import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const installer = await prisma.installer.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        picName: body.picName,
        phone: body.phone,
        city: body.city,
        priceScheme: body.priceScheme,
        notes: body.notes,
      },
    });

    return NextResponse.json(installer);
  } catch (error) {
    console.error("Failed to update installer:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data installer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if installer is used in sales
    const sales = await prisma.salesTransaction.count({ where: { installerId: id } });

    if (sales > 0) {
      // Soft delete if already used
      await prisma.installer.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ message: "Installer dinonaktifkan karena sudah memiliki histori transaksi" });
    }

    // Hard delete if never used
    await prisma.installer.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Installer berhasil dihapus permanen" });
  } catch (error) {
    console.error("Failed to delete installer:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data installer" },
      { status: 500 }
    );
  }
}
