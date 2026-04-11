import crypto from "node:crypto";

export const ADMIN_SESSION_COOKIE = "admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 4; // 4 horas (antes era 8)

type SessionPayload = {
  username: string;
  exp: number;
  jti: string; // ID único para poder revocar
};

/* ── Blacklist de tokens revocados (en memoria, se limpia sola) ── */
const revokedTokens = new Map<string, number>(); // jti → expiración

/** Revocar un token para que no sea válido aunque no haya expirado */
export function revokeSessionToken(token: string): void {
  const payload = decodePayloadUnsafe(token);
  if (payload?.jti && payload?.exp) {
    revokedTokens.set(payload.jti, payload.exp);
  }
  // Limpiar tokens expirados para no acumular memoria
  const now = Math.floor(Date.now() / 1000);
  for (const [jti, exp] of revokedTokens) {
    if (exp <= now) revokedTokens.delete(jti);
  }
}

/** Decodifica el payload sin verificar firma (solo para extraer jti al revocar) */
function decodePayloadUnsafe(token: string): SessionPayload | null {
  try {
    const [encodedPayload] = token.split(".");
    if (!encodedPayload) return null;
    return JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET es requerido en produccion.");
    }

    return "dev-only-secret-change-me";
  }

  return secret;
}

function base64url(value: Buffer | string) {
  return Buffer.from(value).toString("base64url");
}

function sign(input: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(input).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);

  if (left.length !== right.length) {
    return false;
  }

  return crypto.timingSafeEqual(left, right);
}

export function createSessionToken(username: string): string {
  const payload: SessionPayload = {
    username,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
    jti: crypto.randomUUID(),
  };

  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token?: string): SessionPayload | null {
  if (!token) {
    return null;
  }

  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as SessionPayload;

    if (payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }

    // Verificar si el token fue revocado (logout)
    if (payload.jti && revokedTokens.has(payload.jti)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function isValidAdminCredentials(username: string, password: string): boolean {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_USERNAME y ADMIN_PASSWORD son requeridos en produccion.");
    }
    // En desarrollo se rechazan si no están configuradas
    console.warn("⚠ ADMIN_USERNAME / ADMIN_PASSWORD no configuradas. Login deshabilitado.");
    return false;
  }

  return safeEqual(username, adminUser) && safeEqual(password, adminPassword);
}

export function getSessionMaxAge(): number {
  return SESSION_DURATION_SECONDS;
}
