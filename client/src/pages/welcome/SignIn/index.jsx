import React, { useState } from "react";
import { signIn } from '../../../services/authService';
import { Navigate } from 'react-router-dom';

const SignIn = ({ setIsSignedIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [redirect, setRedirect] = useState(false);  // new state for redirect

    const handleSignIn = async (e) => {
        e.preventDefault();

        try {
            const response = await signIn({ email, password });
            console.log('Sign in successful: ', response);
            setIsSignedIn(true);  
            setRedirect(true);   
        } catch (err) {
            setError(err.message);
        }
    };

    if (redirect) {
        // Redirect to dashboard after successful sign-in
        return <Navigate to="/dashboard" />;
    }

    return (
        <form onSubmit={handleSignIn} className="sign-in-form">
            <h2 className="title">Sign In</h2>
            <label>Email</label>
            <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <label>Password</label>
            <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit">Sign In</button>
            {error && <p className="error">{error}</p>}
        </form>
    );
};

export default SignIn;


