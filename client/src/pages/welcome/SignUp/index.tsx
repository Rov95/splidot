import { useState, type FormEvent } from "react";
import { signUp } from "../../../services/authService";
import './styles.css'

interface SignUpProps {
    toggleSignUp: () => void;
}

const SignUp = ({ toggleSignUp }: SignUpProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await signUp({ email, password, firstName, lastName })
            console.log('Sign up succesfull: ', response);
            toggleSignUp();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        }
    }

    return (
        <form onSubmit={handleSignUp} className="sign-up-form">
            <h2>Sign Up</h2>
            <label htmlFor="signup-firstName">First Name</label>
            <input
                id="signup-firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
            />
            <label htmlFor="signup-lastName">Last Name</label>
            <input
                id="signup-lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
            />
            <label htmlFor="signup-email">Email</label>
            <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <label htmlFor="signup-password">Password</label>
            <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            <button type="submit" className="form-button">Sign Up</button>
            {error && <p className="error">{error}</p>}
            <p onClick={toggleSignUp} className="back-to-sign">
                Back to Sign In
            </p>
        </form>
    )
}

export default SignUp;
