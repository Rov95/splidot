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

  it('shows an inline error and does not submit when fields are missing', async () => {
    const onAddExpense = vi.fn();
    const user = userEvent.setup();

    render(<AddExpense participants={participants} onAddExpense={onAddExpense} onClose={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Create Expense' }));

    expect(await screen.findByText('Please fill all fields')).toBeInTheDocument();
    expect(onAddExpense).not.toHaveBeenCalled();
  });

  it('rejects a zero amount with an inline error', async () => {
    const onAddExpense = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<AddExpense participants={participants} onAddExpense={onAddExpense} onClose={onClose} />);

    await user.selectOptions(screen.getByLabelText('Payer:'), 'a');
    await user.type(screen.getByLabelText('Amount ($):'), '0');
    await user.selectOptions(screen.getByLabelText('Category:'), 'food');
    await user.type(screen.getByLabelText('Expense Name:'), 'Dinner');
    await user.click(screen.getByRole('button', { name: 'Create Expense' }));

    expect(await screen.findByText('Amount must be greater than 0')).toBeInTheDocument();
    expect(onAddExpense).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('preselects the payer when initialPayerId is provided', async () => {
    const onAddExpense = vi.fn();
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AddExpense
        participants={participants}
        onAddExpense={onAddExpense}
        onClose={onClose}
        initialPayerId="b"
      />
    );

    expect(screen.getByLabelText('Payer:')).toHaveValue('b');

    await user.type(screen.getByLabelText('Amount ($):'), '15');
    await user.selectOptions(screen.getByLabelText('Category:'), 'food');
    await user.type(screen.getByLabelText('Expense Name:'), 'Snacks');
    await user.click(screen.getByRole('button', { name: 'Create Expense' }));

    expect(onAddExpense).toHaveBeenCalledWith({
      payer: 'b',
      amount: 15,
      category: 'food',
      expenseName: 'Snacks',
    });
  });
});
