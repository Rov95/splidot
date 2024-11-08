import React from 'react';
import { SignIn, SignUp, SignedOut, SignedIn, useClerk } from '@clerk/clerk-react';

const LoginSignUpForm = () => {
    const { signOut } = useClerk();

    return (
        <div>
            <SignedOut>
                <SignIn />
            </SignedOut>
            <SignedIn>
                <h2>Welcome Back!</h2>
                <button onClick={() => signOut()}>Sign Out</button>
            </SignedIn>
        </div>
    );
};

export default LoginSignUpForm;

