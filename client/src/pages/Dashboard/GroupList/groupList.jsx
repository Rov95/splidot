import React, { useState } from 'react';
import './styles.css'

const GroupList = ({ groups, onSelectGroup }) => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showAllGroups, setShowAllGroups] = useState(true);

    const handleGroupClick = (groupId) => {
        setSelectedGroup(groups.find(group => group.group_id === groupId));
        setShowAllGroups(false);
        onSelectGroup(groupId);
    };

    const handleToggleView = () => {
        setShowAllGroups(!showAllGroups);
        if (!showAllGroups) {
            setSelectedGroup(null); // Clear selected group when showing all
        }
    };


    return (
        <div className="group-list" onClick={handleToggleView}>
            <h2 className="group-list-title">Your Groups</h2>
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
