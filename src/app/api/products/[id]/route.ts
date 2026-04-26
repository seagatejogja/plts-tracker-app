import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const product = await prisma.product.update({
      where: { id },
      data: {
        code: body.code,
        name: body.name,
        category: body.category,
        unit: body.unit,
        reorderPoint: parseInt(body.reorderPoint) || 5,
        description: body.description,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data produk" },
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

    // Check if product is used in stock batches or sales
    const batches = await prisma.stockBatch.count({ where: { productId: id } });
    const sales = await prisma.salesTransaction.count({ where: { productId: id } });

    if (batches > 0 || sales > 0) {
      // Soft delete if already used
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ message: "Produk dinonaktifkan karena sudah memiliki histori transaksi" });
    }

    // Hard delete if never used
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Produk berhasil dihapus permanen" });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data produk" },
      { status: 500 }
    );
  }
}
