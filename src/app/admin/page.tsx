
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Briefcase, FileText, Users, BarChart } from "lucide-react";

export default function AdminDashboard() {
  const stats = [
    { title: "Cotizaciones Creadas", value: "152", icon: FileText, change: "+20.1% desde el mes pasado" },
    { title: "Clientes Activos", value: "89", icon: Users, change: "+12.4% desde el mes pasado" },
    { title: "Servicios Ofrecidos", value: "4", icon: Briefcase, change: "Estable" },
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
