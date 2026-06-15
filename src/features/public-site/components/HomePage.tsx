import { Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const TOKEN_SWATCHES = [
  { label: 'Primario', className: 'bg-primary text-primary-foreground' },
  { label: 'Secundario', className: 'bg-secondary text-secondary-foreground' },
  { label: 'Acento', className: 'bg-accent text-accent-foreground' },
  { label: 'Atenuado', className: 'bg-muted text-muted-foreground' },
  { label: 'Destructivo', className: 'bg-destructive text-destructive-foreground' },
] as const;

export function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Bienvenido a PsicoCMS SV
        </h1>
        <p className="text-muted-foreground">
          Tu consultorio, tu agenda y tu sitio web en un solo lugar — sin saber programar.
        </p>
      </section>

      <section aria-labelledby="tokens-heading" className="flex flex-col gap-4">
        <h2 id="tokens-heading" className="text-lg font-medium">
          Paleta de tokens del tema actual
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {TOKEN_SWATCHES.map(({ label, className }) => (
            <div
              key={label}
              className={cn(
                'flex h-20 flex-col items-center justify-center rounded-lg border border-border text-sm font-medium',
                className,
              )}
            >
              {label}
            </div>
          ))}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Reservá tu primera sesión</CardTitle>
          <CardDescription>
            Dejanos tu correo y te avisamos cuando el agendamiento en línea esté disponible.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            toast.success('¡Listo! Te vamos a avisar apenas esté disponible.');
          }}
        >
          <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="email">
              Correo electrónico
            </label>
            <Input id="email" type="email" placeholder="tu@correo.com" required />
            <Button type="submit">
              <Mail />
              Notificarme
            </Button>
          </CardContent>
        </form>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Zona horaria: America/El_Salvador · Moneda: US$
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
