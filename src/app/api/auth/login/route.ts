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

/* ── Rate-limit simple en memoria con auto-limpieza ── */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutos
const MAX_ENTRIES = 10_000; // Evitar memory leak por DDoS

const attempts = new Map<string, { count: number; firstAttempt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ?? "unknown";
}

function cleanupExpiredEntries(): void {
  const now = Date.now();
  for (const [ip, entry] of attempts) {
    if (now - entry.firstAttempt > WINDOW_MS) {
      attempts.delete(ip);
    }
  }
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Limpieza periódica para evitar crecimiento descontrolado
  if (attempts.size > MAX_ENTRIES) {
    cleanupExpiredEntries();
  }

  const entry = attempts.get(ip);

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAttempt: now });
    return false;
  }

  entry.count++;
  return entry.count > MAX_ATTEMPTS;
}

function clearAttempts(ip: string): void {
  attempts.delete(ip);
}
/* ── Fin rate-limit ── */

export async function POST(request: Request) {
  const ip = getClientIp(request);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { message: "Demasiados intentos. Intente nuevamente en 15 minutos." },
      { status: 429 },
    );
  }

  const json = await request.json();
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "Credenciales invalidas." }, { status: 400 });
  }

  const { username, password } = parsed.data;

  if (!isValidAdminCredentials(username, password)) {
    return NextResponse.json({ message: "Usuario o contrasena incorrectos." }, { status: 401 });
  }

  clearAttempts(ip);

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
