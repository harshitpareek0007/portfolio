import api from './api';

export const getMessages = async () => {
    const { data } = await api.get('/messages');
    return data;
};

export const getMessage = async (id) => {
    const { data } = await api.get(`/messages/${id}`);
    return data;
};

// Not used in admin usually, but good for completeness
export const createMessage = async (messageData) => {
    const { data } = await api.post('/messages', messageData);
    return data;
};

export const updateMessage = async (id, messageData) => {
    const { data } = await api.put(`/messages/${id}`, messageData);
    return data;
};

export const deleteMessage = async (id) => {
    const { data } = await api.delete(`/messages/${id}`);
    return data;
};
