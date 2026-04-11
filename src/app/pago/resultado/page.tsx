import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Logo from "@/components/logo";
import PaymentResult from "./payment-result";

export default function PagoResultadoPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-6 border-b">
        <div className="container flex items-center justify-between">
          <Link href="/">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <Suspense fallback={<p>Cargando...</p>}>
          <PaymentResult />
        </Suspense>
      </main>
    </div>
  );
}
