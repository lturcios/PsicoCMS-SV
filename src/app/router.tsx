import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import { PanelLayout } from '@/components/layout/PanelLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { DashboardPage } from '@/features/dashboard';
import { HomePage, NotFoundPage } from '@/features/public-site';

export const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    path: '/panel',
    element: <PanelLayout />,
    children: [{ index: true, element: <DashboardPage /> }],
  },
];

export const router = createBrowserRouter(routes);
