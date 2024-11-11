const API_URL = 'http://127.0.0.1:3000/groups';

export const createGroup = async (groupData) => {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
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

export const getGroups = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch groups.');
        return await response.json();
    } catch (error) {
        console.error('Error fetching groups:', error);
        throw error;
    }
};

export const getGroupParticipants = async (groupId) => {
    try {
        const response = await fetch(`${API_URL}/${groupId}/participants`);
        if (!response.ok) throw new Error('Failed to fetch participants.');
        return await response.json();
    } catch (error) {
        console.error('Error fetching participants:', error);
        throw error;
    }
};
