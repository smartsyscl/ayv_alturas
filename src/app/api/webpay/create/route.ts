import { NextResponse, type NextRequest } from "next/server";

import { verifyAdmin } from "@/lib/verify-admin";
import { prisma } from "@/lib/prisma";
import { webpayTransaction } from "@/lib/webpay";

export async function POST(request: NextRequest) {
  const admin = await verifyAdmin(request);

  if (!admin) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { quoteId } = await request.json();

  if (!quoteId || typeof quoteId !== "string") {
    return NextResponse.json({ message: "quoteId es requerido." }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({ where: { id: quoteId } });

  if (!quote) {
    return NextResponse.json({ message: "Cotización no encontrada." }, { status: 404 });
  }

  if (!quote.calculatedPrice || quote.calculatedPrice <= 0) {
    return NextResponse.json({ message: "La cotización no tiene un precio válido." }, { status: 400 });
  }

  const buyOrder = `OC-${quote.id.slice(0, 16)}-${Date.now()}`.slice(0, 26);
  const sessionId = `S-${quote.id.slice(0, 20)}`;
  const amount = quote.calculatedPrice;

  const origin = request.nextUrl.origin;
  const returnUrl = `${origin}/api/webpay/return`;

  try {
    const response = await webpayTransaction.create(buyOrder, sessionId, amount, returnUrl);

    // Guardar referencia de la orden en la cotización
    await prisma.quote.update({
      where: { id: quoteId },
      data: {
        paymentStatus: "PENDING",
        paymentMethod: "WEBPAY",
        paymentNote: `WebPay buyOrder: ${buyOrder}`,
      },
    });

    return NextResponse.json({
      url: response.url,
      token: response.token,
    });
  } catch (error) {
    console.error("Error creando transacción WebPay:", error);
    return NextResponse.json({ message: "Error al iniciar pago en WebPay." }, { status: 500 });
  }
}
