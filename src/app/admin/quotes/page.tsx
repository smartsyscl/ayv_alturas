
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function AdminQuotesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Historial de Cotizaciones</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Cotizaciones Generadas</CardTitle>
          <CardDescription>Un historial de todas las cotizaciones creadas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p>La lista de cotizaciones generadas aparecerá aquí.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
