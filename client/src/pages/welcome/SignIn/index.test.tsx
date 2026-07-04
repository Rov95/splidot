import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SignIn from './index';
import { signIn } from '../../../services/authService';
import type { SetIsSignedIn } from '../../../App';

vi.mock('../../../services/authService');

const renderSignIn = (setIsSignedIn: SetIsSignedIn) =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<SignIn setIsSignedIn={setIsSignedIn} />} />
        <Route path="/dashboard" element={<div>Dashboard Stub</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('SignIn', () => {
  beforeEach(() => {
    vi.mocked(signIn).mockReset();
  });

  it('signs in and redirects to the dashboard on success', async () => {
    vi.mocked(signIn).mockResolvedValue({ token: 'jwt-123' });
    const setIsSignedIn = vi.fn();
    const user = userEvent.setup();

    renderSignIn(setIsSignedIn);

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'hunter2');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => expect(setIsSignedIn).toHaveBeenCalledWith(true));
    expect(signIn).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'hunter2' });
    expect(await screen.findByText('Dashboard Stub')).toBeInTheDocument();
  });

  it('shows an error message and stays on the page when sign in fails', async () => {
    vi.mocked(signIn).mockRejectedValue(new Error('Invalid email or password.'));
    const setIsSignedIn = vi.fn();
    const user = userEvent.setup();

    renderSignIn(setIsSignedIn);

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
    expect(setIsSignedIn).not.toHaveBeenCalled();
  });
});
