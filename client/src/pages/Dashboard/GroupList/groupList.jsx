import React from 'react';
import './styles.css'

const GroupList = ({ groups, onSelectGroup }) => {

    return (
        <div className="group-list">
            <h2>Your Groups</h2>
            <ul>
                {groups.map((group) => (
                    <li key={group.group_id} onClick={() => onSelectGroup(group.group_id)}>
                        {group.name}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GroupList;
