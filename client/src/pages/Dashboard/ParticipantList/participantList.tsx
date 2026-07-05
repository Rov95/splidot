import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { getGroupParticipants } from '../../../services/groupService';
import type { Participant } from '../../../types';
import './styles.css';

interface ParticipantListProps {
    groupId: string | null;
    participants: Participant[];
    setParticipants: Dispatch<SetStateAction<Participant[]>>;
    balances: Record<string, number>;
    onSelectParticipant?: (participantId: string) => void;
}

const ParticipantList = ({ groupId, participants, setParticipants, balances, onSelectParticipant }: ParticipantListProps) => {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId) return;

        const fetchParticipants = async () => {
            try {
                const data = await getGroupParticipants(groupId);

                const initialParticipants: Participant[] = data.map((participant, index) => ({
                    ...participant,
                    name: index === 0 ? 'Me' : participant.name, // Set first participant as 'Me'
                    icon: `/cat${(index % 6) + 1}.svg` // Assign icons cyclically from cat1.svg to cat6.svg
                }));

                setParticipants(initialParticipants);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            }
        };

        fetchParticipants();
    }, [groupId, setParticipants]);


    return (
        <div className="participant-list">
            <h2 className="participant-list__title">Friends</h2>
            {error && <p className="ui-field-error">{error}</p>}
            <ul className="participant-list__items">
                {participants.map((participant) => (
                    <li
                        key={participant.user_id}
                        className="participant-item"
                        role="button"
                        tabIndex={0}
                        title={`Add an expense paid by ${participant.name}`}
                        onClick={() => onSelectParticipant?.(participant.user_id)}
                        onKeyDown={(event) => {
                            if (event.key !== 'Enter' && event.key !== ' ') return;
                            event.preventDefault();
                            onSelectParticipant?.(participant.user_id);
                        }}
                    >
                        <img src={participant.icon} alt="Participant icon" className="participant-icon" />
                        <span className="participant-item__label">
                            {participant.name} / Share: ${(balances[participant.user_id] ?? 0).toFixed(2)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantList;
