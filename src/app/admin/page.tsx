
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Briefcase, FileText, Users, BarChart } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [totalQuotes, pendingQuotes, repliedQuotes, customers] = await Promise.all([
    prisma.quote.count(),
    prisma.quote.count({ where: { status: "PENDING" } }),
    prisma.quote.count({ where: { status: "REPLIED" } }),
    prisma.quote.groupBy({ by: ["clientEmail"] }),
  ]);

  const stats = [
    {
      title: "Cotizaciones Creadas",
      value: totalQuotes.toString(),
      icon: FileText,
      change: `${pendingQuotes} pendientes de respuesta`,
    },
    {
      title: "Clientes Activos",
      value: customers.length.toString(),
      icon: Users,
      change: "Clientes unicos por email",
    },
    {
      title: "Cotizaciones Respondidas",
      value: repliedQuotes.toString(),
      icon: Briefcase,
      change: "Listas para seguimiento comercial",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Panel de Administración</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
        <Card className="lg:col-span-3">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <BarChart size={20} />
                    Actividad Reciente
                </CardTitle>
                <CardDescription>Un resumen de la actividad en la plataforma.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-12">
                    <p>El componente de gráfico de actividad estará disponible pronto.</p>
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
