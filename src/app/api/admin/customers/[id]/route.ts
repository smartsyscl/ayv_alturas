import { NextResponse } from "next/server";

import { verifyAdmin } from "@/lib/verify-admin";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ message: "Cliente no encontrado." }, { status: 404 });
  }

  await prisma.customer.delete({ where: { id } });

  return NextResponse.json({ message: "Cliente eliminado correctamente." });
}
