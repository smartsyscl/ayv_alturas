import { NextResponse, type NextRequest } from "next/server";

import { verifyAdmin } from "@/lib/verify-admin";
import { prisma } from "@/lib/prisma";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 200;

export async function GET(request: NextRequest) {
  const admin = await verifyAdmin();

  if (!admin) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Number(searchParams.get("pageSize")) || DEFAULT_PAGE_SIZE),
  );
  const skip = (page - 1) * pageSize;

  const [quotes, total] = await Promise.all([
    prisma.quote.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.quote.count(),
  ]);

  return NextResponse.json({ quotes, total, page, pageSize });
}
