import { useState } from 'react';
import type { Group } from '../../../types';
import './styles.css'

interface GroupListProps {
    groups: Group[];
    onSelectGroup: (groupId: string) => void;
}

const GroupList = ({ groups, onSelectGroup }: GroupListProps) => {
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
            <h2 className="group-list-title">Groups</h2>
            <ul className="group-list-items">
                {showAllGroups ? (
                    groups.map((group) => (
                        <li
                            key={group.group_id}
                            className="group-item"
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent parent div click
                                handleGroupClick(group.group_id);
                            }}
                        >
                            {group.name}
                        </li>
                    ))
                ) : (
                    selectedGroup && (
                        <li className="group-item-selected">
                            {selectedGroup.name}
                        </li>
                    )
                )}
            </ul>
        </div>
    );
};

export default GroupList;
