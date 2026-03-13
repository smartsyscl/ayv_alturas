export type ServiceOption = {
  id: string;
  name: string;
  category?: "home";
};

export const SERVICES: ServiceOption[] = [
  { id: "window_cleaning", name: "Limpieza de Ventanas" },
  { id: "facade_painting", name: "Pintura de Fachada" },
  { id: "structural_repair", name: "Reparacion Estructural" },
  { id: "inspections", name: "Inspecciones" },
  { id: "interior_painting", name: "Pintura Interior", category: "home" },
  { id: "exterior_painting", name: "Pintura Exterior", category: "home" },
  { id: "full_painting", name: "Pintura Completa", category: "home" },
];

const servicesMap = new Map(SERVICES.map((service) => [service.id, service.name]));

export function getServiceLabel(serviceId: string): string {
  return servicesMap.get(serviceId) ?? serviceId;
}
