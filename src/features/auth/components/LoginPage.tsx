import { useState } from 'react';

import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@/lib/zod-resolver';

import { useMagicLink, useSignIn } from '../api/auth.mutations';
import type { MagicLinkFormValues, SignInFormValues } from '../schemas';
import { magicLinkSchema, signInSchema } from '../schemas';

export function LoginPage() {
  const navigate = useNavigate();
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const signIn = useSignIn();
  const magicLink = useMagicLink();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
  });

  const {
    register: registerMagicLink,
    handleSubmit: handleSubmitMagicLink,
    formState: { errors: magicLinkErrors, isSubmitting: isMagicLinkSubmitting },
  } = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkSchema),
  });

  function onSubmit(values: SignInFormValues) {
    signIn.mutate(values, {
      onSuccess: () => {
        navigate('/panel');
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }

  function onMagicLinkSubmit(values: MagicLinkFormValues) {
    magicLink.mutate(values, {
      onSuccess: () => {
        setMagicLinkSent(true);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }

  const isPending = isSubmitting || signIn.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold">Iniciar sesión</h1>
            <p className="text-sm text-muted-foreground">Ingresá a tu cuenta de PsicoCMS</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3" noValidate>
              <div className="flex flex-col gap-1">
                <label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label htmlFor="password" className="text-sm font-medium">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
                {errors.password && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Ingresando...' : 'Iniciar sesión'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">o</span>
              </div>
            </div>

            {magicLinkSent ? (
              <p className="text-center text-sm text-muted-foreground">
                Revisá tu correo para ingresar sin contraseña.
              </p>
            ) : (
              <form
                onSubmit={handleSubmitMagicLink(onMagicLinkSubmit)}
                className="flex flex-col gap-3"
                noValidate
              >
                <div className="flex flex-col gap-1">
                  <label htmlFor="magic-email" className="text-sm font-medium">
                    Acceso sin contraseña
                  </label>
                  <Input
                    id="magic-email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    aria-invalid={!!magicLinkErrors.email}
                    {...registerMagicLink('email')}
                  />
                  {magicLinkErrors.email && (
                    <p className="text-sm text-destructive" role="alert">
                      {magicLinkErrors.email.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full"
                  disabled={isMagicLinkSubmitting || magicLink.isPending}
                >
                  {magicLink.isPending ? 'Enviando...' : 'Enviar enlace mágico'}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground">
              ¿No tenés cuenta?{' '}
              <a href="/register" className="text-primary underline-offset-4 hover:underline">
                Registrate
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
