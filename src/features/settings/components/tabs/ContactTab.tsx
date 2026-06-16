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
import type { ContactFormValues, PolicyFormValues } from '../../schemas';
import { contactSchema, policySchema } from '../../schemas';

const SV_DEPARTMENTS = [
  'Ahuachapán',
  'Cabañas',
  'Chalatenango',
  'Cuscatlán',
  'La Libertad',
  'La Paz',
  'La Unión',
  'Morazán',
  'San Miguel',
  'San Salvador',
  'San Vicente',
  'Santa Ana',
  'Sonsonate',
  'Usulután',
];

const SELECT_CLASS =
  'h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30';

// ─── Contact card ─────────────────────────────────────────────────────────────

function ContactCard() {
  const settings = useClinicSettings();
  const update = useUpdateClinicSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      phone: '',
      whatsapp: '',
      department: '',
      municipality: '',
      address: '',
      instagram_url: '',
      facebook_url: '',
      website_url: '',
    },
  });

  useEffect(() => {
    if (settings.data) {
      reset({
        phone: settings.data.phone ?? '',
        whatsapp: settings.data.whatsapp ?? '',
        department: settings.data.department ?? '',
        municipality: settings.data.municipality ?? '',
        address: settings.data.address ?? '',
        instagram_url: settings.data.instagram_url ?? '',
        facebook_url: settings.data.facebook_url ?? '',
        website_url: settings.data.website_url ?? '',
      });
    }
  }, [settings.data, reset]);

  function onSubmit(values: ContactFormValues) {
    if (!settings.data?.id) return;
    update.mutate(
      {
        id: settings.data.id,
        phone: values.phone || null,
        whatsapp: values.whatsapp || null,
        department: values.department || null,
        municipality: values.municipality || null,
        address: values.address || null,
        instagram_url: values.instagram_url || null,
        facebook_url: values.facebook_url || null,
        website_url: values.website_url || null,
      },
      {
        onSuccess: () => toast.success('Contacto actualizado'),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Error al guardar el contacto'),
      },
    );
  }

  if (settings.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const isPending = isSubmitting || update.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contacto y ubicación</CardTitle>
        <CardDescription>Datos de contacto y dirección del consultorio.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-sm font-medium">
                Celular
              </label>
              <Input id="phone" type="tel" placeholder="+503 7000-0000" {...register('phone')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="whatsapp" className="text-sm font-medium">
                WhatsApp
              </label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+503 7000-0000"
                {...register('whatsapp')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="department" className="text-sm font-medium">
                Departamento
              </label>
              <select id="department" className={SELECT_CLASS} {...register('department')}>
                <option value="">— Seleccioná —</option>
                {SV_DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="municipality" className="text-sm font-medium">
                Municipio
              </label>
              <Input
                id="municipality"
                type="text"
                placeholder="Ej: San Salvador"
                {...register('municipality')}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="address" className="text-sm font-medium">
              Dirección del consultorio
            </label>
            <Textarea
              id="address"
              rows={2}
              placeholder="Ej: Col. Escalón, 79 Av. Norte, Edif. Médico, 3er piso, local 305"
              aria-invalid={!!errors.address}
              {...register('address')}
            />
            {errors.address && (
              <p className="text-xs text-destructive" role="alert">
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="pt-2">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Redes sociales y web
            </h3>
            <div className="space-y-3">
              {(
                [
                  {
                    id: 'instagram_url',
                    label: 'Instagram',
                    placeholder: 'https://instagram.com/tu_perfil',
                  },
                  {
                    id: 'facebook_url',
                    label: 'Facebook',
                    placeholder: 'https://facebook.com/tu_pagina',
                  },
                  { id: 'website_url', label: 'Sitio web', placeholder: 'https://tu-sitio.com' },
                ] as const
              ).map(({ id, label, placeholder }) => (
                <div key={id} className="flex flex-col gap-1.5">
                  <label htmlFor={id} className="text-sm font-medium">
                    {label}
                  </label>
                  <Input
                    id={id}
                    type="url"
                    placeholder={placeholder}
                    aria-invalid={!!errors[id]}
                    {...register(id)}
                  />
                  {errors[id] && (
                    <p className="text-xs text-destructive" role="alert">
                      {errors[id]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending || !isDirty}>
              {isPending ? 'Guardando...' : 'Guardar contacto'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Policy card ──────────────────────────────────────────────────────────────

function PolicyCard() {
  const settings = useClinicSettings();
  const update = useUpdateClinicSettings();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PolicyFormValues>({
    resolver: zodResolver(policySchema),
    defaultValues: { cancellation_hours: 24, min_advance_hours: 24 },
  });

  useEffect(() => {
    if (settings.data) {
      reset({
        cancellation_hours: settings.data.cancellation_hours,
        min_advance_hours: settings.data.min_advance_hours,
      });
    }
  }, [settings.data, reset]);

  function onSubmit(values: PolicyFormValues) {
    if (!settings.data?.id) return;
    update.mutate(
      { id: settings.data.id, ...values },
      {
        onSuccess: () => toast.success('Política actualizada'),
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Error al guardar la política'),
      },
    );
  }

  if (settings.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </CardContent>
      </Card>
    );
  }

  const isPending = isSubmitting || update.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Política de atención</CardTitle>
        <CardDescription>
          Reglas de cancelación y reserva que se aplican al motor de citas.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="cancellation_hours" className="text-sm font-medium">
                Cancelación con anticipación mínima (horas)
              </label>
              <Input
                id="cancellation_hours"
                type="number"
                min={0}
                aria-invalid={!!errors.cancellation_hours}
                {...register('cancellation_hours')}
              />
              <p className="text-xs text-muted-foreground">
                El paciente puede cancelar hasta X horas antes de la cita. 0 = sin límite.
              </p>
              {errors.cancellation_hours && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.cancellation_hours.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="min_advance_hours" className="text-sm font-medium">
                Reserva con anticipación mínima (horas)
              </label>
              <Input
                id="min_advance_hours"
                type="number"
                min={0}
                aria-invalid={!!errors.min_advance_hours}
                {...register('min_advance_hours')}
              />
              <p className="text-xs text-muted-foreground">
                El paciente debe reservar con al menos X horas de anticipación. 0 = mismo día.
              </p>
              {errors.min_advance_hours && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.min_advance_hours.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isPending || !isDirty}>
              {isPending ? 'Guardando...' : 'Guardar política'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Main tab ────────────────────────────────────────────────────────────────

export function ContactTab() {
  return (
    <div className="space-y-6">
      <ContactCard />
      <PolicyCard />
    </div>
  );
}
