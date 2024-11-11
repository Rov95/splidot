import React, { useEffect, useState } from 'react';
import { getGroupParticipants } from '../../../services/groupService';

const ParticipantList = ({ groupId }) => {
    const [participants, setParticipants] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!groupId) return;

        const fetchParticipants = async () => {
            try {
                const data = await getGroupParticipants(groupId);
                setParticipants(data);
            } catch (err) {
                setError(err.message);
            }
        };

        fetchParticipants();
    }, [groupId]);

    return (
        <div className="participant-list">
            <h2>Participants</h2>
            {error && <p className="error">{error}</p>}
            <ul>
                {participants.map((participant) => (
                    <li key={participant.user_id}>{participant.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default ParticipantList;
