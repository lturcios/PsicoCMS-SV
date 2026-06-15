import { Check, Palette } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { type ThemeVariant, useThemeStore } from '@/stores/theme-store';

const VARIANT_OPTIONS: Array<{ value: ThemeVariant; label: string }> = [
  { value: 'base', label: 'Base' },
  { value: 'salvia', label: 'Salvia' },
];

export function ThemeVariantToggle() {
  const variant = useThemeStore((state) => state.variant);
  const setVariant = useThemeStore((state) => state.setVariant);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(buttonVariants({ variant: 'outline', size: 'icon' }))}
        aria-label="Cambiar tema de color"
      >
        <Palette />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {VARIANT_OPTIONS.map(({ value, label }) => (
          <DropdownMenuItem key={value} onClick={() => setVariant(value)}>
            {label}
            {variant === value && <Check className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
