import { useState, type FormEvent } from "react";
import { signIn } from '../../../services/authService';
import { Navigate } from 'react-router-dom';
import type { SetIsSignedIn } from '../../../App';
import './styles.css'

interface SignInProps {
    setIsSignedIn: SetIsSignedIn;
}

const SignIn = ({ setIsSignedIn }: SignInProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [redirect, setRedirect] = useState(false);

    const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await signIn({ email, password });
            console.log('Sign in successful: ', response);
            setIsSignedIn(true);
            setRedirect(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        }
    };

    if (redirect) {
        // Redirect to dashboard after successful sign-in
        return <Navigate to="/dashboard" />;
    }

    return (
        <form onSubmit={handleSignIn} className="sign-in-form">
            <h2 className="form-title">Sign In</h2>
            <label htmlFor="signin-email">Email</label>
            <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <label htmlFor="signin-password">Password</label>
            <input
                id="signin-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" className="form-button">Sign In</button>
            {error && <p className="error">{error}</p>}
        </form>
    );
};

export default SignIn;
