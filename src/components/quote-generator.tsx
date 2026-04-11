
"use client";

import React, { useState, useMemo, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, User, Building, Send, ArrowRight, ArrowLeft, Home, Paintbrush, HardHat, ZoomIn, Ruler, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  type ServiceOption,
  type MeasurementField,
  getService,
  getServicesByCategory,
  getMeasurementFields,
  calculateMeasurementsTotal,
  VISIT_PRICE,
} from '@/lib/services';

/* ── Iconos por servicio ── */

const serviceIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  window_cleaning: ({ className }) => (
    <svg className={cn("w-6 h-6", className)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="m2 12 20 0"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></svg>
  ),
  facade_painting: Paintbrush,
  structural_repair: HardHat,
  inspections: ZoomIn,
  interior_painting: Paintbrush,
  exterior_painting: Paintbrush,
  full_painting: Paintbrush,
  blanqueado_pre_entrega: Paintbrush,
  decorativo: Paintbrush,
};

function getServiceIcon(serviceId: string) {
  return serviceIcons[serviceId] ?? Paintbrush;
}

/* ── Formato CLP ── */

function formatCLP(value: number): string {
  return value.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
}

/* ── Flujos por categoría ── */

type FlowType = "building" | "home" | "broker";

function getFlowFromParam(param: string | null): FlowType {
  if (param === "facade_painting") return "home";
  if (param === "broker") return "broker";
  return "building";
}

/* ── Schema del formulario ── */

const formSchema = z.object({
  contactName: z.string().min(2, "El nombre es requerido."),
  contactRole: z.string().optional(),
  clientEmail: z.string().email("Email inválido."),
  clientPhone: z.string().min(8, "Teléfono inválido."),

  buildingType: z.string().optional(),
  propertyType: z.string().optional(),

  siteAddress: z.string().min(5, "La dirección es requerida."),
  addressDetail: z.string().optional(),
  serviceId: z.string({ required_error: "Debe seleccionar un servicio." }),
  floors: z.coerce.number().min(1, "Debe haber al menos 1 piso.").optional(),
  terms: z.boolean().refine(val => val === true, "Debe aceptar los términos y condiciones."),

  // Medidas y precio
  measurements: z.record(z.string(), z.coerce.number().min(0)).optional(),
  requestVisit: z.boolean().optional(),
  calculatedPrice: z.number().int().min(0).optional(),
});

type FormData = z.infer<typeof formSchema>;


