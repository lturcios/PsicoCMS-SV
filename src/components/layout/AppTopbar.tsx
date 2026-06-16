import { Menu } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth, useProfile, useSignOut } from '@/features/auth';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/stores/sidebar-store';
import { ThemeToggle } from './ThemeToggle';
import { ThemeVariantToggle } from './ThemeVariantToggle';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

export function AppTopbar() {
  const { toggle } = useSidebarStore();
  const { session } = useAuth();
  const { data: profile } = useProfile(session?.user.id);
  const signOut = useSignOut();

  const initials = profile?.display_name ? getInitials(profile.display_name) : '';

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur">
      {/* Hamburger — mobile only */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Abrir menú"
        className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'md:hidden')}
      >
        <Menu className="size-5" />
      </button>

      {/* App name — visible in mobile when sidebar is closed */}
      <span className="text-base font-semibold md:hidden">PsicoCMS SV</span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme controls */}
      <ThemeVariantToggle />
      <ThemeToggle />

      {/* User avatar + dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Menú de usuario"
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-9 rounded-full')}
        >
          <span
            className={cn(
              'flex size-8 items-center justify-center rounded-full text-xs font-semibold',
              profile ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground',
            )}
          >
            {initials || '…'}
          </span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-48">
          {profile?.display_name && (
            <>
              <DropdownMenuLabel>{profile.display_name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem onClick={() => signOut.mutate()} disabled={signOut.isPending}>
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
