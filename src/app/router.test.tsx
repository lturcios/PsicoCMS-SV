import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { routes } from './router';

describe('router', () => {
  it('renders the public home page at /', () => {
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/'] });
    render(<RouterProvider router={memoryRouter} />);

    expect(
      screen.getByRole('heading', { name: /bienvenido a psicocms sv/i, level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders the panel placeholder at /panel', () => {
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/panel'] });
    render(<RouterProvider router={memoryRouter} />);

    expect(screen.getByRole('heading', { name: /panel del consultorio/i })).toBeInTheDocument();
  });

  it('renders the not found page for unknown routes', () => {
    const memoryRouter = createMemoryRouter(routes, { initialEntries: ['/ruta-inexistente'] });
    render(<RouterProvider router={memoryRouter} />);

    expect(screen.getByRole('heading', { name: /página no encontrada/i })).toBeInTheDocument();
  });
});
