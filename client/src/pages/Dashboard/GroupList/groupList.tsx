import { useState } from 'react';
import Button from '../../../components/ui/Button';
import type { Group } from '../../../types';
import './styles.css'

interface GroupListProps {
    groups: Group[];
    onSelectGroup: (groupId: string) => void;
    onDeleteGroup: (groupId: string) => Promise<boolean>;
}

const GroupList = ({ groups, onSelectGroup, onDeleteGroup }: GroupListProps) => {
    const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
    const [showAllGroups, setShowAllGroups] = useState(true);

    const handleGroupClick = (groupId: string) => {
        setSelectedGroup(groups.find(group => group.group_id === groupId) ?? null);
        setShowAllGroups(false);
        onSelectGroup(groupId);
    };

    const handleToggleView = () => {
        setShowAllGroups(!showAllGroups);
        if (!showAllGroups) {
            setSelectedGroup(null);
        }
    };


    return (
        <div className="group-list" onClick={handleToggleView}>
            <h2 className="group-list__title">Groups</h2>
            <ul className="group-list__items">
                {showAllGroups ? (
                    groups.length === 0 ? (
                        <li className="group-list__empty">Create your first one below!</li>
                    ) : (
                        groups.map((group) => (
                            <li
                                key={group.group_id}
                                className="group-item"
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent parent div click
                                    handleGroupClick(group.group_id);
                                }}
                            >
                                <span className="group-item__name">{group.name}</span>
                                <span className="group-item__total">
                                    ${Number(group.total_expense).toFixed(2)}
                                </span>
                            </li>
                        ))
                    )
                ) : (
                    selectedGroup && (
                        <li className="group-item-selected">
                            <span className="group-item__name">{selectedGroup.name}</span>
                            <Button
                                variant="danger"
                                size="sm"
                                className="delete-group-btn"
                                onClick={async (e) => {
                                    e.stopPropagation(); // Prevent parent div click
                                    const deleted = await onDeleteGroup(selectedGroup.group_id);
                                    if (deleted) {
                                        setSelectedGroup(null);
                                        setShowAllGroups(true);
                                    }
                                }}
                            >
                                Delete Group
                            </Button>
                        </li>
                    )
                )}
            </ul>
        </div>
    );
};

export default GroupList;