function QuoteGeneratorInternal() {
  const { toast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get('service');
  const flow: FlowType = getFlowFromParam(serviceParam);
  const isHomeFlow = flow === "home";
  const isBrokerFlow = flow === "broker";
  const showPropertyType = isHomeFlow || isBrokerFlow;

  const propertyFields = showPropertyType
    ? (['propertyType', 'siteAddress', 'addressDetail'] as const)
    : (['buildingType', 'siteAddress', 'addressDetail'] as const);

  const steps = [
    { id: 'contact', name: 'Tus Datos', fields: ['contactName', 'clientEmail', 'clientPhone', 'contactRole'] as const },
    { id: 'property', name: showPropertyType ? 'La Propiedad' : 'El Edificio', fields: propertyFields },
    { id: 'service', name: 'El Servicio', fields: ['serviceId'] as const },
    { id: 'measurements', name: 'Medidas y Cotización', fields: ['measurements', 'requestVisit', 'terms'] as const },
  ];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema.refine(data => {
      if (showPropertyType) return !!data.propertyType;
      return !!data.buildingType;
    }, {
      message: "Debe seleccionar un tipo.",
      path: [showPropertyType ? 'propertyType' : 'buildingType']
    })),
    mode: 'onChange',
    defaultValues: {
      contactName: '',
      contactRole: '',
      clientEmail: '',
      clientPhone: '',
      buildingType: undefined,
      propertyType: undefined,
      siteAddress: '',
      addressDetail: '',
      serviceId: serviceParam && serviceParam !== 'facade_painting' && serviceParam !== 'broker' ? serviceParam : undefined,
      floors: 1,
      terms: false,
      measurements: {},
      requestVisit: false,
      calculatedPrice: 0,
    },
  });

  const { formState, trigger, getValues, watch, setValue } = form;
  const propertyType = watch('propertyType');
  const selectedServiceId = watch('serviceId');
  const watchedMeasurements = watch('measurements') ?? {};
  const requestVisit = watch('requestVisit') ?? false;

  // Campos de medida según servicio + variante
  const activeFields: MeasurementField[] = useMemo(() => {
    if (!selectedServiceId) return [];
    return getMeasurementFields(selectedServiceId, propertyType ?? undefined);
  }, [selectedServiceId, propertyType]);

  // Cálculo en tiempo real
  const subtotal = useMemo(
    () => calculateMeasurementsTotal(activeFields, watchedMeasurements),
    [activeFields, watchedMeasurements],
  );
  const visitCost = requestVisit ? VISIT_PRICE : 0;
  const totalPrice = subtotal + visitCost;

  // Mantener calculatedPrice sincronizado
  React.useEffect(() => {
    setValue('calculatedPrice', totalPrice);
  }, [totalPrice, setValue]);

  const selectedService = selectedServiceId ? getService(selectedServiceId) : undefined;
  const hasMeasurementFields = activeFields.length > 0;

  const getPageTitle = () => {
    if (isBrokerFlow) return "Cotización Corredor de Propiedades";
    if (isHomeFlow) return "Cotización para tu Hogar";
    return "Cotización para Edificios";
  };

  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);

      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar la solicitud.');
      }

      toast({
        title: "Solicitud Enviada",
        description: "Tu solicitud de cotización ha sido enviada con éxito.",
      });
      router.push('/');
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error al enviar',
        description: 'No pudimos guardar tu cotización. Intenta nuevamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fields = steps[currentStep].fields as unknown as (keyof FormData)[];
    const output = await trigger(fields, { shouldFocus: true });
    if (!output) return;
    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(step => step - 1);
  };

  const isStepValid = (stepIndex: number) => {
    const currentFields = steps[stepIndex].fields as unknown as (keyof FormData)[];

    for (const field of currentFields) {
      if (field === 'contactRole') continue;
      if (field === 'addressDetail') continue;
      if (field === 'measurements') continue;
      if (field === 'requestVisit') continue;
      if (field === 'floors' && showPropertyType && propertyType === 'apartment') continue;

      if (field === 'terms') {
        if (!getValues('terms')) return false;
        continue;
      }
      if (formState.errors[field] || !getValues(field)) return false;
    }

    return true;
  };

  /* ── Servicios filtrados para el step de selección ── */
  const availableServices = useMemo(() => {
    if (isBrokerFlow) return getServicesByCategory("broker");
    if (isHomeFlow) return getServicesByCategory("home");
    return getServicesByCategory("building");
  }, [isBrokerFlow, isHomeFlow]);

  return (
    <div className="container py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl" style={{ color: '#213747' }}>{getPageTitle()}</h1>
      </div>

      {/* Stepper */}
      <div className="flex justify-center items-center mb-8 gap-2 md:gap-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center text-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                currentStep >= index ? "stepper-step-active" : "bg-gray-200 text-gray-500"
              )}>
                {currentStep > index ? '✔' : index + 1}
              </div>
              <p className={cn(
                "mt-2 text-xs w-20",
                currentStep >= index ? "font-semibold text-primary" : "text-muted-foreground"
              )}>{step.name}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-10 border-t-2 mt-[-1rem]",
                currentStep > index ? "border-primary" : "border-gray-300"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
          <Card>
            {/* ── Step 0: Datos de contacto ── */}
            {currentStep === 0 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><User size={20} />Tus Datos</CardTitle>
                  <CardDescription>Información del contacto.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="contactName" render={({ field }) => (
                    <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="Juan Pérez" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  {!showPropertyType && <FormField control={form.control} name="contactRole" render={({ field }) => (
                    <FormItem><FormLabel>Cargo (Opcional)</FormLabel><FormControl><Input placeholder="Administrador del Edificio" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />}
                  <FormField control={form.control} name="clientEmail" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="correo@ejemplo.cl" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="clientPhone" render={({ field }) => (
                    <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="+56 9 1234 5678" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </>
            )}

            {/* ── Step 1: Propiedad / Edificio ── */}
            {currentStep === 1 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline">
                    {showPropertyType ? <Home size={20} /> : <Building size={20} />}
                    {showPropertyType ? 'La Propiedad' : 'El Edificio'}
                  </CardTitle>
                  <CardDescription>
                    {showPropertyType ? 'Detalles sobre la propiedad.' : 'Detalles sobre la construcción.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {showPropertyType ? (
                    <FormField control={form.control} name="propertyType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Propiedad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="house">Casa</SelectItem>
                            <SelectItem value="apartment">Departamento</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ) : (
                    <FormField control={form.control} name="buildingType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Edificio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un tipo..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="residential">Residencial</SelectItem>
                            <SelectItem value="office">Oficinas</SelectItem>
                            <SelectItem value="mixed">Mixto</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                  <FormField control={form.control} name="siteAddress" render={({ field }) => (
                    <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="Av. Providencia 1234, Santiago" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="addressDetail" render={({ field }) => (
                    <FormItem><FormLabel>Detalle Adicional (opcional)</FormLabel><FormControl><Input placeholder="Ej: Casa con rejas blancas, Depto 301..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </>
            )}

            {/* ── Step 2: Selección del servicio ── */}
            {currentStep === 2 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><Briefcase size={20} />Selecciona el Servicio</CardTitle>
                  <CardDescription>Elige el tipo de trabajo que necesitas.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {(isHomeFlow || isBrokerFlow) ? (
                    <FormField control={form.control} name="serviceId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Servicio</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          {availableServices.map(s => {
                            const Icon = getServiceIcon(s.id);
                            return (
                              <Card
                                key={s.id}
                                onClick={() => field.onChange(s.id)}
                                className={cn(
                                  "cursor-pointer hover:shadow-md transition-shadow",
                                  field.value === s.id && "ring-2 ring-primary shadow-md"
                                )}
                              >
                                <CardContent className="p-4 flex flex-col items-center justify-center gap-2 text-center">
                                  <Icon className="w-8 h-8 text-primary" />
                                  <span className="font-semibold text-sm">{s.name}</span>
                                  {s.description && <span className="text-xs text-muted-foreground">{s.description}</span>}
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                        <FormMessage className="pt-2" />
                      </FormItem>
                    )} />
                  ) : (
                    <FormField control={form.control} name="serviceId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Servicio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un servicio..." /></SelectTrigger></FormControl>
                          <SelectContent>
                            {availableServices.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}

                  {/* Pisos (solo edificios o casas) */}
                  {(!showPropertyType || propertyType === 'house') && (
                    <FormField control={form.control} name="floors" render={({ field }) => (
                      <FormItem>
                        <FormLabel>{showPropertyType ? 'Número de Pisos de la Casa' : 'Número de Pisos'}</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  )}
                </CardContent>
              </>
            )}

            {/* ── Step 3: Medidas y Cotización en tiempo real ── */}
            {currentStep === 3 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><Ruler size={20} />Medidas y Cotización</CardTitle>
                  <CardDescription>
                    {hasMeasurementFields
                      ? 'Ingresa las medidas para calcular el valor. Si no las tienes, puedes solicitar una visita técnica.'
                      : 'Revisa los detalles y envía tu solicitud.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                  {/* Campos de medida dinámicos */}
                  {hasMeasurementFields && (
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Dimensiones del trabajo</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        {activeFields.map((mf) => (
                          <div key={mf.id} className="space-y-1.5">
                            <label htmlFor={`m_${mf.id}`} className="text-sm font-medium">
                              {mf.label} <span className="text-muted-foreground">({mf.unit === 'm2' ? 'm²' : 'unidades'})</span>
                            </label>
                            <Input
                              id={`m_${mf.id}`}
                              type="number"
                              min={0}
                              placeholder={mf.required ? 'Requerido' : '0'}
                              value={watchedMeasurements[mf.id] ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Number(e.target.value);
                                setValue('measurements', { ...watchedMeasurements, [mf.id]: val });
                              }}
                            />
                            <p className="text-xs text-muted-foreground">
                              {formatCLP(mf.pricePerUnit)} por {mf.unit === 'm2' ? 'm²' : 'unidad'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Opción visita técnica */}
                  <FormField control={form.control} name="requestVisit" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          <MapPin className="inline-block w-4 h-4 mr-1 -mt-0.5" />
                          Solicitar visita técnica y toma de medidas
                        </FormLabel>
                        <FormDescription>
                          Un especialista visitará el lugar para tomar medidas exactas. Valor: <strong>{formatCLP(VISIT_PRICE)}</strong>
                        </FormDescription>
                      </div>
                    </FormItem>
                  )} />

                  {/* Resumen de precio en tiempo real */}
                  {(hasMeasurementFields || requestVisit) && (
                    <div className="rounded-lg border p-4 space-y-2 bg-background">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Resumen estimado</h3>
                      {activeFields.map((mf) => {
                        const qty = watchedMeasurements[mf.id] ?? 0;
                        if (qty === 0) return null;
                        return (
                          <div key={mf.id} className="flex justify-between text-sm">
                            <span>{mf.label}: {qty} {mf.unit === 'm2' ? 'm²' : 'un.'}</span>
                            <span>{formatCLP(qty * mf.pricePerUnit)}</span>
                          </div>
                        );
                      })}
                      {requestVisit && (
                        <div className="flex justify-between text-sm">
                          <span>Visita técnica</span>
                          <span>{formatCLP(VISIT_PRICE)}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between font-bold text-lg">
                        <span>Total estimado</span>
                        <span className="text-primary">{formatCLP(totalPrice)}</span>
                      </div>
                    </div>
                  )}

                  {/* Info de calidad */}
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800 space-y-1">
                    <p className="font-semibold">Sobre nuestro servicio:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Mano de obra altamente capacitada</li>
                      <li>Materiales de la más alta calidad — Pinturas <strong>Sherwin Williams</strong> y <strong>TX</strong></li>
                      <li>Rapidez y calidad garantizada</li>
                    </ul>
                  </div>

                  {/* Términos */}
                  <FormField control={form.control} name="terms" render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Acepto los términos y condiciones</FormLabel>
                        <FormDescription>
                          Confirmo que he leído y aceptado la <Link href="/privacy" className="underline">política de privacidad</Link>.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )} />
                </CardContent>
              </>
            )}

            <CardFooter className={cn("flex pt-6", currentStep > 0 ? "justify-between" : "justify-end")}>
              {currentStep > 0 && (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button type="button" onClick={nextStep} disabled={!isStepValid(currentStep)}>
                  Siguiente
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" size="sm" disabled={!isStepValid(currentStep) || isSubmitting}>
                  <Send className="mr-2 h-4 w-4" />
                  {isSubmitting ? 'Enviando...' : 'Enviar Cotización'}
                </Button>
              )}
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}


export default function QuoteGenerator() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <QuoteGeneratorInternal />
    </Suspense>
  );
}
