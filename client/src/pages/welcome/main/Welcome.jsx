import React, { useState } from 'react';
import SignIn from '../SignIn/index';
import SignUp from '../SignUp/index';

const Welcome = ({ setIsSignedIn }) => {
    const [showSignUp, setShowSignUp] = useState(false);

    const toggleSignUp = () => {
        setShowSignUp(!showSignUp);
    };

    return (
        <div className='welcome-page'>
            <h1>Welcome</h1>
            {showSignUp ? (
                <SignUp toggleSignUp={toggleSignUp} />
            ) : (
                <>
                    <SignIn setIsSignedIn={setIsSignedIn} />
                    <p>
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


