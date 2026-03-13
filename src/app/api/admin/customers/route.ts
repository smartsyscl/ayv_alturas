import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerCreateSchema } from "@/lib/quote-schemas";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  if (!session) {
    return NextResponse.json({ message: "No autorizado." }, { status: 401 });
  }

  const json = await request.json();
  const parsed = customerCreateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Datos de cliente invalidos.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.upsert({
    where: { email: parsed.data.email },
    update: {
      name: parsed.data.name,
      phone: parsed.data.phone,
    },
    create: parsed.data,
  });

  return NextResponse.json({ customer, message: "Cliente guardado correctamente." });
}
