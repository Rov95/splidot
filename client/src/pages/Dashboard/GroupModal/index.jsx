import React, { useState } from 'react';
import { createGroup } from '../../../services/groupService';

const GroupModal = ({ onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [participants, setParticipants] = useState(['']);
    const [error, setError] = useState(null);

    const addParticipantField = () => setParticipants([...participants, '']);
    
    const handleParticipantChange = (index, value) => {
        const updatedParticipants = [...participants];
        updatedParticipants[index] = value;
        setParticipants(updatedParticipants);
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();

        const groupData = {
            name: groupName,
            participants: participants.filter((p) => p !== ''),
        };

        try {
            await createGroup(groupData);
            onGroupCreated();
            setGroupName('');
            setParticipants(['']);  // Reset form if creation is successful
            onClose();
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="modal">
            <div className="modal-content">
                <h2>Create New Group</h2>
                <form onSubmit={handleCreateGroup}>
                    <label>Group Name</label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        required
                    />
                    {participants.map((participant, index) => (
                        <div key={index} className="participant-input">
                            <label>Participant {index + 1}</label>
                            <input
                                type="text"
                                value={participant}
                                onChange={(e) => handleParticipantChange(index, e.target.value)}
                                required
                            />
                        </div>
                    ))}
                    <button type="button" onClick={addParticipantField}>Add a New Participant</button>
                    <button type="submit">Create Group</button>
                </form>
                <button onClick={onClose} className="close-modal">Close</button>
            </div>
        </div>
    );
};

export default GroupModal;

