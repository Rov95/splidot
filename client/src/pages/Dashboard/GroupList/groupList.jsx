import React, { useEffect, useState } from 'react';
import { getGroups } from '../../../services/groupService';
import './styles.css'

const GroupList = ({ groups, onSelectGroup }) => {
    // const [groups, setGroups] = useState([]);
    // const [error, setError] = useState(null);

    // useEffect(() => {
    //     const fetchGroups = async () => {
    //         try {
    //             const data = await getGroups();
    //             setGroups(data);
    //         } catch (err) {
    //             setError(err.message);
    //         }
    //     };
    //     fetchGroups();
    // }, []);

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