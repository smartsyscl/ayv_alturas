
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function AdminServicesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Gestionar Servicios</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Añadir Servicio
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Servicios</CardTitle>
          <CardDescription>Añadir, editar o eliminar los servicios ofrecidos.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p>La tabla de gestión de servicios estará aquí.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
