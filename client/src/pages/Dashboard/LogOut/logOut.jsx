import React from 'react';
import { signOut } from '../../../services/authService';

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
        <button onClick={handleLogout} className="logout-button">
            Log Out
        </button>
    );
};

export default LogoutButton;
