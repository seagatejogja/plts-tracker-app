import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const whereClause = {
      ...(search && {
        OR: [
          { batchNumber: { contains: search } },
          { supplierName: { contains: search } },
          { product: { name: { contains: search } } },
        ],
      }),
    };

    const [batches, total] = await Promise.all([
      prisma.stockBatch.findMany({
        where: whereClause,
        include: {
          product: true,
        },
        orderBy: { entryDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.stockBatch.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: batches,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch batches:", error);
    return NextResponse.json({ error: "Gagal mengambil data batch masuk" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if batchNumber already exists
    const existing = await prisma.stockBatch.findUnique({
      where: { batchNumber: body.batchNumber },
    });

    if (existing) {
      return NextResponse.json({ error: "Nomor batch sudah digunakan. Silakan gunakan nomor unik." }, { status: 400 });
    }

    const qtyIn = parseInt(body.qtyIn);
    const hppPerUnit = parseFloat(body.hppPerUnit);

    const batch = await prisma.stockBatch.create({
      data: {
        batchNumber: body.batchNumber,
        productId: body.productId,
        supplierName: body.supplierName,
        entryDate: new Date(body.entryDate),
        qtyIn: qtyIn,
        hppPerUnit: hppPerUnit,
        totalHpp: qtyIn * hppPerUnit,
        notes: body.notes,
        createdBy: body.createdBy,
      },
      include: {
        product: true,
      }
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error) {
    console.error("Failed to create batch:", error);
    return NextResponse.json({ error: "Gagal merekam data batch masuk" }, { status: 500 });
  }
}
