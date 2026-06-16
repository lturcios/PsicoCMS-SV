import { createBrowserRouter, type RouteObject } from 'react-router-dom';

import { PanelLayout } from '@/components/layout/PanelLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AuthGuard, LoginPage, OnboardingPage, RegisterPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { HomePage, NotFoundPage } from '@/features/public-site';
import { SettingsPage } from '@/features/settings';

export const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'onboarding', element: <OnboardingPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthGuard />,
    children: [
      {
        path: '/panel',
        element: <PanelLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'config', element: <SettingsPage /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
