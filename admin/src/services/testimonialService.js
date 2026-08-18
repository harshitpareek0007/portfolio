import api from './api';

export const getTestimonials = async () => {
    const { data } = await api.get('/testimonials');
    return data;
};

export const getTestimonial = async (id) => {
    const { data } = await api.get(`/testimonials/${id}`);
    return data;
};

export const createTestimonial = async (testimonialData) => {
    const { data } = await api.post('/testimonials', testimonialData);
    return data;
};

export const updateTestimonial = async (id, testimonialData) => {
    const { data } = await api.put(`/testimonials/${id}`, testimonialData);
    return data;
};

export const deleteTestimonial = async (id) => {
    const { data } = await api.delete(`/testimonials/${id}`);
    return data;
};
