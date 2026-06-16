import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

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
  useAvailabilityExceptions,
  useAvailabilitySchedules,
  useCreateException,
  useDeleteException,
  useUpsertSchedules,
} from '../../api/schedules';
import type { ExceptionFormValues, WeeklyScheduleFormValues } from '../../schemas';
import { exceptionSchema, weeklyScheduleSchema } from '../../schemas';
import type { AvailabilitySchedule } from '../../types';

const DAYS: { day_of_week: number; label: string }[] = [
  { day_of_week: 1, label: 'Lunes' },
  { day_of_week: 2, label: 'Martes' },
  { day_of_week: 3, label: 'Miércoles' },
  { day_of_week: 4, label: 'Jueves' },
  { day_of_week: 5, label: 'Viernes' },
  { day_of_week: 6, label: 'Sábado' },
  { day_of_week: 0, label: 'Domingo' },
];

function toTimeInput(t: string): string {
  return t.slice(0, 5);
}

function buildDefaultDays(
  loaded: AvailabilitySchedule[] | undefined,
): WeeklyScheduleFormValues['days'] {
  return DAYS.map((d) => {
    const existing = loaded?.find((s) => s.day_of_week === d.day_of_week);
    return {
      day_of_week: d.day_of_week,
      is_active: existing?.is_active ?? false,
      start_time: existing ? toTimeInput(existing.start_time) : '08:00',
      end_time: existing ? toTimeInput(existing.end_time) : '17:00',
    };
  });
}

// ─── Weekly schedule section ─────────────────────────────────────────────────

