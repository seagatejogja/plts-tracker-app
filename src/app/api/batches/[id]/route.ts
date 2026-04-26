import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const qtyIn = parseInt(body.qtyIn);
    const hppPerUnit = parseFloat(body.hppPerUnit);

    const batch = await prisma.stockBatch.update({
      where: { id },
      data: {
        batchNumber: body.batchNumber,
        productId: body.productId,
        supplierName: body.supplierName,
        entryDate: new Date(body.entryDate),
        qtyIn: qtyIn,
        hppPerUnit: hppPerUnit,
        totalHpp: qtyIn * hppPerUnit,
        notes: body.notes,
      },
      include: {
        product: true,
      }
    });

    return NextResponse.json(batch);
  } catch (error) {
    console.error("Failed to update batch:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui data batch masuk" },
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

    // Check if batch has been used in sales
    const salesCount = await prisma.salesTransaction.count({
      where: { batchId: id }
    });

    if (salesCount > 0) {
      return NextResponse.json(
        { error: "Tidak dapat menghapus batch karena sebagian barang sudah terjual. Buat penyesuaian stok (Opname) jika diperlukan." },
        { status: 400 }
      );
    }

    await prisma.stockBatch.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Batch masuk berhasil dihapus" });
  } catch (error) {
    console.error("Failed to delete batch:", error);
    return NextResponse.json(
      { error: "Gagal menghapus data batch" },
      { status: 500 }
    );
  }
}
