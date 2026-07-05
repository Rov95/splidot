import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import { formatDate } from '../../../utils/date';
import type { Settlement } from '../../../types';
import './styles.css';

interface SettlementsProps {
    settlements: Settlement[];
    displayName: (userId: string, fallback: string | null) => string;
    onCalculate: () => void;
    onTogglePaid: (settlementId: string, isPaid: boolean) => void;
}

const Settlements = ({ settlements, displayName, onCalculate, onTogglePaid }: SettlementsProps) => {
    const outstanding = settlements
        .filter((settlement) => !settlement.is_paid)
        .reduce((sum, settlement) => sum + settlement.amount, 0);
    const settled = settlements
        .filter((settlement) => settlement.is_paid)
        .reduce((sum, settlement) => sum + settlement.amount, 0);

    return (
        <div className="settlements">
            <button onClick={onCalculate} className="splidot-button ui-btn ui-btn--primary ui-btn--md">
                <img src="/dot.svg" alt="dot icon" className="settlements__dot-icon" />
                Splidot
            </button>

            {settlements.length === 0 ? (
                <EmptyState message="Nothing to settle yet — hit Splidot after adding expenses." />
            ) : (
                <div className="settlements-display">
                    <h3 className="settlements__heading">Dot says:</h3>
                    <div className="settlements__summary">
                        <span className="settlements__chip settlements__chip--outstanding">
                            Outstanding ${outstanding.toFixed(2)}
                        </span>
                        <span className="settlements__chip settlements__chip--settled">
                            Settled ${settled.toFixed(2)}
                        </span>
                    </div>
                    <ul className="settlements__list">
                        {settlements.map((settlement) => (
                            <li key={settlement.settlement_id} className="settlement-item">
                                <div className="settlement-item__info">
                                    <span>
                                        {displayName(settlement.from_user_id, settlement.from_name)} pays {displayName(settlement.to_user_id, settlement.to_name)}: ${settlement.amount.toFixed(2)}
                                    </span>
                                    {formatDate(settlement.created_at) && (
                                        <span className="settlement-item__date">
                                            {formatDate(settlement.created_at)}
                                        </span>
                                    )}
                                </div>
                                <div className="settlement-item__actions">
                                    {settlement.is_paid ? (
                                        <>
                                            <img src="/check.svg" alt="check icon" className="status-icon" />
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => onTogglePaid(settlement.settlement_id, false)}
                                            >
                                                Undo
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                className="payed-button"
                                                onClick={() => onTogglePaid(settlement.settlement_id, true)}
                                            >
                                                Paid off
                                            </Button>
                                            <img src="/cross.svg" alt="cross icon" className="status-icon" />
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Settlements;