function WeeklyScheduleSection() {
  const schedules = useAvailabilitySchedules();
  const upsert = useUpsertSchedules();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<WeeklyScheduleFormValues>({
    resolver: zodResolver(weeklyScheduleSchema),
    defaultValues: { days: buildDefaultDays(undefined) },
  });

  useEffect(() => {
    if (schedules.data !== undefined) {
      reset({ days: buildDefaultDays(schedules.data) });
    }
  }, [schedules.data, reset]);

  const days = watch('days');

  function onSubmit(values: WeeklyScheduleFormValues) {
    upsert.mutate(values, {
      onSuccess: () => toast.success('Horario guardado'),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Error al guardar el horario'),
    });
  }

  if (schedules.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horario semanal</CardTitle>
        <CardDescription>Días y horas en que recibís consultas.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="divide-y divide-border">
            {DAYS.map((d, i) => {
              const isActive = days[i]?.is_active ?? false;
              const dayError = errors.days?.[i];

              return (
                <div key={d.day_of_week} className="flex flex-wrap items-center gap-3 py-3">
                  <Switch
                    id={`day-${d.day_of_week}`}
                    checked={isActive}
                    onCheckedChange={(checked) =>
                      setValue(`days.${i}.is_active`, checked, { shouldDirty: true })
                    }
                  />
                  <label htmlFor={`day-${d.day_of_week}`} className="w-24 text-sm font-medium">
                    {d.label}
                  </label>

                  {isActive ? (
                    <div className="flex flex-1 flex-wrap items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          aria-label={`Hora inicio ${d.label}`}
                          className="w-32"
                          {...register(`days.${i}.start_time`)}
                        />
                        <span className="text-sm text-muted-foreground">a</span>
                        <Input
                          type="time"
                          aria-label={`Hora fin ${d.label}`}
                          className="w-32"
                          {...register(`days.${i}.end_time`)}
                        />
                      </div>
                      {dayError?.end_time && (
                        <p className="w-full text-xs text-destructive" role="alert">
                          {dayError.end_time.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No disponible</span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex justify-end">
            <Button type="submit" disabled={upsert.isPending || !isDirty}>
              {upsert.isPending ? 'Guardando...' : 'Guardar horario'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// ─── Exception dialog ────────────────────────────────────────────────────────

interface ExceptionDialogProps {
  open: boolean;
  onClose: () => void;
}

function ExceptionDialog({ open, onClose }: ExceptionDialogProps) {
  const createException = useCreateException();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ExceptionFormValues>({
    resolver: zodResolver(exceptionSchema),
    defaultValues: { date: '', type: 'blocked', reason: '', start_time: '', end_time: '' },
  });

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const exceptionType = watch('type');

  function onSubmit(values: ExceptionFormValues) {
    createException.mutate(values, {
      onSuccess: () => {
        toast.success('Excepción agregada');
        onClose();
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : 'Error al guardar la excepción'),
    });
  }

  const isPending = isSubmitting || createException.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar excepción</DialogTitle>
          <DialogDescription>
            Bloqueá un día o configurá un horario diferente para una fecha puntual.
          </DialogDescription>
        </DialogHeader>

        <form
          id="exception-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="exc-date" className="text-sm font-medium">
              Fecha
            </label>
            <Input id="exc-date" type="date" aria-invalid={!!errors.date} {...register('date')} />
            {errors.date && (
              <p className="text-xs text-destructive" role="alert">
                {errors.date.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="exc-type" className="text-sm font-medium">
              Tipo
            </label>
            <select
              id="exc-type"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              {...register('type')}
            >
              <option value="blocked">Día bloqueado (sin consultas)</option>
              <option value="special_hours">Horario especial</option>
            </select>
          </div>

          {exceptionType === 'special_hours' && (
            <div className="flex items-center gap-2">
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="exc-start" className="text-sm font-medium">
                  Desde
                </label>
                <Input
                  id="exc-start"
                  type="time"
                  aria-invalid={!!errors.start_time}
                  {...register('start_time')}
                />
                {errors.start_time && (
                  <p className="text-xs text-destructive" role="alert">
                    {errors.start_time.message}
                  </p>
                )}
              </div>
              <span className="mt-6 text-sm text-muted-foreground">a</span>
              <div className="flex flex-1 flex-col gap-1.5">
                <label htmlFor="exc-end" className="text-sm font-medium">
                  Hasta
                </label>
                <Input
                  id="exc-end"
                  type="time"
                  aria-invalid={!!errors.end_time}
                  {...register('end_time')}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="exc-reason" className="text-sm font-medium">
              Motivo <span className="font-normal text-muted-foreground">(opcional)</span>
            </label>
            <Textarea
              id="exc-reason"
              rows={2}
              placeholder="Ej: Feriado, Capacitación, Vacaciones..."
              {...register('reason')}
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" form="exception-form" disabled={isPending}>
            {isPending ? 'Guardando...' : 'Agregar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Exceptions section ───────────────────────────────────────────────────────

const EXCEPTION_TYPE_LABELS: Record<string, string> = {
  blocked: 'Bloqueado',
  special_hours: 'Horario especial',
};

function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

function ExceptionsSection() {
  const exceptions = useAvailabilityExceptions();
  const deleteException = useDeleteException();
  const [dialogOpen, setDialogOpen] = useState(false);

  function onDelete(id: string) {
    deleteException.mutate(id, {
      onSuccess: () => toast.success('Excepción eliminada'),
      onError: (err) => toast.error(err instanceof Error ? err.message : 'Error al eliminar'),
    });
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Excepciones y bloqueos</CardTitle>
            <CardDescription>
              Días con horario diferente o sin disponibilidad (feriados, vacaciones, etc.).
            </CardDescription>
          </div>
          <Button size="sm" onClick={() => setDialogOpen(true)}>
            + Agregar
          </Button>
        </CardHeader>
        <CardContent>
          {exceptions.isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : exceptions.data?.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Sin excepciones registradas.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {exceptions.data?.map((exc) => (
                <li key={exc.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{formatDate(exc.date)}</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {EXCEPTION_TYPE_LABELS[exc.type] ?? exc.type}
                      </span>
                    </div>
                    {exc.reason && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{exc.reason}</p>
                    )}
                    {exc.start_time && exc.end_time && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {toTimeInput(exc.start_time)} – {toTimeInput(exc.end_time)}
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:text-destructive"
                    disabled={deleteException.isPending}
                    onClick={() => onDelete(exc.id)}
                  >
                    Eliminar
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <ExceptionDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </>
  );
}

// ─── Main tab ────────────────────────────────────────────────────────────────

export function ScheduleTab() {
  return (
    <div className="space-y-6">
      <WeeklyScheduleSection />
      <ExceptionsSection />
    </div>
  );
}
