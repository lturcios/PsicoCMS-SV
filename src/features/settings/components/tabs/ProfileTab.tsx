import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@/lib/zod-resolver';

import { useUpdateClinicSettings } from '../../api/settings.mutations';
import { useClinicSettings } from '../../api/settings.queries';
import type { ProfileFormValues } from '../../schemas';
import { profileSchema } from '../../schemas';

const TITLE_OPTIONS = ['Lic.', 'Dr.', 'Dra.', 'Psic.', 'M.D.'];

function ProfileTabSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-4 w-80 mt-1" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ProfileTab() {
  const settings = useClinicSettings();
  const update = useUpdateClinicSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { professional_name: '', title: '', credential_number: '', bio: '' },
  });

  useEffect(() => {
    if (settings.data) {
      reset({
        professional_name: settings.data.professional_name ?? '',
        title: settings.data.title ?? '',
        credential_number: settings.data.credential_number ?? '',
        bio: settings.data.bio ?? '',
      });
    }
  }, [settings.data, reset]);

  function onSubmit(values: ProfileFormValues) {
    if (!settings.data?.id) return;
    update.mutate(
      {
        id: settings.data.id,
        professional_name: values.professional_name || null,
        title: values.title || null,
        credential_number: values.credential_number || null,
        bio: values.bio || null,
      },
      {
        onSuccess: () => toast.success('Perfil actualizado correctamente'),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Error al guardar el perfil'),
      },
    );
  }

  if (settings.isLoading) return <ProfileTabSkeleton />;

  if (settings.error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-sm text-destructive">
            No se pudo cargar la configuración. Intentá recargar la página.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isPending = isSubmitting || update.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datos del profesional</CardTitle>
        <CardDescription>
          Aparecen en tu página pública y en las comunicaciones con pacientes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="professional_name" className="text-sm font-medium">
                Nombre completo
              </label>
              <Input
                id="professional_name"
                type="text"
                autoComplete="name"
                placeholder="Ej: María García Rodríguez"
                aria-invalid={!!errors.professional_name}
                {...register('professional_name')}
              />
              {errors.professional_name && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.professional_name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="title" className="text-sm font-medium">
                Título profesional
              </label>
              <select
                id="title"
                aria-invalid={!!errors.title}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30"
                {...register('title')}
              >
                <option value="">Sin título</option>
                {TITLE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              {errors.title && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="credential_number" className="text-sm font-medium">
              Número de colegiatura (JVPP)
            </label>
            <Input
              id="credential_number"
              type="text"
              placeholder="Ej: 2345-PS"
              aria-invalid={!!errors.credential_number}
              {...register('credential_number')}
            />
            {errors.credential_number && (
              <p className="text-sm text-destructive" role="alert">
                {errors.credential_number.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="bio" className="text-sm font-medium">
              Biografía
            </label>
            <Textarea
              id="bio"
              rows={5}
              placeholder="Contá quién sos, tu especialidad, tu enfoque terapéutico..."
              aria-invalid={!!errors.bio}
              {...register('bio')}
            />
            <p className="text-xs text-muted-foreground">Máximo 1000 caracteres</p>
            {errors.bio && (
              <p className="text-sm text-destructive" role="alert">
                {errors.bio.message}
              </p>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending || !isDirty}>
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
