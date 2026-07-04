import { signOut } from '../../../services/authService';
import type { SetIsSignedIn } from '../../../App';
// @ts-ignore: allow side-effect import for styles
import './styles.css';

interface LogoutButtonProps {
    setIsSignedIn: SetIsSignedIn;
}

const LogoutButton = ({ setIsSignedIn }: LogoutButtonProps) => {
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
