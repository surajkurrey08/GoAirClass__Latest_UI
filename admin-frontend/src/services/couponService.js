import API from './axios';

/**
 * Fetch public global coupons for homepage banners
 */
export const fetchPublicCoupons = async () => {
    try {
        const response = await API.get('/coupons/public');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch public coupons');
    }
};

/**
 * Fetch available coupons for a bus route/operator
 */
export const getAvailableCoupons = async (routeId, operatorId, amount) => {
    try {
        const response = await API.get('/coupons', {
            params: { routeId, operatorId, amount }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch coupons');
    }
};

/**
 * Apply a coupon code
 */
export const applyCoupon = async (code, amount, routeId, operatorId) => {
    try {
        const response = await API.post('/coupons/apply', {
            code,
            amount,
            routeId,
            operatorId
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to apply coupon');
    }
};
/**
 * Admin: List all coupons
 */
export const adminListCoupons = async () => {
    try {
        const response = await API.get('/coupons/admin/list');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch admin coupons');
    }
};

/**
 * Admin: Create a new coupon (FormData for image)
 */
export const createCoupon = async (formData) => {
    try {
        const response = await API.post('/coupons/create', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create coupon');
    }
};

/**
 * Admin: Update a coupon (FormData for image)
 */
export const updateCoupon = async (id, formData) => {
    try {
        const response = await API.put(`/coupons/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update coupon');
    }
};

/**
 * Admin: Delete a coupon
 */
export const deleteCoupon = async (id) => {
    try {
        const response = await API.delete(`/coupons/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete coupon');
    }
};
