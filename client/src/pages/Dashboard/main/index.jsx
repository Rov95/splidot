import React, { useState, useEffect } from 'react';
import GroupModal from '../GroupModal/index';
import GroupList from '../GroupList/groupList';
import ParticipantList from '../ParticipantList/participantList';
import AddExpense from '../AddExpense/addExpense';
import LogoutButton from '../LogOut/logOut'; 
import { getGroups } from '../../../services/groupService';

const Dashboard = ({ setIsSignedIn }) => {
    const [groups, setGroups] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [participants, setParticipants] = useState([]);

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

    const handleAddExpense = ({ payer, amount }) => {
        setParticipants(prevParticipants =>
            prevParticipants.map(participant =>
                participant.user_id === payer
                    ? { ...participant, totalPaid: participant.totalPaid + amount }
                    : participant
            )
        );
    };


    return (
        <div className="dashboard">
            <h1>Create new group</h1>
            <button onClick={toggleModal} className="add-group-button">+</button>

            {showModal && <GroupModal onClose={() => setShowModal(false)} onGroupCreated={handleGroupCreated} />}

            <div className="group-manager">
                <GroupList groups={groups} onSelectGroup={setSelectedGroupId} />
                {selectedGroupId && (
                    <>
                        <ParticipantList groupId={selectedGroupId} participants={participants} setParticipants={setParticipants} />
                        <AddExpense participants={participants} onAddExpense={handleAddExpense} />
                    </>
                )}
            </div>
            <LogoutButton setIsSignedIn={setIsSignedIn} />
        </div>
    );
};

export default Dashboard;
