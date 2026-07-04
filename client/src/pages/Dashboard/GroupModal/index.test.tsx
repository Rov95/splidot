import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupModal from './index';
import { createGroup } from '../../../services/groupService';

vi.mock('../../../services/groupService');

describe('GroupModal', () => {
  beforeEach(() => {
    vi.mocked(createGroup).mockReset();
  });

  it('creates a group with the entered participants', async () => {
    vi.mocked(createGroup).mockResolvedValue({
      group_id: 'g1',
      name: 'Trip',
      total_expense: 0,
      created_at: new Date().toISOString(),
    });
    const onClose = vi.fn();
    const onGroupCreated = vi.fn();
    const user = userEvent.setup();

    render(<GroupModal onClose={onClose} onGroupCreated={onGroupCreated} />);

    await user.type(screen.getByLabelText('Group Name'), 'Trip');
    await user.type(screen.getByLabelText('Participant 1'), 'Alice');
    await user.click(screen.getByRole('button', { name: 'Add a New Participant' }));
    await user.type(screen.getByLabelText('Participant 2'), 'Bob');
    await user.click(screen.getByRole('button', { name: 'Create Group' }));

    expect(createGroup).toHaveBeenCalledWith({ name: 'Trip', participants: ['Alice', 'Bob'] });
    expect(onGroupCreated).toHaveBeenCalled();
    expect(onClose).toHaveBeenCalled();
  });

  it('shows an error and does not close when creation fails', async () => {
    vi.mocked(createGroup).mockRejectedValue(new Error('Failed to create group, please try again.'));
    const onClose = vi.fn();
    const onGroupCreated = vi.fn();
    const user = userEvent.setup();

    render(<GroupModal onClose={onClose} onGroupCreated={onGroupCreated} />);

    await user.type(screen.getByLabelText('Group Name'), 'Trip');
    await user.type(screen.getByLabelText('Participant 1'), 'Alice');
    await user.click(screen.getByRole('button', { name: 'Create Group' }));

    expect(await screen.findByText('Failed to create group, please try again.')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(onGroupCreated).not.toHaveBeenCalled();
  });

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<GroupModal onClose={onClose} onGroupCreated={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Close' }));

    expect(onClose).toHaveBeenCalled();
  });
});
