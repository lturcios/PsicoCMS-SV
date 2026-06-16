import { useController, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@/lib/zod-resolver';

import { useCreateTenant } from '../api/auth.mutations';
import { useAuth } from '../hooks/use-auth';
import type { OnboardingFormValues } from '../schemas';
import { onboardingSchema } from '../schemas';

export function OnboardingPage() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const createTenant = useCreateTenant();

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { displayName: '', slug: '' },
  });

  const { field: slugField } = useController({ name: 'slug', control });

  function onSubmit(values: OnboardingFormValues) {
    if (!session?.user.id) {
      toast.error('No hay sesión activa. Por favor, iniciá sesión primero.');
      navigate('/login');
      return;
    }
    createTenant.mutate(
      { userId: session.user.id, displayName: values.displayName, slug: values.slug },
      {
        onSuccess: () => navigate('/panel'),
        onError: (error) => {
          const msg = error instanceof Error ? error.message : String(error);
          if (msg.includes('tenants_slug_key') || msg.toLowerCase().includes('duplicate')) {
            setError('slug', { message: 'Este identificador ya está en uso, probá con otro' });
          } else {
            toast.error(msg);
          }
        },
      },
    );
  }

  const isPending = isSubmitting || createTenant.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold">Configurá tu consultorio</h1>
            <p className="text-sm text-muted-foreground">
              Este es el primer paso para tener tu agenda en línea.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
              <div className="flex flex-col gap-1">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Nombre del consultorio
                </label>
                <Input
                  id="displayName"
                  type="text"
                  autoComplete="organization"
                  placeholder="Ej: Consultorio Dra. Martínez"
                  aria-invalid={!!errors.displayName}
                  {...register('displayName')}
                />
                {errors.displayName && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.displayName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="slug" className="text-sm font-medium">
                  Identificador público
                </label>
                <Input
                  id="slug"
                  type="text"
                  autoComplete="off"
                  placeholder="tu-nombre"
                  aria-invalid={!!errors.slug}
                  {...slugField}
                  onChange={(e) => {
                    const formatted = e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, '-')
                      .replace(/[^a-z0-9-]/g, '');
                    slugField.onChange(formatted);
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  psicocms.sv/c/{slugField.value !== '' ? slugField.value : 'tu-nombre'}
                </p>
                {errors.slug && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.slug.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Creando consultorio...' : 'Continuar'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
