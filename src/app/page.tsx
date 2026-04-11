
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Home as HomeIcon, Briefcase } from 'lucide-react';
import Logo from '@/components/logo';

const mainCategories = [
  {
    id: 'remodelacion_edificio',
    name: 'Remodelación Edificio Comunitario',
    icon: Building,
    description: 'Soluciones integrales para edificios y comunidades.',
    href: '/cotizar',
  },
  {
    id: 'pintura_hogar',
    name: 'Pintar mi Hogar',
    icon: HomeIcon,
    description: 'Renueva el interior o exterior de tu casa.',
    href: '/cotizar?service=facade_painting',
  },
  {
    id: 'corredor_propiedades',
    name: 'Pintura para Corredor de Propiedades',
    icon: Briefcase,
    description: 'Blanqueado pre entrega y pintura decorativa para inmobiliarias.',
    href: '/cotizar?service=broker',
  },
];


export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1">
        <div className="container py-12 md:py-20">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
                <Logo />
            </div>
            <h1 className="text-4xl font-bold font-headline tracking-tighter sm:text-5xl" style={{color: '#213747'}}>
              Hola, ¿Qué necesitas hoy?
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground md:text-xl">
              Selecciona una categoría para comenzar a generar tu cotización de manera rápida y sencilla.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {mainCategories.map((category) => (
              <Link href={category.href} key={category.id} passHref>
                <Card className="h-full flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 cursor-pointer group">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <category.icon className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
                    <CardTitle className="font-headline text-lg">{category.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <footer className="py-6 md:px-8 md:py-0">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-24 md:flex-row">
          <p className="text-balance text-center text-sm leading-loose text-muted-foreground">
            Desarrollado por Jean Pérez - SMARTSYS
          </p>
        </div>
      </footer>
    </div>
  );
}
