import type { Expense, Balance } from '../types';

const API_URL = 'http://localhost:3000/groups';

export interface NewExpensePayload {
    payer_id: string;
    amount: number;
    description: string;
    category: string;
}

export const addExpense = async (groupId: string, expenseData: NewExpensePayload): Promise<Expense> => {
    try {
        const response = await fetch(`${API_URL}/${groupId}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(expenseData),
        });

        if (!response.ok) throw new Error('Failed to add expense, please try again.');

        return await response.json();
    } catch (error) {
        console.error('Error adding expense:', error);
        throw error;
    }
};

export const getGroupExpenses = async (groupId: string): Promise<Expense[]> => {
    try {
        const response = await fetch(`${API_URL}/${groupId}/expenses`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch expenses.');
        return await response.json();
    } catch (error) {
        console.error('Error fetching expenses:', error);
        throw error;
    }
};

export const deleteExpense = async (groupId: string, expenseId: string): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}/${groupId}/expenses/${expenseId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        if (!response.ok) throw new Error('Failed to delete expense.');
    } catch (error) {
        console.error('Error deleting expense:', error);
        throw error;
    }
};

export const getGroupBalances = async (groupId: string): Promise<Balance[]> => {
    try {
        const response = await fetch(`${API_URL}/${groupId}/balances`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch balances.');
        return await response.json();
    } catch (error) {
        console.error('Error fetching balances:', error);
        throw error;
    }
};
