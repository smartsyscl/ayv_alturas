"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { ChevronDown, Mail, MessageCircle, Send } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type QuoteStatus = "PENDING" | "REPLIED" | "CLOSED";
type PaymentStatus = "NOT_APPLICABLE" | "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
type PaymentMethod = "TRANSFER" | "WEBPAY" | "OTHER";

type QuoteListItem = {
  id: string;
  contactName: string;
  clientEmail: string;
  clientPhone: string;
  serviceLabel: string;
  siteAddress: string;
  floors: number | null;
  status: QuoteStatus;
  adminResponse: string | null;
  createdAt: string;
  respondedAt: string | null;
  measurements: Record<string, number> | null;
  requestVisit: boolean;
  calculatedPrice: number | null;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  paymentAmount: number | null;
  paymentDate: string | null;
  paymentDueDate: string | null;
  paymentNote: string | null;
};

type AdminQuotesListProps = {
  quotes: QuoteListItem[];
};

const statusLabel: Record<QuoteStatus, string> = {
  PENDING: "Pendiente",
  REPLIED: "Respondida",
  CLOSED: "Cerrada",
};

const statusVariant: Record<QuoteStatus, "secondary" | "default"> = {
  PENDING: "secondary",
  REPLIED: "default",
  CLOSED: "default",
};

const paymentStatusLabel: Record<PaymentStatus, string> = {
  NOT_APPLICABLE: "No aplica",
  PENDING: "Por cobrar",
  PARTIAL: "Pago parcial",
  PAID: "Pagado",
  OVERDUE: "Vencido",
};

const paymentStatusColor: Record<PaymentStatus, string> = {
  NOT_APPLICABLE: "bg-gray-100 text-gray-600",
  PENDING: "bg-yellow-100 text-yellow-800",
  PARTIAL: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
};

const paymentMethodLabel: Record<PaymentMethod, string> = {
  TRANSFER: "Transferencia",
  WEBPAY: "WebPay",
  OTHER: "Otro",
};

