import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { quoteSchema } from "@/lib/quote-schemas";
import {
  getServiceLabel,
  getService,
  getMeasurementFields,
  calculateMeasurementsTotal,
  sanitizeMeasurements,
  VISIT_PRICE,
} from "@/lib/services";

/* ── Rate-limit simple para endpoint público con auto-limpieza ── */
const QUOTE_MAX_PER_IP = 10;
const QUOTE_WINDOW_MS = 60 * 60 * 1000; // 1 hora
const QUOTE_MAX_ENTRIES = 10_000;
const quoteAttempts = new Map<string, { count: number; firstAttempt: number }>();

function getClientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

function isQuoteRateLimited(ip: string): boolean {
  const now = Date.now();

  // Limpieza periódica
  if (quoteAttempts.size > QUOTE_MAX_ENTRIES) {
    for (const [k, v] of quoteAttempts) {
      if (now - v.firstAttempt > QUOTE_WINDOW_MS) quoteAttempts.delete(k);
    }
  }

  const entry = quoteAttempts.get(ip);
  if (!entry || now - entry.firstAttempt > QUOTE_WINDOW_MS) {
    quoteAttempts.set(ip, { count: 1, firstAttempt: now });
    return false;
  }
  entry.count++;
  return entry.count > QUOTE_MAX_PER_IP;
}

/** Recalcula el precio en el servidor a partir de medidas y servicio */
function recalculatePrice(
  serviceId: string,
  measurements: Record<string, number> | undefined,
  requestVisit: boolean | undefined,
  propertyType: string | undefined,
): number {
  if (!measurements || Object.keys(measurements).length === 0) return 0;
  const fields = getMeasurementFields(serviceId, propertyType);
  if (fields.length === 0) return 0;
  const subtotal = calculateMeasurementsTotal(fields, measurements);
  const visitCost = requestVisit ? VISIT_PRICE : 0;
  return subtotal + visitCost;
}

function sanitizeText(value: string): string {
  return value.replace(/[<>]/g, "").trim();
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isQuoteRateLimited(ip)) {
    return NextResponse.json(
      { message: "Demasiadas solicitudes. Intente nuevamente más tarde." },
      { status: 429 },
    );
  }

  const json = await request.json();
  const parsed = quoteSchema.safeParse({
    ...json,
    floors: typeof json.floors === "string" ? Number.parseInt(json.floors, 10) : json.floors,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Datos de cotizacion invalidos.", errors: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { terms, measurements, ...data } = parsed.data;

  // Validar que el servicio existe
  if (!getService(data.serviceId)) {
    return NextResponse.json(
      { message: "Servicio no válido." },
      { status: 400 },
    );
  }

  // Sanitizar measurements: solo keys válidas para este servicio
  const safeMeasurements = measurements
    ? sanitizeMeasurements(data.serviceId, measurements, data.propertyType ?? undefined)
    : undefined;

  // Recalcular precio en el servidor (no confiar en el cliente)
  const serverPrice = recalculatePrice(
    data.serviceId,
    safeMeasurements,
    data.requestVisit,
    data.propertyType ?? undefined,
  );

  // Sanitizar campos de texto libre
  const sanitizedData = {
    ...data,
    contactName: sanitizeText(data.contactName),
    siteAddress: sanitizeText(data.siteAddress),
    addressDetail: data.addressDetail ? sanitizeText(data.addressDetail) : undefined,
    contactRole: data.contactRole ? sanitizeText(data.contactRole) : undefined,
    calculatedPrice: serverPrice,
  };

  const customer = await prisma.customer.upsert({
    where: { email: sanitizedData.clientEmail },
    update: {
      name: sanitizedData.contactName,
      phone: sanitizedData.clientPhone,
    },
    create: {
      name: sanitizedData.contactName,
      email: sanitizedData.clientEmail,
      phone: sanitizedData.clientPhone,
    },
  });

  const quote = await prisma.quote.create({
    data: {
      ...sanitizedData,
      serviceLabel: getServiceLabel(sanitizedData.serviceId),
      customerId: customer.id,
      measurements: safeMeasurements ?? undefined,
    },
  });

  return NextResponse.json({
    id: quote.id,
    message: "Solicitud de cotizacion recibida exitosamente.",
  });
}
