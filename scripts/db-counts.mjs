import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString = process.env.DATABASE_URL_APP ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL_APP o DATABASE_URL no esta definida.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const email = process.argv[2]?.toLowerCase();

try {
  const quotes = await prisma.quote.count();
  const customers = await prisma.customer.count();
  console.log(`COUNTS quotes=${quotes} customers=${customers}`);

  if (email) {
    const customer = await prisma.customer.findUnique({ where: { email } });
    const quote = await prisma.quote.findFirst({
      where: { clientEmail: email },
      orderBy: { createdAt: "desc" },
    });

    console.log(`CUSTOMER_EXISTS=${customer ? "yes" : "no"}`);
    console.log(`QUOTE_EXISTS=${quote ? "yes" : "no"}`);
    if (customer) {
      console.log(`CUSTOMER name=${customer.name} email=${customer.email} phone=${customer.phone}`);
    }
  }
} finally {
  await prisma.$disconnect();
}
