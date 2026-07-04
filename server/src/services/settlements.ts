export interface ParticipantRef {
  user_id: string;
  name: string | null;
}

export interface ComputedSettlement {
  from_user_id: string;
  to_user_id: string;
  amount: number;
}

// All math is done in integer cents; balances within half a cent count as settled,
// which avoids the float-equality pitfalls of comparing fractional dollar amounts.
const EPSILON_CENTS = 0.5;

export const centsFromAmount = (amount: number | string): number =>
  Math.round(Number(amount) * 100);

export const splitEqualCents = (totalCents: number, count: number): number[] => {
  const base = Math.floor(totalCents / count);
  const remainder = totalCents % count;
  return Array.from({ length: count }, (_, index) => (index < remainder ? base + 1 : base));
};

export const buildPaidCentsByUser = (
  participants: ParticipantRef[],
  expenses: { user_id: string; amount: number | string }[],
  paidSettlements: { from_user_id: string; to_user_id: string; amount: number | string }[]
): Map<string, number> => {
  const paid = new Map<string, number>();
  for (const participant of participants) {
    paid.set(participant.user_id, 0);
  }
  for (const expense of expenses) {
    paid.set(expense.user_id, (paid.get(expense.user_id) ?? 0) + centsFromAmount(expense.amount));
  }
  // A paid settlement is a completed transfer: the debtor has effectively paid that
  // amount into the pot and the creditor has taken it out, so recomputing never
  // demands the same money twice.
  for (const settlement of paidSettlements) {
    const cents = centsFromAmount(settlement.amount);
    paid.set(settlement.from_user_id, (paid.get(settlement.from_user_id) ?? 0) + cents);
    paid.set(settlement.to_user_id, (paid.get(settlement.to_user_id) ?? 0) - cents);
  }
  return paid;
};

export const computeSettlements = (
  participants: ParticipantRef[],
  paidCentsByUser: Map<string, number>
): ComputedSettlement[] => {
  if (participants.length === 0) return [];

  const totalCents = participants.reduce(
    (sum, participant) => sum + (paidCentsByUser.get(participant.user_id) ?? 0),
    0
  );
  const fairShareCents = totalCents / participants.length;

  const balances = participants.map((participant) => ({
    user_id: participant.user_id,
    balance: (paidCentsByUser.get(participant.user_id) ?? 0) - fairShareCents,
  }));

  const payers = balances
    .filter((participant) => participant.balance < -EPSILON_CENTS)
    .map((participant) => ({ ...participant, balance: -participant.balance }));
  const payees = balances
    .filter((participant) => participant.balance > EPSILON_CENTS)
    .map((participant) => ({ ...participant }));

  const settlements: ComputedSettlement[] = [];
  let i = 0;
  let j = 0;

  while (i < payers.length && j < payees.length) {
    const payer = payers[i];
    const payee = payees[j];
    const amountCents = Math.min(payer.balance, payee.balance);

    settlements.push({
      from_user_id: payer.user_id,
      to_user_id: payee.user_id,
      amount: Math.round(amountCents) / 100,
    });

    payer.balance -= amountCents;
    payee.balance -= amountCents;

    if (payer.balance < EPSILON_CENTS) i++;
    if (payee.balance < EPSILON_CENTS) j++;
  }

  return settlements;
};
