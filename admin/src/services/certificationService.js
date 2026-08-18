import api from './api';

export const getCertifications = async () => {
    const { data } = await api.get('/certifications');
    return data;
};

export const getCertification = async (id) => {
    const { data } = await api.get(`/certifications/${id}`);
    return data;
};

export const createCertification = async (certificationData) => {
    const { data } = await api.post('/certifications', certificationData);
    return data;
};

export const updateCertification = async (id, certificationData) => {
    const { data } = await api.put(`/certifications/${id}`, certificationData);
    return data;
};

export const deleteCertification = async (id) => {
    const { data } = await api.delete(`/certifications/${id}`);
    return data;
};
