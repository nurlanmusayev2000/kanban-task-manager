import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LoginPage from './LoginPage';
import { renderWithProviders } from '../test/render';
import { API_URL, server } from '../test/server';

function renderLogin() {
  const user = userEvent.setup();
  const utils = renderWithProviders(<LoginPage />, {
    route: '/login',
    path: '/login',
    extraRoutes: <Route path="/" element={<h1>Dashboard</h1>} />,
  });
  return { user, ...utils };
}

/** Records login requests so tests can check what was (or wasn't) sent. */
function mockLogin(respond: (body: { email: string; password: string }) => Response) {
  const requests: { email: string; password: string }[] = [];
  server.use(
    http.post(`${API_URL}/auth/login`, async ({ request }) => {
      const body = (await request.json()) as { email: string; password: string };
      requests.push(body);
      return respond(body);
    })
  );
  return requests;
}

describe('LoginPage', () => {
  it('shows both required-field errors and sends nothing when submitted empty', async () => {
    const requests = mockLogin(() => HttpResponse.json({}));
    const { user } = renderLogin();

    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('only flags the missing password when the email is filled in', async () => {
    const requests = mockLogin(() => HttpResponse.json({}));
    const { user } = renderLogin();

    await user.type(screen.getByLabelText('Email'), 'demo@example.com');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it("shows the server's message for wrong credentials and stays on the page", async () => {
    mockLogin(() => HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 }));
    const { user, store } = renderLogin();

    await user.type(screen.getByLabelText('Email'), 'demo@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(store.getState().auth.token).toBeNull();
  });

  it('logs in, stores the session and navigates to the dashboard', async () => {
    const user = { id: 'u1', email: 'demo@example.com', name: 'Demo User' };
    const requests = mockLogin(() => HttpResponse.json({ token: 'jwt-token', user }));
    const { user: ui, store } = renderLogin();

    await ui.type(screen.getByLabelText('Email'), 'demo@example.com');
    await ui.type(screen.getByLabelText('Password'), 'demo1234');
    await ui.click(screen.getByRole('button', { name: 'Log in' }));

    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(requests).toEqual([{ email: 'demo@example.com', password: 'demo1234' }]);
    expect(store.getState().auth).toEqual({ user, token: 'jwt-token' });
    expect(localStorage.getItem('authToken')).toBe('jwt-token');
  });
});
