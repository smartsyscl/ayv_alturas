"use client";

import { ChevronDown, Ruler, Tag } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import type { ServiceOption, ServiceCategory, MeasurementField } from "@/lib/services";

type AdminServicesListProps = {
  services: ServiceOption[];
};

const categoryLabel: Record<ServiceCategory, string> = {
  building: "Edificios",
  home: "Hogar",
  broker: "Corredor de Propiedades",
};

const categoryColor: Record<ServiceCategory, string> = {
  building: "bg-blue-100 text-blue-800",
  home: "bg-green-100 text-green-800",
  broker: "bg-purple-100 text-purple-800",
};

function FieldRow({ field }: { field: MeasurementField }) {
  return (
    <div className="flex items-center justify-between text-sm py-1">
      <div className="flex items-center gap-2">
        <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
        <span>{field.label}</span>
        {field.required && <Badge variant="secondary" className="text-[10px] px-1 py-0">Requerido</Badge>}
      </div>
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="text-xs">{field.unit === "m2" ? "m²" : "unidad"}</span>
        <span className="font-medium text-foreground">
          {field.pricePerUnit.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 })}/{field.unit === "m2" ? "m²" : "un."}
        </span>
      </div>
    </div>
  );
}

export default function AdminServicesList({ services }: AdminServicesListProps) {
  const categories: ServiceCategory[] = ["building", "home", "broker"];

  const grouped = categories.map((cat) => ({
    category: cat,
    items: services.filter((s) => s.category === cat),
  }));

  return (
    <div className="space-y-6">
      {grouped.map(({ category, items }) => (
        <div key={category} className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{categoryLabel[category]}</h2>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryColor[category]}`}>
              {items.length} {items.length === 1 ? "servicio" : "servicios"}
            </span>
          </div>

          {items.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground text-sm">
                No hay servicios en esta categoría.
              </CardContent>
            </Card>
          ) : (
            items.map((service) => (
              <Collapsible key={service.id} asChild>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer select-none hover:bg-muted/30 transition-colors py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Tag className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div>
                            <CardTitle className="text-base">{service.name}</CardTitle>
                            {service.description && (
                              <CardDescription className="text-xs mt-0.5">{service.description}</CardDescription>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {!service.measurementFields && !service.propertyVariants && (
                            <Badge variant="secondary" className="text-xs">Sin medidas</Badge>
                          )}
                          {service.propertyVariants && (
                            <Badge variant="secondary" className="text-xs">
                              {service.propertyVariants.length} variantes
                            </Badge>
                          )}
                          {service.measurementFields && (
                            <Badge variant="secondary" className="text-xs">
                              {service.measurementFields.length} campos
                            </Badge>
                          )}
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 pb-4 px-4 space-y-4">
                      <div className="text-xs text-muted-foreground">
                        ID: <code className="bg-muted px-1 py-0.5 rounded">{service.id}</code>
                        &nbsp;&middot;&nbsp;Categoría: {categoryLabel[service.category]}
                      </div>

                      {/* Campos genéricos */}
                      {service.measurementFields && service.measurementFields.length > 0 && (
                        <div className="rounded border p-3 bg-muted/20 space-y-1">
                          <p className="font-semibold text-xs uppercase tracking-wide text-foreground mb-2">Campos de medida</p>
                          {service.measurementFields.map((f) => (
                            <FieldRow key={f.id} field={f} />
                          ))}
                        </div>
                      )}

                      {/* Variantes de propiedad */}
                      {service.propertyVariants && service.propertyVariants.length > 0 && (
                        <div className="space-y-3">
                          {service.propertyVariants.map((variant) => (
                            <div key={variant.id} className="rounded border p-3 bg-muted/20 space-y-1">
                              <p className="font-semibold text-xs uppercase tracking-wide text-foreground mb-2">
                                {variant.label}
                              </p>
                              {variant.fields.map((f) => (
                                <FieldRow key={f.id} field={f} />
                              ))}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Sin configuración */}
                      {!service.measurementFields && !service.propertyVariants && (
                        <p className="text-sm text-muted-foreground italic">
                          Este servicio aún no tiene campos de medida configurados. Los precios se definen manualmente.
                        </p>
                      )}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))
          )}
        </div>
      ))}
    </div>
  );
}
