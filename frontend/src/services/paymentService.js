import API from './axios';

/**
 * PAYMENT SERVICE (Razorpay)
 */

export const createPaymentOrder = async (orderData) => {
    try {
        const response = await API.post('/payments/create-order', orderData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create payment order');
    }
};

export const verifyPayment = async (paymentData) => {
    try {
        const response = await API.post('/payments/verify', paymentData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Payment verification failed');
    }
};

export const createFinalBooking = async (bookingData) => {
    try {
        const token = localStorage.getItem('token');
        const response = await API.post('/bookings/create', bookingData, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data?.error || 'Failed to finalize booking';
        throw new Error(errorMsg);
    }
};
