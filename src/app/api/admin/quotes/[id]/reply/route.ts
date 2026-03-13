import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { quoteReplySchema } from "@/lib/quote-schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const { id } = await context.params;
  const json = await request.json();
  const parsed = quoteReplySchema.safeParse(json);

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
    },
  });

  return NextResponse.json({ quote: updated, message: "Cotizacion actualizada." });
}
