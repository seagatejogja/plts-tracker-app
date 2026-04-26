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
      isActive: true,
      ...(search && {
        OR: [
          { code: { contains: search } },
          { name: { contains: search } },
        ],
      }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: products,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if code already exists
    const existing = await prisma.product.findUnique({
      where: { code: body.code },
    });

    if (existing) {
      if (!existing.isActive) {
        return NextResponse.json({ error: "Kode produk sudah digunakan tetapi dalam status non-aktif. Silakan gunakan kode lain atau hubungi admin." }, { status: 400 });
      }
      return NextResponse.json({ error: "Kode produk sudah digunakan" }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        code: body.code,
        name: body.name,
        category: body.category,
        unit: body.unit,
        reorderPoint: parseInt(body.reorderPoint) || 5,
        description: body.description,
        createdBy: body.createdBy,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Gagal menyimpan data produk" }, { status: 500 });
  }
}
