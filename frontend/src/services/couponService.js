import API from './axios';

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
