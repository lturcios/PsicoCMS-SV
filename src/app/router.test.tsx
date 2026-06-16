import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AuthProvider } from '@/features/auth';

import { routes } from './router';

// Mock supabase so AuthProvider and useProfile don't hit the network.
// getSession resolves with null session (unauthenticated state).
vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

function renderWithProviders(initialPath: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const memoryRouter = createMemoryRouter(routes, { initialEntries: [initialPath] });

  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={memoryRouter} />
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('router', () => {
  it('renders the public home page at /', () => {
    renderWithProviders('/');

    expect(
      screen.getByRole('heading', { name: /bienvenido a psicocms sv/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('redirects unauthenticated users from /panel to /login', async () => {
    renderWithProviders('/panel');

    // AuthGuard: isLoading=true initially → LoadingScreen; then session=null → Navigate to /login
    const heading = await screen.findByRole('heading', { name: /iniciar sesión/i });
    expect(heading).toBeInTheDocument();
  });

  it('renders the not found page for unknown routes', () => {
    renderWithProviders('/ruta-inexistente');

    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument();
  });
});
