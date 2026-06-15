import { Outlet } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { ThemeVariantToggle } from './ThemeVariantToggle';

// Layout mínimo del panel privado. La Fase 1 lo reemplaza por sidebar + topbar
// con contexto de tenant y rutas protegidas (ver docs/04-Plan-de-Fases.md).
export function PanelLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 w-full items-center justify-between gap-4 px-4">
          <span className="text-lg font-semibold">Panel</span>
          <div className="flex items-center gap-2">
            <ThemeVariantToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-8 p-4">
        <Outlet />
      </main>
    </div>
  );
}
