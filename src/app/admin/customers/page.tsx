
import AdminCustomersManager from "@/components/admin-customers-manager";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      _count: { select: { quotes: true } },
      quotes: {
        select: { createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const customersWithStats = customers.map((customer) => ({
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    quoteCount: customer._count.quotes,
    lastQuoteAt: customer.quotes[0]?.createdAt.toISOString() ?? null,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Gestionar Clientes</h1>
      </div>
      <AdminCustomersManager customers={customersWithStats} />
    </div>
  );
}
