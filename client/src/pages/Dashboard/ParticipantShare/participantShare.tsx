import EmptyState from '../../../components/ui/EmptyState';
import type { Participant } from '../../../types';
import './styles.css';

interface ParticipantShareProps {
    participants: Participant[];
    balances: Record<string, number>;
}

const CHART_COLORS = [
    'var(--teal-500)',
    'var(--coral-500)',
    'var(--amber-400)',
    'var(--green-500)',
    'var(--teal-300)',
    'var(--coral-600)',
    'var(--teal-600)',
];

const ParticipantShare = ({ participants, balances }: ParticipantShareProps) => {
    const shares = participants
        .map((participant, index) => ({
            userId: participant.user_id,
            name: participant.name ?? 'Unknown',
            amount: balances[participant.user_id] ?? 0,
            color: CHART_COLORS[index % CHART_COLORS.length],
        }))
        .filter((share) => share.amount > 0);

    const total = shares.reduce((sum, share) => sum + share.amount, 0);

    if (total <= 0) {
        return <EmptyState message="No expenses yet — each participant's share will show up here." />;
    }

    const slices = shares
        .map((share) => ({ ...share, pct: (share.amount / total) * 100 }))
        .sort((a, b) => b.amount - a.amount);

    let cursor = 0;
    const gradientStops = slices
        .map((slice) => {
            const start = cursor;
            cursor += slice.pct;
            return `${slice.color} ${start}% ${cursor}%`;
        })
        .join(', ');

    return (
        <div className="participant-share">
            <div
                className="participant-share__chart"
                role="img"
                aria-label={`Share of expenses paid by participant: ${slices
                    .map((slice) => `${slice.name} paid $${slice.amount.toFixed(2)}`)
                    .join(', ')}`}
                style={{ background: `conic-gradient(${gradientStops})` }}
            />
            <ul className="participant-share__legend">
                {slices.map((slice) => (
                    <li key={slice.userId} className="participant-share__legend-item">
                        <span className="participant-share__swatch" style={{ backgroundColor: slice.color }} />
                        <span className="participant-share__legend-name">{slice.name}</span>
                        <span className="participant-share__legend-amount">${slice.amount.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantShare;
