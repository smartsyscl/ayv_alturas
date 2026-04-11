/* ── Tipos ── */

export type MeasurementField = {
  id: string;
  label: string;
  unit: "m2" | "unidad";
  pricePerUnit: number;
  required?: boolean;
};

export type PropertyVariant = {
  id: string;
  label: string;
  fields: MeasurementField[];
};

export type ServiceCategory = "building" | "home" | "broker";

export type ServiceOption = {
  id: string;
  name: string;
  category: ServiceCategory;
  description?: string;
  /** Si el servicio tiene variantes por tipo de propiedad (casa / depto) */
  propertyVariants?: PropertyVariant[];
  /** Si NO tiene variantes, campos genéricos de medidas */
  measurementFields?: MeasurementField[];
};

/* ── Constantes de precios ── */

export const PRICE_PER_M2 = 10_000; // CLP
export const VISIT_PRICE = 25_000; // CLP — visita técnica / toma de medidas

/* ── Campos reutilizables ── */

const FIELD_INTERIOR: MeasurementField = { id: "interiorM2", label: "Interior", unit: "m2", pricePerUnit: PRICE_PER_M2, required: true };
const FIELD_FACHADA: MeasurementField = { id: "fachadaM2", label: "Fachada", unit: "m2", pricePerUnit: PRICE_PER_M2 };
const FIELD_PUERTAS: MeasurementField = { id: "puertasQty", label: "Puertas (incluye marcos)", unit: "unidad", pricePerUnit: 15_000 };

/* ── Catálogo de servicios ── */

export const SERVICES: ServiceOption[] = [
  /* ─ Edificios ─ */
  { id: "window_cleaning", name: "Limpieza de Ventanas", category: "building" },
  { id: "facade_painting", name: "Pintura de Fachada", category: "building" },
  { id: "structural_repair", name: "Reparación Estructural", category: "building" },
  { id: "inspections", name: "Inspecciones", category: "building" },

  /* ─ Hogar ─ */
  {
    id: "interior_painting",
    name: "Pintura Interior",
    category: "home",
    measurementFields: [FIELD_INTERIOR, FIELD_PUERTAS],
  },
  {
    id: "exterior_painting",
    name: "Pintura Exterior",
    category: "home",
    measurementFields: [FIELD_FACHADA],
  },
  {
    id: "full_painting",
    name: "Pintura Completa",
    category: "home",
    measurementFields: [FIELD_INTERIOR, FIELD_FACHADA, FIELD_PUERTAS],
  },

  /* ─ Corredor de propiedades ─ */
  {
    id: "blanqueado_pre_entrega",
    name: "Blanqueado Pre Entrega",
    category: "broker",
    description: "Pintura blanca profesional para entrega de propiedad.",
    propertyVariants: [
      {
        id: "house",
        label: "Casa",
        fields: [
          FIELD_FACHADA,
          FIELD_INTERIOR,
          FIELD_PUERTAS,
        ],
      },
      {
        id: "apartment",
        label: "Departamento",
        fields: [
          FIELD_INTERIOR,
          FIELD_PUERTAS,
        ],
      },
    ],
  },
  {
    id: "decorativo",
    name: "Decorativo (pintura colores)",
    category: "broker",
    description: "Pintura decorativa con gama de colores a elección.",
    propertyVariants: [
      {
        id: "house",
        label: "Casa",
        fields: [
          FIELD_FACHADA,
          FIELD_INTERIOR,
          FIELD_PUERTAS,
        ],
      },
      {
        id: "apartment",
        label: "Departamento",
        fields: [
          FIELD_INTERIOR,
          FIELD_PUERTAS,
        ],
      },
    ],
  },
];

/* ── Helpers ── */

const servicesMap = new Map(SERVICES.map((s) => [s.id, s]));

export function getService(serviceId: string): ServiceOption | undefined {
  return servicesMap.get(serviceId);
}

export function getServiceLabel(serviceId: string): string {
  return servicesMap.get(serviceId)?.name ?? serviceId;
}

export function getServicesByCategory(category: ServiceCategory): ServiceOption[] {
  return SERVICES.filter((s) => s.category === category);
}

/** Devuelve los campos de medida aplicables según servicio + variante */
export function getMeasurementFields(
  serviceId: string,
  propertyVariantId?: string,
): MeasurementField[] {
  const service = servicesMap.get(serviceId);
  if (!service) return [];

  if (service.propertyVariants && propertyVariantId) {
    return service.propertyVariants.find((v) => v.id === propertyVariantId)?.fields ?? [];
  }

  return service.measurementFields ?? [];
}

/** Calcula el subtotal de medidas (sin visita técnica) */
export function calculateMeasurementsTotal(
  fields: MeasurementField[],
  values: Record<string, number>,
): number {
  return fields.reduce((total, field) => {
    const qty = values[field.id] ?? 0;
    return total + qty * field.pricePerUnit;
  }, 0);
}

/** Devuelve todos los IDs de campos de medida válidos del catálogo */
export function getAllValidMeasurementKeys(): Set<string> {
  const keys = new Set<string>();
  for (const service of SERVICES) {
    if (service.measurementFields) {
      for (const f of service.measurementFields) keys.add(f.id);
    }
    if (service.propertyVariants) {
      for (const v of service.propertyVariants) {
        for (const f of v.fields) keys.add(f.id);
      }
    }
  }
  return keys;
}

/** Filtra un objeto de medidas dejando solo las keys válidas para un servicio + variante */
export function sanitizeMeasurements(
  serviceId: string,
  measurements: Record<string, number>,
  propertyVariantId?: string,
): Record<string, number> {
  const fields = getMeasurementFields(serviceId, propertyVariantId);
  const validKeys = new Set(fields.map((f) => f.id));
  const sanitized: Record<string, number> = {};
  for (const [key, val] of Object.entries(measurements)) {
    if (validKeys.has(key) && typeof val === "number" && val >= 0 && Number.isFinite(val)) {
      sanitized[key] = val;
    }
  }
  return sanitized;
}
