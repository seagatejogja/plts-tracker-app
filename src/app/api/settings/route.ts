import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const settings = await prisma.systemSetting.findMany();
    
    // Convert to object
    const config = settings.reduce((acc: any, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    // Default values if not set
    const defaults = {
      investor_share: "60",
      manager_share: "40",
    };

    return NextResponse.json({ ...defaults, ...config });
  } catch (error) {
    console.error("Settings GET error:", error);
    return NextResponse.json({ error: "Gagal memuat pengaturan" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { investor_share, manager_share } = body;

    if (investor_share) {
      await prisma.systemSetting.upsert({
        where: { key: "investor_share" },
        update: { value: investor_share.toString() },
        create: { key: "investor_share", value: investor_share.toString() },
      });
    }

    if (manager_share) {
      await prisma.systemSetting.upsert({
        where: { key: "manager_share" },
        update: { value: manager_share.toString() },
        create: { key: "manager_share", value: manager_share.toString() },
      });
    }

    return NextResponse.json({ message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
