import React, { useEffect, useState } from 'react';
import { getGroupParticipants } from '../../../services/groupService';
import './styles.css';

const ParticipantList = ({ groupId, participants, setParticipants }) => {
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!groupId) return;

        const fetchParticipants = async () => {
            try {
                const data = await getGroupParticipants(groupId);
                const initialParticipants = data.map((participant) => ({
                    ...participant,
                    totalPaid: 0,
                }));
                setParticipants(initialParticipants);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchParticipants();
    }, [groupId, setParticipants]);

    return (
        <div className="participant-list-container">
            <div className="participant-list">
                <h2 className="participant-title">Participants</h2>
                {error && <p className="error-message">{error}</p>}
                <ul className="participant-items">
                    {participants.map((participant) => (
                        <li key={participant.user_id} className="participant-item">
                            {participant.name} - Total Paid: ${participant.totalPaid}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ParticipantList;

