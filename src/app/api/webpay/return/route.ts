import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { webpayTransaction } from "@/lib/webpay";

export async function POST(request: NextRequest) {
  return handleReturn(request);
}

export async function GET(request: NextRequest) {
  return handleReturn(request);
}

async function handleReturn(request: NextRequest) {
  // WebPay envía token_ws por POST (form) o GET (query param)
  let tokenWs: string | null = null;

  if (request.method === "POST") {
    const formData = await request.formData();
    tokenWs = formData.get("token_ws") as string | null;
  } else {
    tokenWs = request.nextUrl.searchParams.get("token_ws");
  }

  const origin = request.nextUrl.origin;

  // Si no hay token → usuario abortó el pago
  if (!tokenWs) {
    return NextResponse.redirect(`${origin}/pago/resultado?status=aborted`);
  }

  try {
    const result = await webpayTransaction.commit(tokenWs);

    // response_code 0 = aprobado
    if (result.response_code === 0) {
      // Buscar la quote por buyOrder (guardado en paymentNote)
      const quote = await prisma.quote.findFirst({
        where: {
          paymentNote: { contains: result.buy_order },
          paymentMethod: "WEBPAY",
        },
      });

      if (quote) {
        // Verificar que el monto pagado corresponda al precio de la cotización
        if (quote.calculatedPrice && result.amount !== quote.calculatedPrice) {
          console.error(
            `Monto WebPay no coincide: esperado=${quote.calculatedPrice}, recibido=${result.amount}, order=${result.buy_order}`,
          );
          return NextResponse.redirect(
            `${origin}/pago/resultado?status=error`,
          );
        }

        await prisma.quote.update({
          where: { id: quote.id },
          data: {
            paymentStatus: "PAID",
            paymentAmount: result.amount,
            paymentDate: new Date(),
            paymentNote: `WebPay aprobado | Orden: ${result.buy_order} | Auth: ${result.authorization_code} | Cuotas: ${result.installments_number ?? 0}`,
          },
        });
      }

      return NextResponse.redirect(
        `${origin}/pago/resultado?status=approved&order=${result.buy_order}&amount=${result.amount}`,
      );
    }

    // Pago rechazado
    return NextResponse.redirect(
      `${origin}/pago/resultado?status=rejected&code=${result.response_code}`,
    );
  } catch (error) {
    console.error("Error al confirmar transacción WebPay:", error);
    return NextResponse.redirect(`${origin}/pago/resultado?status=error`);
  }
}
