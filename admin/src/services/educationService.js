import api from './api';

export const getEducations = async () => {
    const { data } = await api.get('/education');
    return data;
};

export const getEducation = async (id) => {
    const { data } = await api.get(`/education/${id}`);
    return data;
};

export const createEducation = async (educationData) => {
    const { data } = await api.post('/education', educationData);
    return data;
};

export const updateEducation = async (id, educationData) => {
    const { data } = await api.put(`/education/${id}`, educationData);
    return data;
};

export const deleteEducation = async (id) => {
    const { data } = await api.delete(`/education/${id}`);
    return data;
};
