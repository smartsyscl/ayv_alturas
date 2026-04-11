
import AdminServicesList from "@/components/admin-services-list";
import { SERVICES, VISIT_PRICE } from "@/lib/services";

export default function AdminServicesPage() {
  return (
    <div>
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-3xl font-bold font-headline">Gestionar Servicios</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo actual de servicios y precios. Visita técnica:{" "}
          <strong>
            {VISIT_PRICE.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 })}
          </strong>
        </p>
      </div>
      <AdminServicesList services={SERVICES} />
    </div>
  );
}
