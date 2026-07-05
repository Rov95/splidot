import { useState, type FormEvent } from 'react';
import { signIn } from '../../../services/authService';
import { Navigate } from 'react-router-dom';
import type { SetIsSignedIn } from '../../../App';
import '../../../components/ui/button.css';

interface SignInProps {
    setIsSignedIn: SetIsSignedIn;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = ({ setIsSignedIn }: SignInProps) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
    const [error, setError] = useState<string | null>(null);
    const [redirect, setRedirect] = useState(false);

    const validate = () => {
        const errors: { email?: string; password?: string } = {};
        if (!EMAIL_PATTERN.test(email)) errors.email = 'Enter a valid email address';
        if (!password) errors.password = 'Password is required';
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!validate()) return;

        try {
            await signIn({ email, password });
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
        <form onSubmit={handleSignIn} className="sign-in-form auth-form" noValidate>
            <h2 className="auth-form__title">Sign In</h2>
            <div className="auth-form__field">
                <label htmlFor="signin-email" className="ui-label">Email</label>
                <input
                    id="signin-email"
                    className="ui-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                {fieldErrors.email && <p className="ui-field-error">{fieldErrors.email}</p>}
            </div>
            <div className="auth-form__field">
                <label htmlFor="signin-password" className="ui-label">Password</label>
                <input
                    id="signin-password"
                    className="ui-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                {fieldErrors.password && <p className="ui-field-error">{fieldErrors.password}</p>}
            </div>
            <button type="submit" className="ui-btn ui-btn--primary ui-btn--md">Sign In</button>
            {error && <p className="auth-form__error">{error}</p>}
        </form>
    );
};

export default SignIn;
