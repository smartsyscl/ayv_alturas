"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type AdminCustomerItem = {
  id: string;
  name: string;
  email: string;
  phone: string;
  quoteCount: number;
  lastQuoteAt: string | null;
};

type AdminCustomersManagerProps = {
  customers: AdminCustomerItem[];
};

export default function AdminCustomersManager({ customers }: AdminCustomersManagerProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [customerToDelete, setCustomerToDelete] = useState<AdminCustomerItem | null>(null);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();

  const createOrUpdateCustomer = () => {
    if (name.trim().length < 2 || email.trim().length < 5 || phone.trim().length < 8) {
      toast({
        variant: "destructive",
        title: "Datos incompletos",
        description: "Completa nombre, email y telefono validos.",
      });
      return;
    }

    startTransition(async () => {
      const response = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
        }),
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "No se pudo guardar",
          description: "Revisa los datos e intentalo nuevamente.",
        });
        return;
      }

      toast({
        title: "Cliente guardado",
        description: "El cliente fue agregado o actualizado correctamente.",
      });

      setName("");
      setEmail("");
      setPhone("");
      router.refresh();
    });
  };

  const deleteCustomer = (id: string, customerName: string) => {
    startTransition(async () => {
      const response = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "No se pudo eliminar",
          description: "Intentalo nuevamente.",
        });
        return;
      }

      toast({
        title: "Cliente eliminado",
        description: `${customerName} fue eliminado correctamente.`,
      });
      setDeleteConfirmationText("");
      setCustomerToDelete(null);
      router.refresh();
    });
  };

  const openDeleteDialog = (customer: AdminCustomerItem) => {
    setDeleteConfirmationText("");
    setCustomerToDelete(customer);
  };

  const closeDeleteDialog = (open: boolean) => {
    if (!open && !isPending) {
      setDeleteConfirmationText("");
      setCustomerToDelete(null);
    }
  };

  const canConfirmDelete = deleteConfirmationText.trim().toUpperCase() === "ELIMINAR";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Agregar o actualizar cliente</CardTitle>
          <CardDescription>Si el email ya existe, se actualizan nombre y telefono.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="customer-name">Nombre</Label>
            <Input
              id="customer-name"
              placeholder="Nombre cliente"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-email">Email</Label>
            <Input
              id="customer-email"
              placeholder="cliente@correo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="customer-phone">Telefono</Label>
            <Input
              id="customer-phone"
              placeholder="+56 9 1234 5678"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button disabled={isPending} onClick={createOrUpdateCustomer}>
              Guardar cliente
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de clientes</CardTitle>
          <CardDescription>Administra clientes registrados manualmente o desde cotizaciones.</CardDescription>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">Aun no hay clientes registrados.</div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="rounded-md border p-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">{customer.email}</p>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                  </div>
                  <div className="text-sm text-muted-foreground md:text-right">
                    <p>{customer.quoteCount} cotizaciones</p>
                    <p>
                      Ultima solicitud: {customer.lastQuoteAt ? new Date(customer.lastQuoteAt).toLocaleDateString("es-CL") : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Button
                      variant="destructive"
                      disabled={isPending}
                      onClick={() => deleteCustomer(customer.id, customer.name)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(customerToDelete)} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Eliminar cliente
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion eliminara el registro administrativo del cliente y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {customerToDelete && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1">
              <p>
                <strong>Nombre:</strong> {customerToDelete.name}
              </p>
              <p>
                <strong>Email:</strong> {customerToDelete.email}
              </p>
              <p>
                <strong>Cotizaciones asociadas:</strong> {customerToDelete.quoteCount}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="delete-confirmation" className="text-sm font-medium text-destructive">
              Confirmacion de seguridad
            </Label>
            <p className="text-xs text-muted-foreground">
              Escribe <strong>ELIMINAR</strong> para habilitar el borrado del cliente.
            </p>
            <Input
              id="delete-confirmation"
              value={deleteConfirmationText}
              onChange={(event) => setDeleteConfirmationText(event.target.value)}
              placeholder="Escribe ELIMINAR"
              autoComplete="off"
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isPending || !customerToDelete || !canConfirmDelete}
              onClick={(event) => {
                event.preventDefault();
                if (customerToDelete) {
                  deleteCustomer(customerToDelete.id, customerToDelete.name);
                }
              }}
            >
              {isPending ? "Eliminando..." : "Eliminar definitivamente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
