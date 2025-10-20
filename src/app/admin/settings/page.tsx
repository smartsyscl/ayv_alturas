
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold font-headline">Configuración</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>Gestionar la configuración de la aplicación.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
            <p>Las opciones de configuración, como la subida del logo de la empresa, estarán aquí.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
