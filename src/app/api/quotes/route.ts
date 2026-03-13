import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { quoteSchema } from "@/lib/quote-schemas";
import { getServiceLabel } from "@/lib/services";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = quoteSchema.safeParse({
    ...json,
    floors: typeof json.floors === "string" ? Number.parseInt(json.floors, 10) : json.floors,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Datos de cotizacion invalidos.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { terms, ...data } = parsed.data;

  const quote = await prisma.quote.create({
    data: {
      ...data,
      serviceLabel: getServiceLabel(data.serviceId),
    },
  });

  await prisma.customer.upsert({
    where: { email: data.clientEmail },
    update: {
      name: data.contactName,
      phone: data.clientPhone,
    },
    create: {
      name: data.contactName,
      email: data.clientEmail,
      phone: data.clientPhone,
    },
  });

  return NextResponse.json({
    id: quote.id,
    message: "Solicitud de cotizacion recibida exitosamente.",
  });
}
