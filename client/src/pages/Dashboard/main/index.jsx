import React, { useState } from 'react';
import GroupModal from '../GroupModal/index';

const Dashboard = () => {
    const [showModal, setShowModal] = useState(false);

    const toggleModal = () => setShowModal(!showModal);

    return (
        <div className="dashboard">
            <h1>Create new group</h1>
            <button onClick={toggleModal} className="add-group-button">+</button>
            
            {showModal && <GroupModal onClose={toggleModal} />}
            
            {/* Groups list will be mapped here */}
        </div>
    );
};

export default Dashboard;
