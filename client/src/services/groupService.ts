import type { Group } from '../types';

const API_URL = 'http://127.0.0.1:3000/groups';

export interface CreateGroupData {
    name: string;
    participants: string[];
}

interface Participant {
    user_id: string;
    name: string | null;
}

export const createGroup = async (groupData: CreateGroupData): Promise<Group> => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(groupData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server response:', errorData);
            throw new Error('Failed to create group, please try again.');
        }
        console.log(groupData)

        return await response.json();
    } catch (error) {
        console.error('Error creating group:', error);
        throw error;
    }
};

export const getGroups = async (): Promise<Group[]> => {
    try {
        const response = await fetch(API_URL, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch groups.');
        return await response.json();
    } catch (error) {
        console.error('Error fetching groups:', error);
        throw error;
    }
};

export const getGroupParticipants = async (groupId: string): Promise<Participant[]> => {
    try {
        const response = await fetch(`${API_URL}/${groupId}/participants`, { credentials: 'include' });
        if (!response.ok) throw new Error('Failed to fetch participants.');
        return await response.json();
    } catch (error) {
        console.error('Error fetching participants:', error);
        throw error;
    }
};
