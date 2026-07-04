import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

vi.mock('./pages/Dashboard/main/index', () => ({
  default: () => <div>Dashboard Stub</div>,
}));

const setLocation = (path: string) => {
  window.history.pushState({}, '', path);
};

describe('App routing', () => {
  beforeEach(() => {
    localStorage.clear();
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

  it('allows /dashboard when signed in', () => {
    localStorage.setItem('isSignedIn', 'true');
    setLocation('/dashboard');
    render(<App />);
    expect(screen.getByText('Dashboard Stub')).toBeInTheDocument();
  });
});
