import React from 'react';
import { signOut } from '../../../services/authService';
import './styles.css';

const LogoutButton = ({ setIsSignedIn }) => {
    const handleLogout = async () => {
        try {
            await signOut();
            setIsSignedIn(false);
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    return (
        <div className="logout-button-container">
            <button onClick={handleLogout} className="logout-button">
                Log Out
            </button>
        </div>
    );
};

export default LogoutButton;
