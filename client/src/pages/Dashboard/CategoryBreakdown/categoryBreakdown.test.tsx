import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CategoryBreakdown from './categoryBreakdown';
import type { LocalExpense } from '../../../types';

const expense = (overrides: Partial<LocalExpense>): LocalExpense => ({
  expense_id: 'e1',
  payerName: 'Me',
  amount: 0,
  category: 'food',
  expenseName: 'Expense',
  createdAt: '2026-07-01T12:00:00Z',
  ...overrides,
});

describe('CategoryBreakdown', () => {
  it('renders nothing when there are no expenses', () => {
    const { container } = render(<CategoryBreakdown expenses={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('sums totals per category, sorted by amount descending', () => {
    render(
      <CategoryBreakdown
        expenses={[
          expense({ expense_id: 'e1', category: 'food', amount: 40 }),
          expense({ expense_id: 'e2', category: 'lodging', amount: 75 }),
          expense({ expense_id: 'e3', category: 'food', amount: 20 }),
        ]}
      />
    );

    expect(screen.getByText('food')).toBeInTheDocument();
    expect(screen.getByText('lodging')).toBeInTheDocument();

    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('lodging');
    expect(rows[0]).toHaveTextContent('$75.00');
    expect(rows[1]).toHaveTextContent('food');
    expect(rows[1]).toHaveTextContent('$60.00');
  });

  it('sizes the bars proportionally to the category share', () => {
    const { container } = render(
      <CategoryBreakdown
        expenses={[
          expense({ expense_id: 'e1', category: 'food', amount: 75 }),
          expense({ expense_id: 'e2', category: 'lodging', amount: 25 }),
        ]}
      />
    );

    const bars = container.querySelectorAll<HTMLElement>('.category-breakdown__bar');
    expect(bars[0].style.width).toBe('75%');
    expect(bars[1].style.width).toBe('25%');
  });

  it('buckets uncategorized expenses under "others"', () => {
    render(<CategoryBreakdown expenses={[expense({ category: '', amount: 10 })]} />);
    expect(screen.getByText('others')).toBeInTheDocument();
  });
});
