import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUp from './index';
import { signUp } from '../../../services/authService';

vi.mock('../../../services/authService');

describe('SignUp', () => {
  beforeEach(() => {
    vi.mocked(signUp).mockReset();
  });

  it('submits the form and toggles back to sign in on success', async () => {
    vi.mocked(signUp).mockResolvedValue({ message: 'User registered succesfully' });
    const toggleSignUp = vi.fn();
    const user = userEvent.setup();

    render(<SignUp toggleSignUp={toggleSignUp} />);

    await user.type(screen.getByLabelText('First Name'), 'Jane');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'hunter2');
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(signUp).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'hunter2',
      firstName: 'Jane',
      lastName: 'Doe',
    });
    expect(toggleSignUp).toHaveBeenCalled();
  });

  it('shows an error message and does not toggle when sign up fails', async () => {
    vi.mocked(signUp).mockRejectedValue(new Error('Email already in use'));
    const toggleSignUp = vi.fn();
    const user = userEvent.setup();

    render(<SignUp toggleSignUp={toggleSignUp} />);

    await user.type(screen.getByLabelText('First Name'), 'Jane');
    await user.type(screen.getByLabelText('Last Name'), 'Doe');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'hunter2');
    await user.click(screen.getByRole('button', { name: 'Sign Up' }));

    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
    expect(toggleSignUp).not.toHaveBeenCalled();
  });
});
