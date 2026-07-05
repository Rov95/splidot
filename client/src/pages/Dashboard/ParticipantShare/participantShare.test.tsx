import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ParticipantShare from './participantShare';
import type { Participant } from '../../../types';

const participants: Participant[] = [
  { user_id: 'a', name: 'Alice', icon: '/cat1.svg' },
  { user_id: 'b', name: 'Bob', icon: '/cat2.svg' },
];

describe('ParticipantShare', () => {
  it('sizes each slice by the participant share of total expenses', () => {
    render(<ParticipantShare participants={participants} balances={{ a: 40, b: 10 }} />);

    const rows = screen.getAllByRole('listitem');
    expect(rows[0]).toHaveTextContent('Alice');
    expect(rows[0]).toHaveTextContent('$40.00');
    expect(rows[1]).toHaveTextContent('Bob');
    expect(rows[1]).toHaveTextContent('$10.00');
  });

  it('excludes participants who have not paid for anything', () => {
    render(<ParticipantShare participants={participants} balances={{ a: 40 }} />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('renders a conic-gradient pie chart sized by each participant share', () => {
    const { container } = render(
      <ParticipantShare participants={participants} balances={{ a: 40, b: 10 }} />
    );

    const chart = container.querySelector<HTMLElement>('.participant-share__chart');
    expect(chart).not.toBeNull();
    expect(chart!.style.background).toBe(
      'conic-gradient(var(--teal-500) 0% 80%, var(--coral-500) 80% 100%)'
    );
  });

  it('describes each slice in the chart accessible name', () => {
    render(<ParticipantShare participants={participants} balances={{ a: 40, b: 10 }} />);

    expect(screen.getByRole('img', { name: /Alice paid \$40\.00/ })).toBeInTheDocument();
  });

  it('shows an empty state when there are no expenses yet', () => {
    render(<ParticipantShare participants={participants} balances={{}} />);

    expect(
      screen.getByText("No expenses yet — each participant's share will show up here.")
    ).toBeInTheDocument();
  });

  it('shows an empty state when there are no participants', () => {
    render(<ParticipantShare participants={[]} balances={{}} />);

    expect(
      screen.getByText("No expenses yet — each participant's share will show up here.")
    ).toBeInTheDocument();
  });
});
