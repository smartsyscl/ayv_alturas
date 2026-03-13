
import AdminQuotesList from "@/components/admin-quotes-list";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminQuotesPage() {
  const quotesRaw = await prisma.quote.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const quotes = quotesRaw.map((quote) => ({
    ...quote,
    createdAt: quote.createdAt.toISOString(),
    respondedAt: quote.respondedAt?.toISOString() ?? null,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Historial de Cotizaciones</h1>
      </div>
      <AdminQuotesList quotes={quotes} />
    </div>
  );
}
