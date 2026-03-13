"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

type QuoteStatus = "PENDING" | "REPLIED" | "CLOSED";

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

export default function AdminQuotesList({ quotes }: AdminQuotesListProps) {
  const [search, setSearch] = useState("");
  const [responses, setResponses] = useState<Record<string, string>>(() =>
    Object.fromEntries(quotes.map((quote) => [quote.id, quote.adminResponse ?? ""]))
  );
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

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

  const saveResponse = (id: string, close: boolean) => {
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

      toast({
        title: close ? "Cotizacion cerrada" : "Respuesta guardada",
        description: "Los cambios se guardaron correctamente.",
      });
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
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
        <Card key={quote.id}>
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-xl">{quote.contactName}</CardTitle>
                <CardDescription>
                  {quote.clientEmail} | {quote.clientPhone}
                </CardDescription>
              </div>
              <Badge variant={statusVariant[quote.status]}>{statusLabel[quote.status]}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
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
            </div>

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
                rows={4}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <Button disabled={isPending} onClick={() => saveResponse(quote.id, false)}>
                Guardar respuesta
              </Button>
              <Button variant="outline" disabled={isPending} onClick={() => saveResponse(quote.id, true)}>
                Cerrar cotizacion
              </Button>
            </div>
          </CardContent>
        </Card>
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
