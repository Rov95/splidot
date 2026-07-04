import { useState, type FormEvent } from 'react';
import { createGroup } from '../../../services/groupService';
import './styles.css'

interface GroupModalProps {
    onClose: () => void;
    onGroupCreated: () => void;
}

const GroupModal = ({ onClose, onGroupCreated }: GroupModalProps) => {
    const [groupName, setGroupName] = useState('');
    const [participants, setParticipants] = useState(['']);
    const [error, setError] = useState<string | null>(null);

    const addParticipantField = () => setParticipants([...participants, '']);

    const handleParticipantChange = (index: number, value: string) => {
        const updatedParticipants = [...participants];
        updatedParticipants[index] = value;
        setParticipants(updatedParticipants);
    };

    const handleCreateGroup = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const groupData = {
            name: groupName,
            participants: participants.filter((p) => p !== ''),
        };

        try {
            await createGroup(groupData);
            onGroupCreated();
            setGroupName('');
            setParticipants(['']);
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Something went wrong');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2 className="modal-title">Create New Group</h2>
                <form onSubmit={handleCreateGroup} className="modal-form">
                    <label className="input-label" htmlFor="group-name">Group Name</label>
                    <input
                        id="group-name"
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="input-field"
                        required
                    />
                    {participants.map((participant, index) => (
                        <div key={index} className="participant-input">
                            <label className="input-label" htmlFor={`participant-${index}`}>Participant {index + 1}</label>
                            <input
                                id={`participant-${index}`}
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
