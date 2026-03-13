
import AdminCustomersManager from "@/components/admin-customers-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  const quoteSummary = await prisma.quote.groupBy({
    by: ["clientEmail"],
    _count: { id: true },
    _max: { createdAt: true },
  });

  const summaryByEmail = new Map(
    quoteSummary.map((item) => [item.clientEmail.toLowerCase(), item])
  );

  const customersWithStats = customers.map((customer) => {
    const summary = summaryByEmail.get(customer.email.toLowerCase());

    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      quoteCount: summary?._count.id ?? 0,
      lastQuoteAt: summary?._max.createdAt?.toISOString() ?? null,
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Gestionar Clientes</h1>
      </div>
      <AdminCustomersManager customers={customersWithStats} />
    </div>
  );
}
