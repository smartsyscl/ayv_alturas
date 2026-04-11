import { cookies, headers } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifySessionToken } from "@/lib/auth";
import { auth } from "@/auth";

/**
 * Verifica que la request viene de un admin autenticado.
 * Soporta: next-auth (Google/Credentials) + legacy HMAC token.
 *
 * También valida Origin/Referer para mitigar CSRF en requests mutantes.
 * Devuelve el nombre/email del admin o null si no es válido.
 */
export async function verifyAdmin(request?: Request): Promise<{ name: string; email: string } | null> {
  // ── CSRF: Verificar Origin en requests mutantes ──
  if (request) {
    const method = request.method.toUpperCase();
    if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      const headerStore = await headers();
      const origin = headerStore.get("origin");
      const host = headerStore.get("host");

      // En producción, origin debe coincidir con host
      if (origin && host) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            return null; // CSRF: origin no coincide
          }
        } catch {
          return null; // URL inválida
        }
      }
      // Si no hay Origin (ej: mismo origin en ciertos browsers), aceptar
      // pero confiar en SameSite=lax de la cookie
    }
  }

  // ── 1. Verificar next-auth (Google / Credentials) ──
  const session = await auth();
  if (session?.user) {
    return {
      name: session.user.name ?? "Admin",
      email: session.user.email ?? "admin@local",
    };
  }

  // ── 2. Fallback: legacy HMAC token ──
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  const legacySession = verifySessionToken(token);

  if (legacySession) {
    return {
      name: legacySession.username,
      email: `${legacySession.username}@admin.local`,
    };
  }

  return null;
}
