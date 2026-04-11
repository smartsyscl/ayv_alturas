/**
 * Servicio de notificaciones al cliente.
 * Soporta envío por Email (Resend / SMTP genérico) y WhatsApp (API de WhatsApp Business).
 */

type NotifyClientParams = {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceLabel: string;
  adminResponse: string;
  calculatedPrice: number | null;
  quoteId: string;
};

/* ── Email via Resend (u otro proveedor SMTP) ── */

async function sendEmailNotification(params: NotifyClientParams): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL ?? "no-reply@ayvalturas.cl";

  if (!apiKey) {
    console.warn("⚠ RESEND_API_KEY no configurada. Email no enviado.");
    return false;
  }

  const priceText =
    params.calculatedPrice != null && params.calculatedPrice > 0
      ? `$${params.calculatedPrice.toLocaleString("es-CL")}`
      : "Por confirmar";

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <div style="background: #213747; padding: 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0;">A&V Alturas</h1>
      </div>
      <div style="padding: 24px; background: #f9fafb;">
        <h2 style="color: #213747;">Hola ${params.clientName},</h2>
        <p>Hemos revisado tu solicitud de cotización para el servicio de <strong>${params.serviceLabel}</strong>.</p>
        
        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px;">Precio estimado:</p>
          <p style="font-size: 24px; font-weight: bold; color: #213747; margin: 0;">${priceText}</p>
        </div>

        <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="font-size: 14px; color: #6b7280; margin: 0 0 8px;">Respuesta del equipo:</p>
          <p style="color: #374151; white-space: pre-wrap;">${params.adminResponse}</p>
        </div>

        <p style="color: #6b7280; font-size: 14px;">
          Si tienes dudas, responde a este correo o contáctanos directamente.
        </p>
      </div>
      <div style="background: #213747; padding: 12px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">A&V Alturas - Trabajos en altura profesionales</p>
      </div>
    </div>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [params.clientEmail],
        subject: `Respuesta a tu cotización - ${params.serviceLabel} | A&V Alturas`,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Error enviando email:", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error enviando email:", error);
    return false;
  }
}

/* ── WhatsApp via API (WhatsApp Business Cloud API) ── */

function formatPhoneForWhatsApp(phone: string): string {
  // Limpiar y normalizar número chileno
  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+")) cleaned = cleaned.slice(1);
  if (cleaned.startsWith("56")) return cleaned;
  if (cleaned.startsWith("9") && cleaned.length === 9) return `56${cleaned}`;
  return cleaned;
}

async function sendWhatsAppNotification(params: NotifyClientParams): Promise<boolean> {
  const token = process.env.WHATSAPP_API_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.warn("⚠ WHATSAPP_API_TOKEN o WHATSAPP_PHONE_ID no configuradas. WhatsApp no enviado.");
    return false;
  }

  const recipientPhone = formatPhoneForWhatsApp(params.clientPhone);

  const priceText =
    params.calculatedPrice != null && params.calculatedPrice > 0
      ? `$${params.calculatedPrice.toLocaleString("es-CL")} CLP`
      : "Por confirmar";

  // Mensaje de texto simple (alternativa a template)
  const message = [
    `🏗️ *A&V Alturas* - Respuesta a tu Cotización`,
    ``,
    `Hola *${params.clientName}*,`,
    ``,
    `Servicio: *${params.serviceLabel}*`,
    `Precio estimado: *${priceText}*`,
    ``,
    `📋 *Nuestra respuesta:*`,
    params.adminResponse,
    ``,
    `¿Tienes dudas? Responde a este mensaje. 👷`,
  ].join("\n");

  try {
    const response = await fetch(
      `https://graph.facebook.com/v21.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: recipientPhone,
          type: "text",
          text: { body: message },
        }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      console.error("Error enviando WhatsApp:", err);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error enviando WhatsApp:", error);
    return false;
  }
}

/* ── Generar link de WhatsApp (fallback sin API) ── */

export function generateWhatsAppLink(params: NotifyClientParams): string {
  const phone = formatPhoneForWhatsApp(params.clientPhone);
  const priceText =
    params.calculatedPrice != null && params.calculatedPrice > 0
      ? `$${params.calculatedPrice.toLocaleString("es-CL")} CLP`
      : "Por confirmar";

  const text = [
    `🏗️ *A&V Alturas* - Respuesta a tu Cotización`,
    ``,
    `Hola *${params.clientName}*,`,
    ``,
    `Servicio: *${params.serviceLabel}*`,
    `Precio estimado: *${priceText}*`,
    ``,
    `📋 Nuestra respuesta:`,
    params.adminResponse,
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/* ── Función principal: envía por los canales configurados ── */

export type NotifyChannel = "email" | "whatsapp" | "both";

export type NotifyResult = {
  emailSent: boolean;
  whatsappSent: boolean;
  whatsappLink: string;
};

export async function notifyClient(
  params: NotifyClientParams,
  channel: NotifyChannel = "both",
): Promise<NotifyResult> {
  const results: NotifyResult = {
    emailSent: false,
    whatsappSent: false,
    whatsappLink: generateWhatsAppLink(params),
  };

  const promises: Promise<void>[] = [];

  if (channel === "email" || channel === "both") {
    promises.push(
      sendEmailNotification(params).then((ok) => {
        results.emailSent = ok;
      }),
    );
  }

  if (channel === "whatsapp" || channel === "both") {
    promises.push(
      sendWhatsAppNotification(params).then((ok) => {
        results.whatsappSent = ok;
      }),
    );
  }

  await Promise.allSettled(promises);

  return results;
}
