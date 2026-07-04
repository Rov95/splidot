import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { getToken } from './services/authService';

vi.mock('./pages/Dashboard/main/index', () => ({
  default: () => <div>Dashboard Stub</div>,
}));

// App decides signed-in state from the stored token and reconciles it with the
// server; mock the service so routing is driven deterministically.
vi.mock('./services/authService', () => ({
  getToken: vi.fn(() => null),
  clearToken: vi.fn(),
  validateSession: vi.fn(() => Promise.resolve(true)),
}));

const setLocation = (path: string) => {
  window.history.pushState({}, '', path);
};

describe('App routing', () => {
  beforeEach(() => {
    vi.mocked(getToken).mockReturnValue(null);
  });

  it('renders the welcome page at the root path', () => {
    setLocation('/');
    render(<App />);
    expect(screen.getByText('Welcome to Splidot!')).toBeInTheDocument();
  });

  it('redirects /dashboard to the welcome page when signed out', () => {
    setLocation('/dashboard');
    render(<App />);
    expect(screen.getByText('Welcome to Splidot!')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Stub')).not.toBeInTheDocument();
  });

  it('allows /dashboard when a token is present', () => {
    vi.mocked(getToken).mockReturnValue('jwt-123');
    setLocation('/dashboard');
    render(<App />);
    expect(screen.getByText('Dashboard Stub')).toBeInTheDocument();
  });
});
