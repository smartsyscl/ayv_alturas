import { execSync } from "node:child_process";

const MAX_RETRIES = 3;
const DELAY_MS = 5000;

for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
  try {
    console.log(`prisma migrate deploy (intento ${attempt}/${MAX_RETRIES})...`);
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("Migraciones aplicadas correctamente.");
    process.exit(0);
  } catch (err) {
    console.error(`Intento ${attempt} falló.`);
    if (attempt < MAX_RETRIES) {
      console.log(`Reintentando en ${DELAY_MS / 1000}s...`);
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }
}

console.error("prisma migrate deploy falló después de todos los intentos.");
process.exit(1);
