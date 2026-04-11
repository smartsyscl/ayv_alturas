import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

const ADMIN_SESSION_COOKIE = "admin_session";

/**
 * Lightweight token validation for Edge runtime (no node:crypto).
 * Uses Web Crypto API (SubtleCrypto) to verify the HMAC-SHA256 signature.
 * LEGACY: mantiene compatibilidad con sesiones creadas antes de Google Auth.
 */
async function isLegacyTokenValid(token: string): Promise<boolean> {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") return false;
  const key = secret || "dev-only-secret-change-me";

  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return false;

  try {
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(key),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const sigBuf = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(encodedPayload));
    const expectedSig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (signature !== expectedSig) return false;

    const payload = JSON.parse(atob(encodedPayload.replace(/-/g, "+").replace(/_/g, "/")));
    if (typeof payload.exp !== "number") return false;
    return payload.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export default auth(async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    // 1. Verificar sesión de next-auth (Google / Credentials)
    if (request.auth?.user) {
      return NextResponse.next();
    }

    // 2. Verificar sesión legacy (HMAC token)
    const legacyToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (legacyToken && (await isLegacyTokenValid(legacyToken))) {
      return NextResponse.next();
    }

    // Sin sesión válida → redirigir a login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
