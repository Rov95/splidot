import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LogoutButton from './logOut';
import { signOut } from '../../../services/authService';

vi.mock('../../../services/authService');

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.mocked(signOut).mockReset();
  });

  it('signs out and flips isSignedIn to false', async () => {
    vi.mocked(signOut).mockResolvedValue({ message: 'Logged out successfully' });
    const setIsSignedIn = vi.fn();
    const user = userEvent.setup();

    render(<LogoutButton setIsSignedIn={setIsSignedIn} />);
    await user.click(screen.getByRole('button', { name: 'Log Out' }));

    await waitFor(() => expect(setIsSignedIn).toHaveBeenCalledWith(false));
  });

  it('does not flip isSignedIn when sign out fails', async () => {
    vi.mocked(signOut).mockRejectedValue(new Error('Error logging out, please try again.'));
    const setIsSignedIn = vi.fn();
    const user = userEvent.setup();

    render(<LogoutButton setIsSignedIn={setIsSignedIn} />);
    await user.click(screen.getByRole('button', { name: 'Log Out' }));

    await waitFor(() => expect(signOut).toHaveBeenCalled());
    expect(setIsSignedIn).not.toHaveBeenCalled();
  });
});
