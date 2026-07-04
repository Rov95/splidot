import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { getGroupParticipants } from '../../../services/groupService';
import type { Participant } from '../../../types';
import './styles.css';

interface ParticipantListProps {
    groupId: string | null;
    participants: Participant[];
    setParticipants: Dispatch<SetStateAction<Participant[]>>;
}

const ParticipantList = ({ groupId, participants, setParticipants }: ParticipantListProps) => {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!groupId) return;

        const fetchParticipants = async () => {
            try {
                const data = await getGroupParticipants(groupId);

                const initialParticipants: Participant[] = data.map((participant, index) => ({
                    ...participant,
                    name: index === 0 ? 'Me' : participant.name, // Set first participant as 'Me'
                    totalPaid: 0,
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
        <div className="participant-list-container">
            <div className="participant-list">
                <h2 className="participant-title">Friends</h2>
                {error && <p className="error-message">{error}</p>}
                <ul className="participant-items">
                    {participants.map((participant) => (
                        <li key={participant.user_id} className="participant-item">
                            <img src={participant.icon} alt="Participant icon" className="participant-icon" />
                            {participant.name} / Share: ${participant.totalPaid}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ParticipantList;
