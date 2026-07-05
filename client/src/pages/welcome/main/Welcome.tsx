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
        <div className="welcome-page">
            <header className="welcome-page__hero">
                <img src="/dot.svg" alt="dot icon" className="welcome-page__dot" />
                <h1 className="welcome-page__title">Welcome to Splidot!</h1>
                <p className="welcome-page__tagline">
                    Split group expenses, settle with a dot.
                </p>
            </header>
            <div className="welcome-page__card">
                {showSignUp ? (
                    <SignUp toggleSignUp={toggleSignUp} setIsSignedIn={setIsSignedIn} />
                ) : (
                    <>
                        <SignIn setIsSignedIn={setIsSignedIn} />
                        <p className="welcome-page__signup-prompt">
                            Don&apos;t have an account?{' '}
                            <button
                                type="button"
                                className="welcome-page__signup-link"
                                onClick={toggleSignUp}
                            >
                                Sign up
                            </button>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default Welcome;
