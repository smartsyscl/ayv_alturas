import { z } from "zod";

export const quoteSchema = z.object({
  contactName: z.string().min(2, "El nombre es requerido."),
  contactRole: z.string().optional(),
  clientEmail: z.string().email("Email invalido."),
  clientPhone: z.string().min(8, "Telefono invalido."),
  buildingType: z.string().optional(),
  propertyType: z.string().optional(),
  siteAddress: z.string().min(5, "La direccion es requerida."),
  addressDetail: z.string().optional(),
  serviceId: z.string().min(1, "Debe seleccionar un servicio."),
  floors: z.number().int().min(1).optional(),
  terms: z.boolean().refine((value) => value, "Debe aceptar terminos y condiciones."),
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
