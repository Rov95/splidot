import React, { useState } from "react";
import { signUp } from "../../../services/authService";
import './styles.css'

const SignUp = ({ toggleSignUp }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [error, setError] = useState(null);

    const handleSignUp =  async (e) => {
        e.preventDefault();

        try {
            const response = await signUp({ email, password, firstName, lastName })
            console.log('Sign up succesfull: ', response);
            toggleSignUp();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <form onSubmit={handleSignUp} className="sign-up-form">
            <h2>Sign Up</h2>
            <label>First Name</label>
            <input 
                type="text" 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)}
                required
            />
            <label>Last Name</label>
            <input 
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
            />
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
            <button type="submit" className="form-button">Sign Up</button>
            <p onClick={toggleSignUp} className="back-to-sign">
                Back to Sign In
            </p>
        </form>
    )
}

export default SignUp;