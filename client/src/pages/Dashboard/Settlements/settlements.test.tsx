import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Settlements from './settlements';
import type { Settlement } from '../../../types';

const settlements: Settlement[] = [
  {
    settlement_id: 's1',
    group_id: 'g1',
    from_user_id: 'a',
    from_name: 'Alice',
    to_user_id: 'b',
    to_name: 'Bob',
    amount: 20,
    is_paid: false,
    created_at: '2026-07-01T12:00:00Z',
  },
  {
    settlement_id: 's2',
    group_id: 'g1',
    from_user_id: 'b',
    from_name: 'Bob',
    to_user_id: 'a',
    to_name: 'Alice',
    amount: 15,
    is_paid: true,
    created_at: '2026-07-02T12:00:00Z',
  },
];

const displayName = (_userId: string, fallback: string | null) => fallback ?? 'Unknown';

describe('Settlements', () => {
  it('renders settlement rows with amounts and dates', () => {
    render(
      <Settlements
        settlements={settlements}
        displayName={displayName}
        onCalculate={vi.fn()}
        onTogglePaid={vi.fn()}
      />
    );

    expect(screen.getByText('Alice pays Bob: $20.00')).toBeInTheDocument();
    expect(screen.getByText('Bob pays Alice: $15.00')).toBeInTheDocument();
    expect(screen.getAllByText(/Jul \d+, 2026/)).toHaveLength(2);
  });

  it('sums unpaid and paid settlements into the summary chips', () => {
    render(
      <Settlements
        settlements={settlements}
        displayName={displayName}
        onCalculate={vi.fn()}
        onTogglePaid={vi.fn()}
      />
    );

    expect(screen.getByText('Outstanding $20.00')).toBeInTheDocument();
    expect(screen.getByText('Settled $15.00')).toBeInTheDocument();
  });

  it('marks an unpaid settlement as paid', async () => {
    const onTogglePaid = vi.fn();
    const user = userEvent.setup();

    render(
      <Settlements
        settlements={settlements}
        displayName={displayName}
        onCalculate={vi.fn()}
        onTogglePaid={onTogglePaid}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Paid off' }));

    expect(onTogglePaid).toHaveBeenCalledWith('s1', true);
  });

  it('undoes a paid settlement', async () => {
    const onTogglePaid = vi.fn();
    const user = userEvent.setup();

    render(
      <Settlements
        settlements={settlements}
        displayName={displayName}
        onCalculate={vi.fn()}
        onTogglePaid={onTogglePaid}
      />
    );
    await user.click(screen.getByRole('button', { name: 'Undo' }));

    expect(onTogglePaid).toHaveBeenCalledWith('s2', false);
  });

  it('calls onCalculate when the Splidot button is clicked', async () => {
    const onCalculate = vi.fn();
    const user = userEvent.setup();

    render(
      <Settlements
        settlements={[]}
        displayName={displayName}
        onCalculate={onCalculate}
        onTogglePaid={vi.fn()}
      />
    );
    await user.click(screen.getByRole('button', { name: /Splidot/ }));

    expect(onCalculate).toHaveBeenCalled();
  });

  it('shows an empty state when there are no settlements', () => {
    render(
      <Settlements
        settlements={[]}
        displayName={displayName}
        onCalculate={vi.fn()}
        onTogglePaid={vi.fn()}
      />
    );

    expect(
      screen.getByText('Nothing to settle yet — hit Splidot after adding expenses.')
    ).toBeInTheDocument();
  });
});
