import { NextResponse } from "next/server";

import { verifyAdmin } from "@/lib/verify-admin";
import { prisma } from "@/lib/prisma";
import { paymentUpdateSchema } from "@/lib/quote-schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const json = await request.json();
  const parsed = paymentUpdateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Datos de pago invalidos.", errors: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { paymentStatus, paymentMethod, paymentAmount, paymentDueDate, paymentNote } = parsed.data;

  const updated = await prisma.quote.update({
    where: { id },
    data: {
      paymentStatus,
      paymentMethod: paymentMethod ?? null,
      paymentAmount: paymentAmount ?? null,
      paymentDueDate: paymentDueDate ? new Date(paymentDueDate) : null,
      paymentDate: paymentStatus === "PAID" ? new Date() : undefined,
      paymentNote: paymentNote ?? null,
    },
  });

  return NextResponse.json({ quote: updated, message: "Estado de pago actualizado." });
}
