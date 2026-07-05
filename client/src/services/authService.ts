const API_URL = 'http://localhost:3000/users';
const TOKEN_KEY = 'splidot_token';

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

interface TokenResponse {
    token: string;
}

interface MessageResponse {
    message: string;
}

export interface CurrentUser {
    user_id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

// Spread into a request's headers to authenticate it; empty when there's no token.
export const authHeaders = (): Record<string, string> => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const signUp = async (userData: SignUpData): Promise<TokenResponse> => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
        if (!response.ok) {
            throw new Error('Failed to register, please try again');
        }
        const data: TokenResponse = await response.json();
        // Registering already issues a token, so new users go straight to the
        // dashboard without a second sign-in.
        setToken(data.token);
        return data;
    } catch (error) {
        console.error('Error signing up: ', error);
        throw error;
    }
}

export const signIn = async (credentials: SignInCredentials): Promise<TokenResponse> => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        });
        if (!response.ok) {
            throw new Error('Invalid email or password.');
        }
        const data: TokenResponse = await response.json();
        setToken(data.token);
        return data;
    } catch (error) {
        console.error('Error in SignIn: ', error);
        throw error;
    }
}

export const signOut = async (): Promise<MessageResponse> => {
    try {
        const response = await fetch(`${API_URL}/logout`, { method: 'POST' });
        if (!response.ok) {
            throw new Error('Error logging out, please try again.');
        }
        return await response.json();
    } catch (error) {
        console.error('Error signing out: ', error);
        throw error;
    } finally {
        // The token is the source of truth for being signed in, so always drop it.
        clearToken();
    }
};

export const getCurrentUser = async (): Promise<CurrentUser> => {
    try {
        const response = await fetch(`${API_URL}/me`, { headers: authHeaders() });
        if (!response.ok) {
            throw new Error('Failed to load profile.');
        }
        // The server wraps the payload as { user }.
        const data: { user: CurrentUser } = await response.json();
        return data.user;
    } catch (error) {
        console.error('Error fetching current user: ', error);
        throw error;
    }
};

// Confirms the stored token is still accepted by the server (e.g. not expired).
export const validateSession = async (): Promise<boolean> => {
    if (!getToken()) return false;
    try {
        const response = await fetch(`${API_URL}/me`, { headers: authHeaders() });
        return response.ok;
    } catch (error) {
        console.error('Error validating session: ', error);
        return false;
    }
};
