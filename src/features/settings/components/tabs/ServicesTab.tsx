import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@/lib/zod-resolver';
import {
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
} from '../../api/services';
import { useCreateSpecialty, useDeleteSpecialty, useSpecialties } from '../../api/specialties';
import type { ServiceFormValues, SpecialtyFormValues } from '../../schemas';
import { serviceSchema, specialtySchema } from '../../schemas';
import type { Service } from '../../types';

const MODALITY_LABELS: Record<string, string> = {
  presencial: 'Presencial',
  online: 'En línea',
  ambas: 'Presencial + En línea',
};

// ─── Specialties section ────────────────────────────────────────────────────

function SpecialtiesSection() {
  const specialties = useSpecialties();
  const createSpecialty = useCreateSpecialty();
  const deleteSpecialty = useDeleteSpecialty();
  const [adding, setAdding] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SpecialtyFormValues>({ resolver: zodResolver(specialtySchema) });

  function onAdd(values: SpecialtyFormValues) {
    createSpecialty.mutate(values.name, {
      onSuccess: () => {
        toast.success('Especialidad agregada');
        reset();
        setAdding(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Error al agregar especialidad'),
    });
  }

  function onDelete(id: string, name: string) {
    deleteSpecialty.mutate(id, {
      onSuccess: () => toast.success(`"${name}" eliminada`),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Error al eliminar especialidad'),
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Especialidades</CardTitle>
        <CardDescription>Áreas de práctica que aparecen en tu página pública.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {specialties.isLoading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-7 w-28 rounded-full" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {specialties.data?.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-sm"
              >
                {s.name}
                <button
                  type="button"
                  aria-label={`Eliminar ${s.name}`}
                  disabled={deleteSpecialty.isPending}
                  className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                  onClick={() => onDelete(s.id, s.name)}
                >
                  ×
                </button>
              </span>
            ))}
            {specialties.data?.length === 0 && !adding && (
              <p className="text-sm text-muted-foreground">Sin especialidades aún.</p>
            )}
          </div>
        )}

        {adding ? (
          <form onSubmit={handleSubmit(onAdd)} className="flex items-start gap-2">
            <div className="flex flex-1 flex-col gap-1">
              <Input
                autoFocus
                placeholder="Ej: Terapia cognitivo-conductual"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>
            <Button type="submit" size="sm" disabled={createSpecialty.isPending}>
              {createSpecialty.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setAdding(false);
                reset();
              }}
            >
              Cancelar
            </Button>
          </form>
        ) : (
          <Button type="button" variant="outline" size="sm" onClick={() => setAdding(true)}>
            + Agregar especialidad
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Service dialog ──────────────────────────────────────────────────────────

interface ServiceDialogProps {
  open: boolean;
  service: Service | null;
  onClose: () => void;
}

function ServiceDialog({ open, service, onClose }: ServiceDialogProps) {
  const createService = useCreateService();
  const updateService = useUpdateService();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      modality: 'presencial',
      duration_minutes: 50,
      price_usd: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        description: service.description ?? '',
        modality: service.modality as ServiceFormValues['modality'],
        duration_minutes: service.duration_minutes,
        price_usd: service.price_usd ?? 0,
        is_active: service.is_active,
      });
    } else {
      reset({
        name: '',
        description: '',
        modality: 'presencial',
        duration_minutes: 50,
        price_usd: 0,
        is_active: true,
      });
    }
  }, [service, reset]);

  function onSubmit(values: ServiceFormValues) {
    const patch = { ...values, description: values.description || null };

    if (service) {
      updateService.mutate(
        { id: service.id, ...patch },
        {
          onSuccess: () => {
            toast.success('Servicio actualizado');
            onClose();
          },
          onError: (err) =>
            toast.error(err instanceof Error ? err.message : 'Error al actualizar servicio'),
        },
      );
    } else {
      createService.mutate(values, {
        onSuccess: () => {
          toast.success('Servicio creado');
          onClose();
        },
        onError: (err) =>
          toast.error(err instanceof Error ? err.message : 'Error al crear servicio'),
      });
    }
  }

  const isPending = isSubmitting || createService.isPending || updateService.isPending;
  const isActive = watch('is_active');

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{service ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
          <DialogDescription>
            Los servicios aparecen en tu página de reservas pública.
          </DialogDescription>
        </DialogHeader>

        <form id="service-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="svc-name" className="text-sm font-medium">
              Nombre
            </label>
            <Input
              id="svc-name"
              placeholder="Ej: Consulta individual"
              aria-invalid={!!errors.name}
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="svc-description" className="text-sm font-medium">
              Descripción <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <Textarea
              id="svc-description"
              rows={3}
              placeholder="Breve descripción del servicio..."
              aria-invalid={!!errors.description}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="svc-modality" className="text-sm font-medium">
                Modalidad
              </label>
              <select
                id="svc-modality"
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
                {...register('modality')}
              >
                <option value="presencial">Presencial</option>
                <option value="online">En línea</option>
                <option value="ambas">Presencial + En línea</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="svc-duration" className="text-sm font-medium">
                Duración (min)
              </label>
              <Input
                id="svc-duration"
                type="number"
                min={1}
                aria-invalid={!!errors.duration_minutes}
                {...register('duration_minutes')}
              />
              {errors.duration_minutes && (
                <p className="text-xs text-destructive" role="alert">
                  {errors.duration_minutes.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="svc-price" className="text-sm font-medium">
              Precio (US$)
            </label>
            <Input
              id="svc-price"
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              aria-invalid={!!errors.price_usd}
              {...register('price_usd')}
            />
            {errors.price_usd && (
              <p className="text-xs text-destructive" role="alert">
                {errors.price_usd.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="svc-active"
              checked={isActive}
              onCheckedChange={(v) => setValue('is_active', v, { shouldDirty: true })}
            />
            <label htmlFor="svc-active" className="text-sm">
              Servicio activo
            </label>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="service-form" disabled={isPending}>
            {isPending ? 'Guardando...' : service ? 'Guardar cambios' : 'Crear servicio'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Services section ────────────────────────────────────────────────────────

function ServicesSection() {
  const services = useServices();
  const deleteService = useDeleteService();
  const [dialogState, setDialogState] = useState<{ open: boolean; service: Service | null }>({
    open: false,
    service: null,
  });

  function openCreate() {
    setDialogState({ open: true, service: null });
  }

  function openEdit(service: Service) {
    setDialogState({ open: true, service });
  }

  function closeDialog() {
    setDialogState({ open: false, service: null });
  }

  function onDelete(id: string, name: string) {
    deleteService.mutate(id, {
      onSuccess: () => toast.success(`"${name}" eliminado`),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Error al eliminar servicio'),
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Servicios</CardTitle>
            <CardDescription>Los servicios que ofrecés a tus pacientes.</CardDescription>
          </div>
          <Button size="sm" onClick={openCreate}>
            + Agregar
          </Button>
        </CardHeader>
        <CardContent>
          {services.isLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : services.data?.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Sin servicios aún. Agregá el primero.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {services.data?.map((svc) => (
                <li key={svc.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium">{svc.name}</span>
                      {!svc.is_active && (
                        <Badge variant="secondary" className="shrink-0">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {MODALITY_LABELS[svc.modality] ?? svc.modality} · {svc.duration_minutes} min
                      {svc.price_usd != null && svc.price_usd > 0
                        ? ` · $${svc.price_usd.toFixed(2)}`
                        : ' · Gratis'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(svc)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      disabled={deleteService.isPending}
                      onClick={() => onDelete(svc.id, svc.name)}
                    >
                      Eliminar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ServiceDialog open={dialogState.open} service={dialogState.service} onClose={closeDialog} />
    </>
  );
}

// ─── Main tab ────────────────────────────────────────────────────────────────

export function ServicesTab() {
  return (
    <div className="space-y-6">
      <SpecialtiesSection />
      <ServicesSection />
    </div>
  );
}
