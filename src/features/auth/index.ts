export {
  useCreateTenant,
  useMagicLink,
  useSignIn,
  useSignOut,
  useSignUp,
} from './api/auth.mutations';
export { authKeys, useProfile } from './api/auth.queries';
export { AuthGuard } from './components/AuthGuard';
export { default as AuthProvider } from './components/AuthProvider';
export { LoginPage } from './components/LoginPage';
export { OnboardingPage } from './components/OnboardingPage';
export { RegisterPage } from './components/RegisterPage';
export { useAuth } from './hooks/use-auth';
export { useIsOwner } from './hooks/use-is-owner';
export type {
  MagicLinkFormValues,
  OnboardingFormValues,
  SignInFormValues,
  SignUpFormValues,
} from './schemas';
export { magicLinkSchema, onboardingSchema, signInSchema, signUpSchema } from './schemas';
export type { AuthState, Profile, UserRole } from './types';
