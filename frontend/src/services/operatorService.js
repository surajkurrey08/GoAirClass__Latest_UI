import API from './axios';

/**
 * Fetch all live/upcoming bookings for the operator
 */
export const getLiveBookings = async () => {
    try {
        const response = await API.get('/bus-operator/live-bookings');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch live bookings');
    }
};

/**
 * Update passenger boarding status
 */
export const updateBoardingStatus = async (bookingId, status, notes = '') => {
    try {
        const response = await API.patch('/bus-operator/boarding-status', {
            bookingId,
            boardingStatus: status,
            operatorNotes: notes
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update boarding status');
    }
};

/**
 * Change seat assignment for a booking
 */
export const changeSeat = async (bookingId, newSeatNumbers) => {
    try {
        const response = await API.patch('/bus-operator/change-seat', {
            bookingId,
            newSeatNumbers
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to change seats');
    }
};

/**
 * Cancel a booking from operator side
 */
export const cancelBooking = async (bookingId) => {
    try {
        const response = await API.post('/bus-operator/cancel-booking', {
            bookingId
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to cancel booking');
    }
};
