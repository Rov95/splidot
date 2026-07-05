import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExpenseList from './expenseList';
import type { LocalExpense } from '../../../types';

const expenses: LocalExpense[] = [
  { expense_id: 'e1', payerName: 'Me', amount: 40, category: 'food', expenseName: 'Dinner', createdAt: '2026-07-01T12:00:00Z' },
  { expense_id: 'e2', payerName: 'Bob', amount: 10, category: 'transport', expenseName: 'Taxi', createdAt: '2026-07-02T12:00:00Z' },
];

describe('ExpenseList', () => {
  it('renders the expense rows', () => {
    render(<ExpenseList expenses={expenses} onDeleteExpense={vi.fn()} />);

    expect(screen.getByText('Dinner')).toBeInTheDocument();
    expect(screen.getByText('food, $40 by Me')).toBeInTheDocument();
    expect(screen.getByText('Taxi')).toBeInTheDocument();
  });

  it('calls onDeleteExpense with the id of the clicked row', async () => {
    const onDeleteExpense = vi.fn();
    const user = userEvent.setup();

    render(<ExpenseList expenses={expenses} onDeleteExpense={onDeleteExpense} />);
    const deleteButtons = screen.getAllByRole('button', { name: 'Delete expense' });
    await user.click(deleteButtons[1]);

    expect(onDeleteExpense).toHaveBeenCalledWith('e2');
  });
});
