import { CalendarDays, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSignOut } from '@/features/auth';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';

const NAV_ITEMS = [
  { to: '/panel', icon: LayoutDashboard, label: 'Panel', end: true },
  { to: '/panel/pacientes', icon: Users, label: 'Pacientes', end: false },
  { to: '/panel/agenda', icon: CalendarDays, label: 'Agenda', end: false },
  { to: '/panel/config', icon: Settings, label: 'Configuración', end: false },
] as const;

export function AppSidebar() {
  const { isOpen, close } = useSidebarStore();
  const signOut = useSignOut();

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-background transition-transform duration-200',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:static md:flex md:translate-x-0',
      )}
    >
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <span className="text-lg font-semibold tracking-tight">PsicoCMS SV</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={close}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground/60 hover:bg-accent/50 hover:text-foreground',
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Sign out */}
      <div className="shrink-0 border-t border-border p-3">
        <button
          type="button"
          onClick={() => signOut.mutate()}
          disabled={signOut.isPending}
          className={cn(
            'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'text-foreground/60 hover:bg-accent/50 hover:text-foreground',
            'disabled:pointer-events-none disabled:opacity-50',
          )}
        >
          <LogOut className="size-4 shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
