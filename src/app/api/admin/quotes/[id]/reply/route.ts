import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyAdmin } from "@/lib/verify-admin";
import { prisma } from "@/lib/prisma";
import { notifyClient, type NotifyChannel } from "@/lib/notifications";

const replyWithNotifySchema = z.object({
  adminResponse: z.string().min(10, "La respuesta debe tener al menos 10 caracteres.").max(2000),
  status: z.enum(["REPLIED", "CLOSED"]).default("REPLIED"),
  notifyChannel: z.enum(["email", "whatsapp", "both", "none"]).default("none"),
});

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
  const parsed = replyWithNotifySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Datos de respuesta invalidos.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updated = await prisma.quote.update({
    where: { id },
    data: {
      adminResponse: parsed.data.adminResponse,
      status: parsed.data.status,
      respondedAt: new Date(),
      respondedBy: admin.email,
    },
  });

  // Enviar notificación al cliente si se solicitó
  let notifyResult = null;
  if (parsed.data.notifyChannel !== "none") {
    notifyResult = await notifyClient(
      {
        clientName: updated.contactName,
        clientEmail: updated.clientEmail,
        clientPhone: updated.clientPhone,
        serviceLabel: updated.serviceLabel,
        adminResponse: parsed.data.adminResponse,
        calculatedPrice: updated.calculatedPrice,
        quoteId: updated.id,
      },
      parsed.data.notifyChannel as NotifyChannel,
    );
  }

  return NextResponse.json({
    quote: updated,
    message: "Cotizacion actualizada.",
    notification: notifyResult,
  });
}
