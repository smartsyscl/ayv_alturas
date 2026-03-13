import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  getSessionMaxAge,
  isValidAdminCredentials,
} from "@/lib/auth";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Credenciales invalidas." }, { status: 400 });
  }

  const { username, password } = parsed.data;

  if (!isValidAdminCredentials(username, password)) {
    return NextResponse.json({ message: "Usuario o contrasena incorrectos." }, { status: 401 });
  }

  const token = createSessionToken(username);
  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getSessionMaxAge(),
  });

  return NextResponse.json({ ok: true });
}
