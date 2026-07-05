import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import SignUp from './index';
import { signUp } from '../../../services/authService';
import type { SetIsSignedIn } from '../../../App';

vi.mock('../../../services/authService');

const renderSignUp = (toggleSignUp: () => void, setIsSignedIn: SetIsSignedIn) =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route
          path="/"
          element={<SignUp toggleSignUp={toggleSignUp} setIsSignedIn={setIsSignedIn} />}
        />
        <Route path="/dashboard" element={<div>Dashboard Stub</div>} />
      </Routes>
    </MemoryRouter>
  );

const fillForm = async (user: ReturnType<typeof userEvent.setup>, password = 'hunter2024') => {
  await user.type(screen.getByLabelText('First Name'), 'Jane');
  await user.type(screen.getByLabelText('Last Name'), 'Doe');
  await user.type(screen.getByLabelText('Email'), 'jane@example.com');
  await user.type(screen.getByLabelText('Password'), password);
};

describe('SignUp', () => {
  beforeEach(() => {
    vi.mocked(signUp).mockReset();
  });

  it('signs up and redirects straight to the dashboard on success', async () => {
    vi.mocked(signUp).mockResolvedValue({ token: 'jwt-123' });
    const toggleSignUp = vi.fn();
    const setIsSignedIn = vi.fn();
    const user = userEvent.setup();

    renderSignUp(toggleSignUp, setIsSignedIn);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    await waitFor(() => expect(setIsSignedIn).toHaveBeenCalledWith(true));
    expect(signUp).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'hunter2024',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    expect(await screen.findByText('Dashboard Stub')).toBeInTheDocument();
  });

  it('shows an error message and stays on the page when sign up fails', async () => {
    vi.mocked(signUp).mockRejectedValue(new Error('Email already in use'));
    const toggleSignUp = vi.fn();
    const setIsSignedIn = vi.fn();
    const user = userEvent.setup();

    renderSignUp(toggleSignUp, setIsSignedIn);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
    expect(setIsSignedIn).not.toHaveBeenCalled();
  });

  it('rejects a short password with an inline error and never calls the service', async () => {
    const toggleSignUp = vi.fn();
    const setIsSignedIn = vi.fn();
    const user = userEvent.setup();

    renderSignUp(toggleSignUp, setIsSignedIn);

    await fillForm(user, 'short');
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(signUp).not.toHaveBeenCalled();
    expect(setIsSignedIn).not.toHaveBeenCalled();
  });
});
