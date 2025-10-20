
import QuoteGenerator from '@/components/quote-generator';
import Logo from '@/components/logo';
import Link from 'next/link';

export default function CotizarPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="py-4 px-6 border-b">
        <div className="container flex items-center justify-between">
            <Link href="/">
                <Logo />
            </Link>
        </div>
      </header>
      <main className="flex-1">
        <QuoteGenerator />
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
