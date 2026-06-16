import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@/lib/zod-resolver';

import { useSignUp } from '../api/auth.mutations';
import type { SignUpFormValues } from '../schemas';
import { signUpSchema } from '../schemas';

export function RegisterPage() {
  const navigate = useNavigate();
  const signUp = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
  });

  function onSubmit(values: SignUpFormValues) {
    signUp.mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: (data) => {
          if (data.session) {
            navigate('/onboarding');
          } else {
            toast.success(
              'Revisá tu correo electrónico y hacé clic en el enlace de confirmación para continuar.',
            );
          }
        },
        onError: (error) => {
          toast.error(error.message);
        },
      },
    );
  }

  const isPending = isSubmitting || signUp.isPending;

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold">Crear cuenta</h1>
            <p className="text-sm text-muted-foreground">
              Registrate para comenzar a usar PsicoCMS
            </p>
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
                  autoComplete="new-password"
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

              <div className="flex flex-col gap-1">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirmar contraseña
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••"
                  aria-invalid={!!errors.confirmPassword}
                  {...register('confirmPassword')}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{' '}
              <a href="/login" className="text-primary underline-offset-4 hover:underline">
                Iniciá sesión
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
