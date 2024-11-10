const API_URL = 'http://127.0.0.1:3000/users';

export const signUp = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            throw new Error('Failed to register, please try again');
        }
        return await response.json();
    } catch (error) {
        console.error('Error signing up: ', error);
        throw error;
    }
}

export const signIn = async (credentials) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) {
            throw new Error('Invalid email or password.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error in SignIn: ', error);
        throw error;
    }
}