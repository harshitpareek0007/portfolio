import api from './api';

export const getSettings = async () => {
    const { data } = await api.get('/settings');
    return data.data; // Accessing the 'data' property of the response JSON
};

export const updateSettings = async (settingsData) => {
    const { data } = await api.put('/settings', settingsData);
    return data.data;
};
