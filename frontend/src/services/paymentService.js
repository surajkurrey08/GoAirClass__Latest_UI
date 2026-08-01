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
        const response = await API.post('/flight-bookings/create', bookingData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to finalize booking');
    }
};

export const getBookingDetails = async (bookingId) => {
    try {
        const response = await API.get(`/flight-bookings/${bookingId}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch booking details');
    }
};
