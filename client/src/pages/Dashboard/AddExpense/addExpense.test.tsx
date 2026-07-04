import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddExpense from './addExpense';
import type { Participant } from '../../../types';

const participants: Participant[] = [
  { user_id: 'a', name: 'Alice', icon: '/cat1.svg' },
  { user_id: 'b', name: 'Bob', icon: '/cat2.svg' },
];

describe('AddExpense', () => {
  it('submits a parsed expense and closes the modal', async () => {
    const onAddExpense = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<AddExpense participants={participants} onAddExpense={onAddExpense} onClose={onClose} />);

    await user.selectOptions(screen.getByLabelText('Payer:'), 'a');
    await user.type(screen.getByLabelText('Amount ($):'), '40');
    await user.selectOptions(screen.getByLabelText('Category:'), 'food');
    await user.type(screen.getByLabelText('Expense Name:'), 'Dinner');
    await user.click(screen.getByRole('button', { name: 'Create Expense' }));

    expect(onAddExpense).toHaveBeenCalledWith({
      payer: 'a',
      amount: 40,
      category: 'food',
      expenseName: 'Dinner',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('alerts and does not submit when fields are missing', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const onAddExpense = vi.fn();
    const user = userEvent.setup();

    render(<AddExpense participants={participants} onAddExpense={onAddExpense} onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Create Expense' }));

    expect(alertSpy).toHaveBeenCalledWith('Please fill all fields');
    expect(onAddExpense).not.toHaveBeenCalled();

    alertSpy.mockRestore();
  });
});
