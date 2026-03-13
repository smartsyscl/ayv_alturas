import "dotenv/config";

const isVercel = process.env.VERCEL === "1";
const isProduction = process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
const databaseUrl = process.env.DATABASE_URL_APP ?? process.env.DATABASE_URL;
const authSecret = process.env.AUTH_SECRET;
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

const missing = [];
if (!databaseUrl) missing.push("DATABASE_URL_APP o DATABASE_URL");
if (!authSecret) missing.push("AUTH_SECRET");
if (!adminUsername) missing.push("ADMIN_USERNAME");
if (!adminPassword) missing.push("ADMIN_PASSWORD");

if (missing.length > 0) {
  console.error(`Faltan variables obligatorias: ${missing.join(", ")}`);
  process.exit(1);
}

if (isVercel && isProduction && databaseUrl.startsWith("file:")) {
  console.error("DATABASE_URL_APP/DATABASE_URL no puede ser SQLite local (file:) en Vercel Production. Usa Postgres gestionado.");
  process.exit(1);
}

if (isVercel && isProduction && (adminUsername === "demo" || adminPassword === "demo")) {
  console.error("No uses credenciales demo en Vercel Production. Configura ADMIN_USERNAME y ADMIN_PASSWORD seguros.");
  process.exit(1);
}

console.log("Variables de despliegue validadas correctamente.");
