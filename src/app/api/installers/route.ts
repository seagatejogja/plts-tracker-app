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
          { city: { contains: search } },
        ],
      }),
    };

    const [installers, total] = await Promise.all([
      prisma.installer.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.installer.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: installers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to fetch installers:", error);
    return NextResponse.json({ error: "Gagal mengambil data installer" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if code already exists
    const existing = await prisma.installer.findUnique({
      where: { code: body.code },
    });

    if (existing) {
      if (!existing.isActive) {
        return NextResponse.json({ error: "Kode installer sudah digunakan tetapi dalam status non-aktif." }, { status: 400 });
      }
      return NextResponse.json({ error: "Kode installer sudah digunakan" }, { status: 400 });
    }

    const installer = await prisma.installer.create({
      data: {
        code: body.code,
        name: body.name,
        picName: body.picName,
        phone: body.phone,
        city: body.city,
        priceScheme: body.priceScheme,
        notes: body.notes,
        createdBy: body.createdBy,
      },
    });

    return NextResponse.json(installer, { status: 201 });
  } catch (error) {
    console.error("Failed to create installer:", error);
    return NextResponse.json({ error: "Gagal menyimpan data installer" }, { status: 500 });
  }
}
