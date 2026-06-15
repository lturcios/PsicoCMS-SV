import { Link } from 'react-router-dom';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Página no encontrada</h1>
      <p className="text-muted-foreground">La página que buscás no existe o fue movida.</p>
      <Link to="/" className={cn(buttonVariants({ variant: 'default' }))}>
        Volver al inicio
      </Link>
    </div>
  );
}
