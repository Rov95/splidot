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
    render(<GroupList groups={groups} onSelectGroup={vi.fn()} />);

    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });

  it('selects a group and shows only that group', async () => {
    const onSelectGroup = vi.fn();
    const user = userEvent.setup();

    render(<GroupList groups={groups} onSelectGroup={onSelectGroup} />);
    await user.click(screen.getByText('Trip'));

    expect(onSelectGroup).toHaveBeenCalledWith('1');
    expect(screen.getByText('Trip')).toBeInTheDocument();
    expect(screen.queryByText('Rent')).not.toBeInTheDocument();
  });

  it('toggles back to the full list when the container is clicked again', async () => {
    const user = userEvent.setup();
    render(<GroupList groups={groups} onSelectGroup={vi.fn()} />);

    await user.click(screen.getByText('Trip'));
    expect(screen.queryByText('Rent')).not.toBeInTheDocument();

    await user.click(screen.getByText('Groups'));
    expect(screen.getByText('Rent')).toBeInTheDocument();
  });
});
