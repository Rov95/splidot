import { useState, type FormEvent } from 'react';
import { createGroup } from '../../../services/groupService';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import './styles.css';

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
        setError(null);

        const groupData = {
            name: groupName.trim(),
            participants: participants.map((p) => p.trim()).filter((p) => p !== ''),
        };

        if (!groupData.name || groupData.participants.length === 0) {
            setError('Please add a group name and at least one participant.');
            return;
        }

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
        <Modal title="Create New Group" onClose={onClose} className="group-modal">
            <form onSubmit={handleCreateGroup} className="group-modal__form" noValidate>
                <div className="group-modal__field">
                    <label className="ui-label" htmlFor="group-name">Group Name</label>
                    <input
                        id="group-name"
                        type="text"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="ui-input"
                        required
                    />
                </div>
                {participants.map((participant, index) => (
                    <div key={index} className="group-modal__field">
                        <label className="ui-label" htmlFor={`participant-${index}`}>Participant {index + 1}</label>
                        <input
                            id={`participant-${index}`}
                            type="text"
                            value={participant}
                            onChange={(e) => handleParticipantChange(index, e.target.value)}
                            className="ui-input"
                            required
                        />
                    </div>
                ))}
                <Button type="button" variant="secondary" onClick={addParticipantField}>
                    Add a New Participant
                </Button>
                {error && <p className="ui-field-error">{error}</p>}
                <div className="group-modal__actions">
                    <Button type="button" variant="ghost" onClick={onClose}>Close</Button>
                    <Button type="submit">Create Group</Button>
                </div>
            </form>
        </Modal>
    );
};

export default GroupModal;
