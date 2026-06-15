import { Outlet } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { ThemeVariantToggle } from './ThemeVariantToggle';

export function PublicLayout() {
  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <span className="text-lg font-semibold">PsicoCMS SV</span>
          <div className="flex items-center gap-2">
            <ThemeVariantToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
