import React, { useState } from 'react';
import { createGroup } from '../../../services/groupService';
import './styles.css'

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
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">Create New Group</h2>
                <form onSubmit={handleCreateGroup} className="modal-form">
                    <label className="input-label">Group Name</label>
                    <input
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="input-field"
                        required
                    />
                    {participants.map((participant, index) => (
                        <div key={index} className="participant-input">
                            <label className="input-label">Participant {index + 1}</label>
                            <input
                                type="text"
                                value={participant}
                                onChange={(e) => handleParticipantChange(index, e.target.value)}
                                className="input-field"
                                required
                            />
                        </div>
                    ))}
                    <button type="button" onClick={addParticipantField} className="add-participant-btn">Add a New Participant</button>
                    <button type="submit" className="submit-btn">Create Group</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <button onClick={onClose} className="close-modal-btn">Close</button>
            </div>
        </div>
    );
};

export default GroupModal;

