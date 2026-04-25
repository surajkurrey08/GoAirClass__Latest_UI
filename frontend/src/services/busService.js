import API from './axios';

/**
 * BUS PORTAL SERVICE
 */

export const getBusSeatLayout = async (scheduleId, date) => {
  try {
    const response = await API.get(`/bus/${scheduleId}/seats${date ? `?date=${date}` : ''}`);
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
 * Cancel a ticket (User-facing)
 * @param {string} bookingId 
 */
export const cancelTicket = async (bookingId) => {
    try {
        const response = await API.post('/bookings/cancel-ticket', { bookingId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to cancel ticket');
    }
};

/**
 * PUBLIC SEARCH
 */
export const fetchCities = async () => {
    try {
        const response = await API.get('/cities');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch cities');
    }
};

export const searchCities = async (query) => {
    try {
        const response = await API.get(`/cities/search?q=${query}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'City search failed');
    }
};

export const searchBusSchedules = async (params) => {
    try {
        const { from, to, date } = params;
        const response = await API.get('/schedules/search', {
            params: { from, to, date }
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Bus search failed');
    }
};

export const fetchTripById = async (id) => {
    try {
        const response = await API.get(`/schedules/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch trip details');
    }
};

export const fetchPopularRoutes = async () => {
    try {
        const response = await API.get('/routes/popular');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch popular routes');
    }
};
