import React, { useState } from "react";
import { signIn } from '../../../services/authService'

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSignIn = async (e) => {8-
        e.preventDefault();

        try {
            const response = await signIn({ email, password });
            console.log('Sign in succesful: ', response);
        } catch (err) {
            setError(err.message)
        }
    };

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
        </form>
    )
}

export default SignIn;




