"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export default function PaymentResult() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status");
  const order = searchParams.get("order");
  const amount = searchParams.get("amount");

  if (status === "approved") {
    return (
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">Pago Aprobado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">Tu pago ha sido procesado exitosamente.</p>
          {order && <p className="text-sm">Orden: <strong>{order}</strong></p>}
          {amount && (
            <p className="text-lg font-semibold">
              Monto: {Number(amount).toLocaleString("es-CL", { style: "currency", currency: "CLP", minimumFractionDigits: 0 })}
            </p>
          )}
          <Button asChild className="mt-4">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "rejected") {
    return (
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-700">Pago Rechazado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            El pago no pudo ser procesado. Verifica los datos de tu tarjeta o intenta con otro medio de pago.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status === "aborted") {
    return (
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-2">
            <AlertTriangle className="h-12 w-12 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl text-yellow-700">Pago Cancelado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            El proceso de pago fue cancelado. No se realizó ningún cargo.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Error genérico
  return (
    <Card className="max-w-md w-full text-center">
      <CardHeader>
        <div className="flex justify-center mb-2">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <CardTitle className="text-2xl">Error en el Pago</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">
          Ocurrió un error al procesar el pago. Por favor intenta nuevamente.
        </p>
        <Button asChild variant="outline" className="mt-4">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
