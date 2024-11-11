import React, { useState, useEffect } from 'react';
import GroupModal from '../GroupModal/index';
import GroupList from '../GroupList/groupList';
import ParticipantList from '../ParticipantList/participantList';
import { getGroups } from '../../../services/groupService';

const Dashboard = () => {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    
    const toggleModal = () => setShowModal(!showModal);

    const fetchGroups = async () => {
        try {
            const data = await getGroups();
            setGroups(data);
        } catch (error) {
            console.error('Error fetching groups:', error);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleGroupCreated = async () => {
        await fetchGroups();
        setShowModal(false);  // Close modal after refreshing groups
    };


    return (
        <div className="dashboard">
            <h1>Create new group</h1>
            <button onClick={toggleModal} className="add-group-button">+</button>
            
            {showModal && <GroupModal onClose={() => setShowModal(false)} onGroupCreated={handleGroupCreated} />}
            
            <div className="group-manager">
                <GroupList groups={groups} onSelectGroup={setSelectedGroupId} />
                {selectedGroupId && <ParticipantList groupId={selectedGroupId} />}
            </div>
        </div>
    );
};

export default Dashboard;