export default function AdminQuotesList({ quotes }: AdminQuotesListProps) {
  const [search, setSearch] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>(() =>
    Object.fromEntries(quotes.map((quote) => [quote.id, quote.adminResponse ?? ""]))
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const [paymentEdits, setPaymentEdits] = useState<
    Record<string, { status: PaymentStatus; method: PaymentMethod | null; amount: string; dueDate: string; note: string }>
  >(() =>
    Object.fromEntries(
      quotes.map((q) => [
        q.id,
        {
          status: q.paymentStatus,
          method: q.paymentMethod,
          amount: q.paymentAmount?.toString() ?? "",
          dueDate: q.paymentDueDate ? q.paymentDueDate.slice(0, 10) : "",
          note: q.paymentNote ?? "",
        },
      ]),
    ),
  );

  const filteredQuotes = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return quotes;
    }

    return quotes.filter((quote) => {
      return (
        quote.contactName.toLowerCase().includes(value) ||
        quote.clientEmail.toLowerCase().includes(value) ||
        quote.serviceLabel.toLowerCase().includes(value)
      );
    });
  }, [quotes, search]);

  const saveResponse = (id: string, close: boolean, notifyChannel: "none" | "email" | "whatsapp" | "both" = "none") => {
    const adminResponse = (responses[id] ?? "").trim();

    if (adminResponse.length < 10) {
      toast({
        variant: "destructive",
        title: "Respuesta incompleta",
        description: "Escribe al menos 10 caracteres para responder la cotizacion.",
      });
      return;
    }

    startTransition(async () => {
      const response = await fetch(`/api/admin/quotes/${id}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminResponse,
          status: close ? "CLOSED" : "REPLIED",
          notifyChannel,
        }),
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "No se pudo guardar la respuesta",
          description: "Intentalo de nuevo.",
        });
        return;
      }

      const result = await response.json();

      let notifDescription = "Los cambios se guardaron correctamente.";
      if (result.notification) {
        const parts = [];
        if (result.notification.emailSent) parts.push("email enviado");
        if (result.notification.whatsappSent) parts.push("WhatsApp enviado");
        if (parts.length > 0) {
          notifDescription += ` Notificación: ${parts.join(", ")}.`;
        } else if (notifyChannel !== "none") {
          notifDescription += " No se pudo enviar la notificación (verifica la configuración).";
        }
      }

      toast({
        title: close ? "Cotizacion cerrada" : "Respuesta guardada",
        description: notifDescription,
      });

      // Si eligió WhatsApp y la API no envió, abrir link directo
      if (
        (notifyChannel === "whatsapp" || notifyChannel === "both") &&
        result.notification &&
        !result.notification.whatsappSent &&
        result.notification.whatsappLink
      ) {
        window.open(result.notification.whatsappLink, "_blank");
      }

      router.refresh();
    });
  };

  const savePayment = (id: string) => {
    const edit = paymentEdits[id];
    if (!edit) return;

    startTransition(async () => {
      const response = await fetch(`/api/admin/quotes/${id}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: edit.status,
          paymentMethod: edit.method,
          paymentAmount: edit.amount ? parseInt(edit.amount, 10) : null,
          paymentDueDate: edit.dueDate || null,
          paymentNote: edit.note || null,
        }),
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "No se pudo actualizar el pago",
          description: "Intentalo de nuevo.",
        });
        return;
      }

      toast({
        title: "Pago actualizado",
        description: "El estado de pago se actualizó correctamente.",
      });
      router.refresh();
    });
  };

  const initiateWebpay = (quoteId: string) => {
    startTransition(async () => {
      const response = await fetch("/api/webpay/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        toast({
          variant: "destructive",
          title: "Error al generar pago WebPay",
          description: data.message ?? "Intentalo de nuevo.",
        });
        return;
      }

      const { url, token } = await response.json();

      // Abrir el formulario de pago de WebPay en una nueva pestaña
      window.open(`${url}?token_ws=${token}`, "_blank");

      toast({
        title: "Link de pago generado",
        description: "Se abrió WebPay en una nueva pestaña.",
      });
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Card>
        <CardHeader>
          <CardTitle>Buscar cotizaciones</CardTitle>
          <CardDescription>Filtra por cliente, email o servicio.</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="quote-search" className="sr-only">
            Buscar
          </Label>
          <Input
            id="quote-search"
            placeholder="Ej: Juan, fachada, cliente@correo.com"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </CardContent>
      </Card>

      {filteredQuotes.map((quote) => (
        <Collapsible key={quote.id} asChild>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer select-none hover:bg-muted/30 transition-colors">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <CardTitle className="text-lg">{quote.contactName}</CardTitle>
                    <CardDescription className="text-xs">
                      {quote.serviceLabel} &middot; {new Date(quote.createdAt).toLocaleDateString("es-CL")}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {quote.calculatedPrice != null && quote.calculatedPrice > 0 && (
                    <span className="text-sm font-semibold text-foreground">
                      {quote.calculatedPrice.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 })}
                    </span>
                  )}
                  <Badge variant={statusVariant[quote.status]}>{statusLabel[quote.status]}</Badge>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${paymentStatusColor[quote.paymentStatus]}`}>
                    {paymentStatusLabel[quote.paymentStatus]}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 [[data-state=open]_&]:rotate-180" />
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
          <CardContent className="space-y-4 pt-0">
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              <p>
                <strong className="text-foreground">Email:</strong> {quote.clientEmail}
              </p>
              <p>
                <strong className="text-foreground">Teléfono:</strong> {quote.clientPhone}
              </p>
              <p>
                <strong className="text-foreground">Servicio:</strong> {quote.serviceLabel}
              </p>
              <p>
                <strong className="text-foreground">Pisos:</strong> {quote.floors ?? "No aplica"}
              </p>
              <p>
                <strong className="text-foreground">Direccion:</strong> {quote.siteAddress}
              </p>
              <p>
                <strong className="text-foreground">Fecha:</strong>{" "}
                {new Date(quote.createdAt).toLocaleString("es-CL")}
              </p>
              {quote.calculatedPrice != null && quote.calculatedPrice > 0 && (
                <p>
                  <strong className="text-foreground">Precio estimado:</strong>{" "}
                  {quote.calculatedPrice.toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 })}
                </p>
              )}
              {quote.requestVisit && (
                <p>
                  <strong className="text-foreground">Visita técnica:</strong> Solicitada
                </p>
              )}
            </div>

            {quote.measurements && Object.keys(quote.measurements).length > 0 && (
              <div className="rounded border p-3 text-sm space-y-1 bg-muted/30">
                <p className="font-semibold text-foreground text-xs uppercase tracking-wide">Medidas</p>
                {Object.entries(quote.measurements).map(([key, val]) => (
                  <p key={key} className="text-muted-foreground">
                    {key}: <strong className="text-foreground">{val}</strong>
                  </p>
                ))}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor={`resp-${quote.id}`}>Respuesta del administrador</Label>
              <Textarea
                id={`resp-${quote.id}`}
                value={responses[quote.id] ?? ""}
                onChange={(event) =>
                  setResponses((prev) => ({
                    ...prev,
                    [quote.id]: event.target.value,
                  }))
                }
                placeholder="Escribe aqui la respuesta para el cliente..."
                rows={3}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button disabled={isPending} onClick={() => saveResponse(quote.id, false)}>
                Guardar respuesta
              </Button>
              <Button
                variant="secondary"
                disabled={isPending}
                onClick={() => saveResponse(quote.id, false, "email")}
              >
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                Guardar y enviar Email
              </Button>
              <Button
                variant="secondary"
                disabled={isPending}
                onClick={() => saveResponse(quote.id, false, "whatsapp")}
              >
                <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                Guardar y enviar WhatsApp
              </Button>
              <Button variant="outline" disabled={isPending} onClick={() => saveResponse(quote.id, true)}>
                Cerrar cotizacion
              </Button>
            </div>

            {/* ── Gestión de Pago ── */}
            <Collapsible className="rounded border bg-muted/20">
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 hover:bg-muted/40 transition-colors rounded">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground text-xs uppercase tracking-wide">Estado de Pago</p>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${paymentStatusColor[quote.paymentStatus]}`}>
                    {paymentStatusLabel[quote.paymentStatus]}
                  </span>
                  {quote.paymentMethod && (
                    <span className="text-xs text-muted-foreground">• {paymentMethodLabel[quote.paymentMethod]}</span>
                  )}
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <Label htmlFor={`pay-status-${quote.id}`} className="text-xs">Estado</Label>
                  <Select
                    value={paymentEdits[quote.id]?.status ?? "NOT_APPLICABLE"}
                    onValueChange={(val) =>
                      setPaymentEdits((prev) => ({
                        ...prev,
                        [quote.id]: { ...prev[quote.id], status: val as PaymentStatus },
                      }))
                    }
                  >
                    <SelectTrigger id={`pay-status-${quote.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NOT_APPLICABLE">No aplica</SelectItem>
                      <SelectItem value="PENDING">Por cobrar</SelectItem>
                      <SelectItem value="PARTIAL">Pago parcial</SelectItem>
                      <SelectItem value="PAID">Pagado</SelectItem>
                      <SelectItem value="OVERDUE">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`pay-method-${quote.id}`} className="text-xs">Medio de pago</Label>
                  <Select
                    value={paymentEdits[quote.id]?.method ?? "none"}
                    onValueChange={(val) =>
                      setPaymentEdits((prev) => ({
                        ...prev,
                        [quote.id]: { ...prev[quote.id], method: val === "none" ? null : (val as PaymentMethod) },
                      }))
                    }
                  >
                    <SelectTrigger id={`pay-method-${quote.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin definir</SelectItem>
                      <SelectItem value="TRANSFER">Transferencia</SelectItem>
                      <SelectItem value="WEBPAY">WebPay</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`pay-amount-${quote.id}`} className="text-xs">Monto pagado (CLP)</Label>
                  <Input
                    id={`pay-amount-${quote.id}`}
                    type="number"
                    min={0}
                    placeholder="0"
                    value={paymentEdits[quote.id]?.amount ?? ""}
                    onChange={(e) =>
                      setPaymentEdits((prev) => ({
                        ...prev,
                        [quote.id]: { ...prev[quote.id], amount: e.target.value },
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`pay-due-${quote.id}`} className="text-xs">Vencimiento</Label>
                  <Input
                    id={`pay-due-${quote.id}`}
                    type="date"
                    value={paymentEdits[quote.id]?.dueDate ?? ""}
                    onChange={(e) =>
                      setPaymentEdits((prev) => ({
                        ...prev,
                        [quote.id]: { ...prev[quote.id], dueDate: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor={`pay-note-${quote.id}`} className="text-xs">Nota de pago</Label>
                <Input
                  id={`pay-note-${quote.id}`}
                  placeholder="Ej: Transferencia parcial recibida..."
                  value={paymentEdits[quote.id]?.note ?? ""}
                  onChange={(e) =>
                    setPaymentEdits((prev) => ({
                      ...prev,
                      [quote.id]: { ...prev[quote.id], note: e.target.value },
                    }))
                  }
                />
              </div>
              {quote.paymentDate && (
                <p className="text-xs text-muted-foreground">
                  Último pago registrado: {new Date(quote.paymentDate).toLocaleDateString("es-CL")}
                </p>
              )}
              {quote.paymentMethod && (
                <p className="text-xs text-muted-foreground">
                  Método actual: {paymentMethodLabel[quote.paymentMethod]}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={isPending} onClick={() => savePayment(quote.id)}>
                  Guardar estado de pago
                </Button>
                {quote.calculatedPrice != null && quote.calculatedPrice > 0 && quote.paymentStatus !== "PAID" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending}
                    onClick={() => initiateWebpay(quote.id)}
                  >
                    Generar link WebPay
                  </Button>
                )}
              </div>
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
          </CollapsibleContent>
        </Card>
        </Collapsible>
      ))}

      {filteredQuotes.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No hay cotizaciones que coincidan con la busqueda.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
