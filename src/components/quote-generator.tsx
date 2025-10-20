
"use client";

import React, { useState, Suspense } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Briefcase, User, Building, Send, ArrowRight, ArrowLeft, Home, Paintbrush, HardHat, ZoomIn } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';


const services = [
  { id: 'window_cleaning', name: 'Limpieza de Ventanas', icon: ({className}: {className?: string}) => <svg className={cn("w-6 h-6", className)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2Z"/><path d="m2 12 20 0"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10"/><path d="M12 2a15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0 4 10"/></svg> },
  { id: 'facade_painting', name: 'Pintura de Fachada', icon: Paintbrush },
  { id: 'structural_repair', name: 'Reparación Estructural', icon: HardHat },
  { id: 'inspections', name: 'Inspecciones', icon: ZoomIn },
  { id: 'interior_painting', name: 'Pintura Interior', icon: Paintbrush, category: 'home' },
  { id: 'exterior_painting', name: 'Pintura Exterior', icon: Paintbrush, category: 'home' },
  { id: 'full_painting', name: 'Pintura Completa', icon: Paintbrush, category: 'home' },
];

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
});

type FormData = z.infer<typeof formSchema>;


function QuoteGeneratorInternal() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const searchParams = useSearchParams();
  const serviceParam = searchParams.get('service');
  const isHomeFlow = serviceParam === 'facade_painting';

  const steps = [
    { id: 'contact', name: 'Tus Datos', fields: ['contactName', 'clientEmail', 'clientPhone', 'contactRole'] },
    { id: 'property', name: isHomeFlow ? 'Tu Propiedad' : 'El Edificio', fields: isHomeFlow ? ['propertyType', 'siteAddress', 'addressDetail'] : ['buildingType', 'siteAddress', 'addressDetail'] },
    { id: 'service', name: 'El Servicio', fields: ['serviceId', 'floors', 'terms'] },
  ];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema.refine(data => {
        if (isHomeFlow) return !!data.propertyType;
        return !!data.buildingType;
    }, {
        message: "Debe seleccionar un tipo.",
        path: [isHomeFlow ? 'propertyType' : 'buildingType']
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
      serviceId: serviceParam ?? undefined,
      floors: 1,
      terms: false,
    },
  });

  const { formState, trigger, getValues, watch } = form;
  const propertyType = watch('propertyType');
  
  const getPageTitle = () => {
    if (isHomeFlow) {
        return "Cotización para tu Hogar";
    }
    if (serviceParam && !isHomeFlow) {
        return "Cotización para Edificios";
    }
    return "Pide tu cotización online";
  }

  const onSubmit = (data: FormData) => {
    console.log("Form Submitted:", data);
    toast({
        title: "Solicitud Enviada",
        description: "Tu solicitud de cotización ha sido enviada con éxito.",
    });
    form.reset();
    setCurrentStep(0);
  };
  
  const nextStep = async () => {
    const fields = steps[currentStep].fields as (keyof FormData)[];
    const output = await trigger(fields, { shouldFocus: true });

    if (!output) return;
    
    if (currentStep < steps.length - 1) {
        setCurrentStep(step => step + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
        setCurrentStep(step => step - 1);
    }
  }
  
  const isStepValid = (stepIndex: number) => {
    const currentFields = steps[stepIndex].fields as (keyof FormData)[];
    
    for (const field of currentFields) {
      if (field === 'contactRole' && isHomeFlow) continue;
      if (field === 'floors' && isHomeFlow && getValues('propertyType') === 'apartment') continue;

      if (formState.errors[field] || !getValues(field)) {
        if(field === 'terms' && !getValues('terms')) return false;
        if(field !== 'terms' && !getValues(field)) return false;
        if(formState.errors[field]) return false;
      }
    }
    
    if(stepIndex === steps.length - 1 && !getValues('terms')) return false;

    return true;
  };


  return (
    <div className="container py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl" style={{color: '#213747'}}>{getPageTitle()}</h1>
      </div>

      <div className="flex justify-center items-center mb-8 gap-2 md:gap-4">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center text-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold",
                currentStep >= index ? "stepper-step-active" : "bg-gray-200 text-gray-500"
              )}>
                {currentStep > index ? '✔' : index + 1}
              </div>
              <p className={cn(
                "mt-2 text-sm w-20",
                currentStep >= index ? "font-semibold text-primary" : "text-muted-foreground"
              )}>{step.name}</p>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "w-12 border-t-2 mt-[-1rem]",
                 currentStep > index ? "border-primary" : "border-gray-300"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl mx-auto">
          <Card>
            {currentStep === 0 && (
              <>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 font-headline"><User size={20} />Tus Datos</CardTitle>
                  <CardDescription>Información del contacto.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="contactName" render={({ field }) => (
                    <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   {!isHomeFlow && <FormField control={form.control} name="contactRole" render={({ field }) => (
                    <FormItem><FormLabel>Cargo (Opcional)</FormLabel><FormControl><Input placeholder="Administrador del Edificio" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />}
                  <FormField control={form.control} name="clientEmail" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="john.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="clientPhone" render={({ field }) => (
                    <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input placeholder="+1 234 567 890" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                </CardContent>
              </>
            )}

            {currentStep === 1 && (
               <>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline">
                        {isHomeFlow ? <Home size={20} /> : <Building size={20} />}
                        {isHomeFlow ? 'Tu Propiedad' : 'El Edificio'}
                    </CardTitle>
                    <CardDescription>
                        {isHomeFlow ? 'Detalles sobre tu casa o departamento.' : 'Detalles sobre la construcción.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    {isHomeFlow ? (
                         <FormField control={form.control} name="propertyType" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Vivienda</FormLabel>
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
                        <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input placeholder="123 Main St, City" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="addressDetail" render={({ field }) => (
                        <FormItem><FormLabel>Detalle Adicional (opcional)</FormLabel><FormControl><Input placeholder="Ej: Casa con rejas blancas, Nro 3..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </CardContent>
              </>
            )}
            
            {currentStep === 2 && (
              <>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Briefcase size={20} />Detalles del Servicio</CardTitle>
                    <CardDescription>Seleccione el servicio y especifique las dimensiones del trabajo.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                  {isHomeFlow ? (
                    <FormField control={form.control} name="serviceId" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Tipo de Servicio</FormLabel>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                {services.filter(s => s.category === 'home').map(s => (
                                    <Card 
                                        key={s.id}
                                        onClick={() => field.onChange(s.id)}
                                        className={cn(
                                            "cursor-pointer hover:shadow-md transition-shadow text-center",
                                            field.value === s.id && "ring-2 ring-primary shadow-md"
                                        )}
                                    >
                                        <CardContent className="p-4 flex flex-col items-center justify-center gap-2">
                                            <s.icon className="w-8 h-8 text-primary" />
                                            <span className="font-semibold text-sm">{s.name}</span>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                          <FormMessage className="pt-2"/>
                        </FormItem>
                      )} />
                  ) : (
                    <FormField control={form.control} name="serviceId" render={({ field }) => (
                        <FormItem className="md:col-span-2">
                        <FormLabel>Tipo de Servicio</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl><SelectTrigger><SelectValue placeholder="Seleccione un servicio..." /></SelectTrigger></FormControl>
                            <SelectContent>
                            {services.filter(s => !s.category).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )} />
                  )}

                  {(!isHomeFlow || (isHomeFlow && propertyType === 'house')) && (
                    <FormField control={form.control} name="floors" render={({ field }) => (
                        <FormItem>
                            <FormLabel>{isHomeFlow ? 'Número de Pisos de la Casa' : 'Número de Pisos'}</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                  )}

                   <FormField control={form.control} name="terms" render={({ field }) => (
                    <FormItem className="md:col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
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
                    <Button type="submit" size="sm" disabled={!isStepValid(currentStep)}>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar
                    </Button>
                )}
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}


// Wrap the main component in a Suspense boundary to use useSearchParams
export default function QuoteGenerator() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <QuoteGeneratorInternal />
    </Suspense>
  );
}
