import API from './axios';

export const adminListDestinations = async () => {
    try {
        const response = await API.get('/destinations');
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch destinations');
    }
};

export const fetchPublicDestinations = async () => {
    try {
        const response = await API.get('/destinations/public');
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch public destinations');
    }
};

export const createDestination = async (formData) => {
    try {
        const response = await API.post('/destinations', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create destination');
    }
};

export const updateDestination = async (id, formData) => {
    try {
        const response = await API.put(`/destinations/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update destination');
    }
};

export const deleteDestination = async (id) => {
    try {
        const response = await API.delete(`/destinations/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete destination');
    }
};
