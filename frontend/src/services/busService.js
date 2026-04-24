import API from './axios';

/**
 * BUS PORTAL SERVICE
 */

export const getBusSeatLayout = async (scheduleId) => {
  try {
    const response = await API.get(`/bus/${scheduleId}/seats`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch seat layout');
  }
};

export const createBusBooking = async (bookingData) => {
  try {
    const response = await API.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create booking');
  }
};

/**
 * Fetch all bookings for the logged-in user
 */
export const getUserBookings = async () => {
    try {
        const response = await API.get('/bookings/user');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
};

/**
 * Fetch booking details by ID
 */
export const getBookingDetails = async (id) => {
    try {
        const response = await API.get(`/bookings/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch booking details');
    }
};

/**
 * Cancel a ticket
 */
export const cancelTicket = async (bookingId, seatNumbers) => {
    try {
        const response = await API.post('/bookings/cancel-ticket', { bookingId, seatNumbers });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to cancel ticket');
    }
};
