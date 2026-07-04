import { useState } from 'react';
import SignIn from '../SignIn/index';
import SignUp from '../SignUp/index';
import type { SetIsSignedIn } from '../../../App';
import './styles.css';

interface WelcomeProps {
    setIsSignedIn: SetIsSignedIn;
}

const Welcome = ({ setIsSignedIn }: WelcomeProps) => {
    const [showSignUp, setShowSignUp] = useState(false);

    const toggleSignUp = () => {
        setShowSignUp(!showSignUp);
    };

    return (
        <div className='welcome-page'>
            <h1 className="welcome-title">
                Welcome to Splidot!
                <img src="/dot.svg" alt="dot icon" className="welcome-dot-icon" />
            </h1>
            {showSignUp ? (
                <SignUp toggleSignUp={toggleSignUp} />
            ) : (
                <>
                    <SignIn setIsSignedIn={setIsSignedIn} />
                    <p className="signup-prompt">
                        Don&apos;t have an account?{' '}
                        <span className='sign-up-option' onClick={toggleSignUp}>
                            Sign up
                        </span>
                    </p>
                </>
            )}
        </div>
    );
};

export default Welcome;
