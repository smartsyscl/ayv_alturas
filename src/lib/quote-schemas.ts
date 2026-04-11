import { z } from "zod";

export const quoteSchema = z.object({
  contactName: z.string().min(2, "El nombre es requerido.").max(100, "Nombre demasiado largo."),
  contactRole: z.string().max(80, "Cargo demasiado largo.").optional(),
  clientEmail: z.string().email("Email invalido.").max(254, "Email demasiado largo."),
  clientPhone: z.string().min(8, "Telefono invalido.").max(20, "Telefono demasiado largo."),
  buildingType: z.string().max(50).optional(),
  propertyType: z.string().max(50).optional(),
  siteAddress: z.string().min(5, "La direccion es requerida.").max(300, "Direccion demasiado larga."),
  addressDetail: z.string().max(300, "Detalle demasiado largo.").optional(),
  serviceId: z.string().min(1, "Debe seleccionar un servicio.").max(50),
  floors: z.number().int().min(1).max(200).optional(),
  terms: z.boolean().refine((value) => value, "Debe aceptar terminos y condiciones."),

  // Campos de medidas y precio (v2)
  measurements: z.record(
    z.string().max(30),
    z.number().min(0).max(100_000),
  ).optional(),
  requestVisit: z.boolean().optional(),
  calculatedPrice: z.number().int().min(0).max(999_999_999).optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

export const quoteReplySchema = z.object({
  adminResponse: z.string().min(10, "La respuesta debe tener al menos 10 caracteres."),
  status: z.enum(["REPLIED", "CLOSED"]).default("REPLIED"),
});

export const customerCreateSchema = z.object({
  name: z.string().min(2, "El nombre es requerido."),
  email: z.string().email("Email invalido."),
  phone: z.string().min(8, "Telefono invalido."),
});

export const paymentUpdateSchema = z.object({
  paymentStatus: z.enum(["NOT_APPLICABLE", "PENDING", "PARTIAL", "PAID", "OVERDUE"]),
  paymentMethod: z.enum(["TRANSFER", "WEBPAY", "OTHER"]).nullable().optional(),
  paymentAmount: z.number().int().min(0).nullable().optional(),
  paymentDueDate: z.string().nullable().optional(),
  paymentNote: z.string().max(500).nullable().optional(),
});
