import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { signIn, signUp, signOut, getToken, getCurrentUser, authHeaders, validateSession } from './authService';

const mockFetch = (response: Partial<Response>) =>
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response as Response);

describe('authService token handling', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('stores the token returned by signIn', async () => {
        mockFetch({ ok: true, json: async () => ({ token: 'jwt-123' }) });

        await signIn({ email: 'a@b.com', password: 'pw' });

        expect(getToken()).toBe('jwt-123');
    });

    it('does not store a token when signIn fails', async () => {
        mockFetch({ ok: false, json: async () => ({}) });

        await expect(signIn({ email: 'a@b.com', password: 'bad' })).rejects.toThrow();
        expect(getToken()).toBeNull();
    });

    it('stores the token returned by signUp so registration auto-logs-in', async () => {
        mockFetch({ ok: true, json: async () => ({ token: 'jwt-456' }) });

        await signUp({ email: 'a@b.com', password: 'longenough', firstName: 'Jane', lastName: 'Doe' });

        expect(getToken()).toBe('jwt-456');
    });

    it('does not store a token when signUp fails', async () => {
        mockFetch({ ok: false, json: async () => ({}) });

        await expect(
            signUp({ email: 'a@b.com', password: 'longenough', firstName: 'Jane', lastName: 'Doe' })
        ).rejects.toThrow();
        expect(getToken()).toBeNull();
    });

    it('getCurrentUser unwraps the { user } payload', async () => {
        localStorage.setItem('splidot_token', 'jwt-123');
        const user = { user_id: 'u1', email: 'a@b.com', firstName: 'Jane', lastName: 'Doe' };
        mockFetch({ ok: true, json: async () => ({ user }) });

        expect(await getCurrentUser()).toEqual(user);
    });

    it('getCurrentUser throws when the server rejects the token', async () => {
        mockFetch({ ok: false, json: async () => ({}) });

        await expect(getCurrentUser()).rejects.toThrow('Failed to load profile.');
    });

    it('clears the token on signOut', async () => {
        localStorage.setItem('splidot_token', 'jwt-123');
        mockFetch({ ok: true, json: async () => ({ message: 'Logged out successfully' }) });

        await signOut();

        expect(getToken()).toBeNull();
    });

    it('authHeaders reflects token presence', () => {
        expect(authHeaders()).toEqual({});

        localStorage.setItem('splidot_token', 'jwt-123');
        expect(authHeaders()).toEqual({ Authorization: 'Bearer jwt-123' });
    });

    it('validateSession returns false without a token and does not call the server', async () => {
        const fetchSpy = mockFetch({ ok: true, json: async () => ({}) });

        expect(await validateSession()).toBe(false);
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('validateSession returns true when the server accepts the token', async () => {
        localStorage.setItem('splidot_token', 'jwt-123');
        mockFetch({ ok: true, json: async () => ({ user: {} }) });

        expect(await validateSession()).toBe(true);
    });
});
