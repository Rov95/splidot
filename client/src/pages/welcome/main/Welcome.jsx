import React, { useState } from 'react';
import SignIn from '../SignIn/index';
import SignUp from '../SignUp/index';
import './styles.css';

const Welcome = ({ setIsSignedIn }) => {
    const [showSignUp, setShowSignUp] = useState(false);

    const toggleSignUp = () => {
        setShowSignUp(!showSignUp);
    };

    return (
        <div className='welcome-page'>
            <h1 className="welcome-title">Welcome to Splidot!</h1>
            {showSignUp ? (
                <SignUp toggleSignUp={toggleSignUp} />
            ) : (
                <>
                    <SignIn setIsSignedIn={setIsSignedIn} />
                    <p className="signup-prompt">
                        Don't have an account?{' '}
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


