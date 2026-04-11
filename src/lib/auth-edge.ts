/**
 * Edge-compatible auth helpers. No node:crypto dependency.
 * Safe to import from middleware and NextAuth config.
 */

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

export function isValidAdminCredentials(username: string, password: string): boolean {
  const adminUser = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("ADMIN_USERNAME y ADMIN_PASSWORD son requeridos en produccion.");
    }
    console.warn("⚠ ADMIN_USERNAME / ADMIN_PASSWORD no configuradas. Login deshabilitado.");
    return false;
  }

  return safeEqual(username, adminUser) && safeEqual(password, adminPassword);
}
