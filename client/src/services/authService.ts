const API_URL = 'http://localhost:3000/users';

export interface SignUpData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}

export interface SignInCredentials {
    email: string;
    password: string;
}

interface MessageResponse {
    message: string;
}

export const signUp = async (userData: SignUpData): Promise<MessageResponse> => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
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

export const signIn = async (credentials: SignInCredentials): Promise<MessageResponse> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
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

export const signOut = async (): Promise<MessageResponse> => {
    try {
        const response = await fetch(`${API_URL}/logout`, {
            method: 'POST',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error('Error logging out, please try again.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error signing out: ', error);
        throw error;
    }
};
