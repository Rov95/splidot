import { describe, it, expect } from 'vitest';
import { calculateSettlements } from './settlements';
import type { Participant } from '../types';

const participant = (overrides: Partial<Participant>): Participant => ({
  user_id: overrides.user_id ?? 'id',
  name: overrides.name ?? 'name',
  totalPaid: overrides.totalPaid ?? 0,
  icon: overrides.icon ?? '/cat1.svg',
});

describe('calculateSettlements', () => {
  it('settles a simple two-person split', () => {
    const participants = [
      participant({ user_id: 'a', name: 'Alice', totalPaid: 100 }),
      participant({ user_id: 'b', name: 'Bob', totalPaid: 0 }),
    ];

    const settlements = calculateSettlements(participants, 100);

    expect(settlements).toEqual([{ from: 'Bob', to: 'Alice', amount: 50 }]);
  });

  it('matches multiple payers against a single payee', () => {
    const participants = [
      participant({ user_id: 'a', name: 'Alice', totalPaid: 90 }),
      participant({ user_id: 'b', name: 'Bob', totalPaid: 0 }),
      participant({ user_id: 'c', name: 'Charlie', totalPaid: 0 }),
    ];

    const settlements = calculateSettlements(participants, 90);

    expect(settlements).toEqual([
      { from: 'Bob', to: 'Alice', amount: 30 },
      { from: 'Charlie', to: 'Alice', amount: 30 },
    ]);
  });

  it('returns no settlements when everyone already paid their fair share', () => {
    const participants = [
      participant({ user_id: 'a', name: 'Alice', totalPaid: 50 }),
      participant({ user_id: 'b', name: 'Bob', totalPaid: 50 }),
    ];

    expect(calculateSettlements(participants, 100)).toEqual([]);
  });

  it('returns no settlements for an empty participant list', () => {
    expect(calculateSettlements([], 0)).toEqual([]);
  });
});
