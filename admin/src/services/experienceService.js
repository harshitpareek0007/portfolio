import api from './api';

export const getExperiences = async () => {
    const { data } = await api.get('/experience');
    return data;
};

export const getExperience = async (id) => {
    const { data } = await api.get(`/experience/${id}`);
    return data;
};

export const createExperience = async (experienceData) => {
    const { data } = await api.post('/experience', experienceData);
    return data;
};

export const updateExperience = async (id, experienceData) => {
    const { data } = await api.put(`/experience/${id}`, experienceData);
    return data;
};

export const deleteExperience = async (id) => {
    const { data } = await api.delete(`/experience/${id}`);
    return data;
};
