import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { isValidAdminCredentials } from "@/lib/auth";

/**
 * Emails autorizados para acceder al panel de administración.
 * Se configura vía ADMIN_ALLOWED_EMAILS (separados por coma).
 * Si no se define, solo se permiten credenciales (usuario/contraseña).
 */
function getAllowedEmails(): string[] {
  const raw = process.env.ADMIN_ALLOWED_EMAILS ?? "";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const allowed = getAllowedEmails();
  // Si no se configuró lista, se permite cualquier cuenta Google autenticada
  if (allowed.length === 0) return true;
  return allowed.includes(email.toLowerCase());
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Credenciales",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!username || !password) return null;

        if (!isValidAdminCredentials(username, password)) return null;

        return {
          id: "admin",
          name: username,
          email: `${username}@admin.local`,
          role: "admin",
        };
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async signIn({ user, account }) {
      // Para login con Google, verificar que el email esté en la lista permitida
      if (account?.provider === "google") {
        return isAllowedEmail(user.email);
      }
      // Para credentials, la validación ya ocurrió en authorize()
      return true;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.role = "admin";
        token.provider = account?.provider ?? "credentials";
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).role = token.role;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (session.user as any).provider = token.provider;
      }
      return session;
    },
  },
});
