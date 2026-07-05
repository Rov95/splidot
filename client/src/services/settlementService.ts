import type { Settlement } from '../types';
import { authHeaders } from './authService';

const GROUPS_API_URL = 'http://localhost:3000/groups';
const SETTLEMENTS_API_URL = 'http://localhost:3000/settlements';

export const getSettlements = async (groupId: string): Promise<Settlement[]> => {
    try {
        const response = await fetch(`${GROUPS_API_URL}/${groupId}/settlements`, {
            headers: authHeaders(),
        });
        if (!response.ok) throw new Error('Failed to fetch settlements.');
        return await response.json();
    } catch (error) {
        console.error('Error fetching settlements:', error);
        throw error;
    }
};

export const createSettlements = async (groupId: string): Promise<Settlement[]> => {
    try {
        const response = await fetch(`${GROUPS_API_URL}/${groupId}/settlements`, {
            method: 'POST',
            headers: authHeaders(),
        });
        if (!response.ok) throw new Error('Failed to calculate settlements, please try again.');
        return await response.json();
    } catch (error) {
        console.error('Error calculating settlements:', error);
        throw error;
    }
};

export const markSettlementPaid = async (settlementId: string, isPaid: boolean): Promise<Settlement> => {
    try {
        const response = await fetch(`${SETTLEMENTS_API_URL}/${settlementId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
            body: JSON.stringify({ is_paid: isPaid }),
        });
        if (!response.ok) throw new Error('Failed to update settlement.');
        return await response.json();
    } catch (error) {
        console.error('Error updating settlement:', error);
        throw error;
    }
};
