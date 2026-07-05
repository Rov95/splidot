import { signOut } from '../../../services/authService';
import Button from '../../../components/ui/Button';
import type { SetIsSignedIn } from '../../../App';

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
        <Button variant="secondary" size="sm" onClick={handleLogout} className="logout-button">
            Log Out
        </Button>
    );
};

export default LogoutButton;
