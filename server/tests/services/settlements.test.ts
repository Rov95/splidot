import { describe, it, expect } from 'vitest';
import {
  centsFromAmount,
  splitEqualCents,
  buildPaidCentsByUser,
  computeSettlements,
  type ParticipantRef,
} from '../../src/services/settlements';

const alice: ParticipantRef = { user_id: 'a', name: 'Alice' };
const bob: ParticipantRef = { user_id: 'b', name: 'Bob' };
const charlie: ParticipantRef = { user_id: 'c', name: 'Charlie' };

const paidMap = (entries: [string, number][]) => new Map(entries);

describe('centsFromAmount', () => {
  it('converts numeric and string amounts to integer cents', () => {
    expect(centsFromAmount(40)).toBe(4000);
    expect(centsFromAmount('19.99')).toBe(1999);
    expect(centsFromAmount(0.1 + 0.2)).toBe(30);
  });
});

describe('splitEqualCents', () => {
  it('splits evenly when the total divides cleanly', () => {
    expect(splitEqualCents(4000, 2)).toEqual([2000, 2000]);
  });

  it('gives the remainder out one cent at a time', () => {
    expect(splitEqualCents(1000, 3)).toEqual([334, 333, 333]);
  });

  it('always sums back to the total', () => {
    for (const [total, count] of [
      [1, 3],
      [999, 7],
      [12345, 4],
    ]) {
      const shares = splitEqualCents(total, count);
      expect(shares).toHaveLength(count);
      expect(shares.reduce((sum, share) => sum + share, 0)).toBe(total);
    }
  });
});

describe('computeSettlements', () => {
  it('settles a simple two-person split', () => {
    const settlements = computeSettlements(
      [alice, bob],
      paidMap([
        ['a', 10000],
        ['b', 0],
      ])
    );

    expect(settlements).toEqual([{ from_user_id: 'b', to_user_id: 'a', amount: 50 }]);
  });

  it('matches multiple payers against a single payee', () => {
    const settlements = computeSettlements(
      [alice, bob, charlie],
      paidMap([
        ['a', 9000],
        ['b', 0],
        ['c', 0],
      ])
    );

    expect(settlements).toEqual([
      { from_user_id: 'b', to_user_id: 'a', amount: 30 },
      { from_user_id: 'c', to_user_id: 'a', amount: 30 },
    ]);
  });

  it('returns no settlements when everyone already paid their fair share', () => {
    const settlements = computeSettlements(
      [alice, bob],
      paidMap([
        ['a', 5000],
        ['b', 5000],
      ])
    );

    expect(settlements).toEqual([]);
  });

  it('returns no settlements for an empty participant list', () => {
    expect(computeSettlements([], new Map())).toEqual([]);
  });

  it('terminates on splits that do not divide into whole cents', () => {
    const settlements = computeSettlements(
      [alice, bob, charlie],
      paidMap([
        ['a', 1000],
        ['b', 0],
        ['c', 0],
      ])
    );

    expect(settlements).toHaveLength(2);
    for (const settlement of settlements) {
      expect(settlement.to_user_id).toBe('a');
      expect(settlement.amount).toBeCloseTo(3.33, 2);
    }
  });
});

describe('buildPaidCentsByUser', () => {
  it('sums expenses per payer, starting everyone at zero', () => {
    const paid = buildPaidCentsByUser(
      [alice, bob],
      [
        { user_id: 'a', amount: 40 },
        { user_id: 'a', amount: '10.50' },
      ],
      []
    );

    expect(paid.get('a')).toBe(5050);
    expect(paid.get('b')).toBe(0);
  });

  it('treats paid settlements as completed transfers so debts are not re-demanded', () => {
    const paid = buildPaidCentsByUser(
      [alice, bob],
      [{ user_id: 'a', amount: 40 }],
      [{ from_user_id: 'b', to_user_id: 'a', amount: 20 }]
    );

    expect(computeSettlements([alice, bob], paid)).toEqual([]);
  });
});
