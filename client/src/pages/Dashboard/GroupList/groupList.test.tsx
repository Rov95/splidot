import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GroupList from './groupList';
import type { Group } from '../../../types';

const groups: Group[] = [
  { group_id: '1', name: 'Trip', total_expense: 0, created_at: '' },
  { group_id: '2', name: 'Rent', total_expense: 0, created_at: '' },
];

describe('GroupList', () => {
  it('renders all groups', () => {
    render(<GroupList groups={groups} onSelectGroup={vi.fn()} onDeleteGroup={vi.fn()} />);

    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('selects a group and shows only that group', async () => {
    const onSelectGroup = vi.fn();
    const user = userEvent.setup();

    render(<GroupList groups={groups} onSelectGroup={onSelectGroup} onDeleteGroup={vi.fn()} />);
    await user.click(screen.getByText('Trip'));

    expect(onSelectGroup).toHaveBeenCalledWith('1');
    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.queryByText('Rent')).not.toBeInTheDocument();
  });

  it('toggles back to the full list when the container is clicked again', async () => {
    const user = userEvent.setup();
    render(<GroupList groups={groups} onSelectGroup={vi.fn()} onDeleteGroup={vi.fn()} />);

    await user.click(screen.getByText('Trip'));
    expect(screen.queryByText('Rent')).not.toBeInTheDocument();

    await user.click(screen.getByText('Groups'));
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('deletes the selected group and returns to the full list', async () => {
    const onDeleteGroup = vi.fn().mockResolvedValue(true);
    const user = userEvent.setup();

    render(<GroupList groups={groups} onSelectGroup={vi.fn()} onDeleteGroup={onDeleteGroup} />);
    await user.click(screen.getByText('Trip'));
    await user.click(screen.getByRole('button', { name: 'Delete Group' }));

    expect(onDeleteGroup).toHaveBeenCalledWith('1');
    expect(await screen.findByText('Rent')).toBeInTheDocument();
  });

  it('stays on the selected group when deletion is declined', async () => {
    const onDeleteGroup = vi.fn().mockResolvedValue(false);
    const user = userEvent.setup();

    render(<GroupList groups={groups} onSelectGroup={vi.fn()} onDeleteGroup={onDeleteGroup} />);
    await user.click(screen.getByText('Trip'));
    await user.click(screen.getByRole('button', { name: 'Delete Group' }));

    expect(onDeleteGroup).toHaveBeenCalledWith('1');
    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.queryByText('Rent')).not.toBeInTheDocument();
  });
});
