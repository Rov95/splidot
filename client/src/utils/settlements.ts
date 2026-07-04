import type { Participant, Settlement } from '../types';

export function calculateSettlements(participants: Participant[], totalPaid: number): Settlement[] {
    const fairShare = totalPaid / participants.length;
    const balances = participants.map(participant => ({
        ...participant,
        balance: participant.totalPaid - fairShare
    }));

    const payers = balances.filter(p => p.balance < 0).map(p => ({ ...p, balance: Math.abs(p.balance) }));
    const payees = balances.filter(p => p.balance > 0);

    const settlements: Settlement[] = [];
    let i = 0, j = 0;

    while (i < payers.length && j < payees.length) {
        const payer = payers[i];
        const payee = payees[j];
        const amount = Math.min(payer.balance, payee.balance);

        settlements.push({ from: payer.name, to: payee.name, amount });

        // Adjusting balances
        payer.balance -= amount;
        payee.balance -= amount;

        if (payer.balance === 0) i++;
        if (payee.balance === 0) j++;
    }

    return settlements;
}
