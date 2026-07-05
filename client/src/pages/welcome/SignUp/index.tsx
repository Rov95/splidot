import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { signUp } from '../../../services/authService';
import type { SetIsSignedIn } from '../../../App';
import '../../../components/ui/button.css';

interface SignUpProps {
    toggleSignUp: () => void;
    setIsSignedIn: SetIsSignedIn;
}

type SignUpFieldErrors = {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignUp = ({ toggleSignUp, setIsSignedIn }: SignUpProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
    const [error, setError] = useState<string | null>(null);
    const [redirect, setRedirect] = useState(false);

    const validate = () => {
        const errors: SignUpFieldErrors = {};
        if (!firstName.trim()) errors.firstName = 'First name is required';
        if (!lastName.trim()) errors.lastName = 'Last name is required';
        if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address';
        if (password.length < 8) errors.password = 'Password must be at least 8 characters';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!validate()) return;

        try {
            await signUp({ email, password, firstName, lastName });
            // signUp stores the issued token, so the new account is already
            // authenticated — go straight to the dashboard.
            setIsSignedIn(true);
            setRedirect(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        }
    };

    if (redirect) {
        return <Navigate to="/dashboard" />;
    }

    return (
        <form onSubmit={handleSignUp} className="sign-up-form auth-form" noValidate>
            <h2 className="auth-form__title">Sign Up</h2>
            <div className="auth-form__field">
                <label htmlFor="signup-firstName" className="ui-label">First Name</label>
                <input
                    id="signup-firstName"
                    className="ui-input"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                />
                {fieldErrors.firstName && <p className="ui-field-error">{fieldErrors.firstName}</p>}
            </div>
            <div className="auth-form__field">
                <label htmlFor="signup-lastName" className="ui-label">Last Name</label>
                <input
                    id="signup-lastName"
                    className="ui-input"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                />
                {fieldErrors.lastName && <p className="ui-field-error">{fieldErrors.lastName}</p>}
            </div>
            <div className="auth-form__field">
                <label htmlFor="signup-email" className="ui-label">Email</label>
                <input
                    id="signup-email"
                    className="ui-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {fieldErrors.email && <p className="ui-field-error">{fieldErrors.email}</p>}
            </div>
            <div className="auth-form__field">
                <label htmlFor="signup-password" className="ui-label">Password</label>
                <input
                    id="signup-password"
                    className="ui-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {fieldErrors.password && <p className="ui-field-error">{fieldErrors.password}</p>}
            </div>
            <button type="submit" className="ui-btn ui-btn--primary ui-btn--md">Sign Up</button>
            {error && <p className="auth-form__error">{error}</p>}
            <button type="button" onClick={toggleSignUp} className="auth-form__switch">
                Back to Sign In
            </button>
        </form>
    );
};

export default SignUp;
