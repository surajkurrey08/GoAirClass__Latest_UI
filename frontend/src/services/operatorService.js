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

/**
 * OPERATOR AUTH
 */
export const loginOperator = async (email, password) => {
    try {
        const response = await API.post('/operators/login', { email, password });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Operator login failed');
    }
};

/**
 * DASHBOARD
 */
export const fetchOperatorStats = async () => {
    try {
        const response = await API.get('/dashboard/operator');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to fetch dashboard stats');
    }
};

/**
 * FLEET (BUSES)
 */
export const fetchMyBuses = async () => {
    try {
        const response = await API.get('/buses/my-buses');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch buses');
    }
};

/**
 * ROUTES
 */
export const fetchRoutes = async () => {
    try {
        const response = await API.get('/bus-operator/routes');
        // The controller returns { success: true, routes: [...] }
        return response.data.routes || [];
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch routes');
    }
};

export const fetchBusById = async (id) => {
    try {
        const response = await API.get(`/buses/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bus details');
    }
};

export const createBus = async (formData) => {
    try {
        const response = await API.post('/buses/create', formData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to create bus');
    }
};

export const updateBus = async (id, formData) => {
    try {
        const response = await API.put(`/buses/${id}`, formData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to update bus');
    }
};

export const deleteBus = async (id) => {
    try {
        const response = await API.delete(`/buses/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete bus');
    }
};

export const fetchMyRoutes = async () => {
    try {
        const response = await API.get('/bus-operator/routes');
        return response.data.routes;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch routes');
    }
};

export const fetchMyRouteById = async (id) => {
    try {
        const response = await API.get(`/bus-operator/routes/${id}`);
        return response.data.route;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch route details');
    }
};

export const createMyRoute = async (data) => {
    try {
        const response = await API.post('/bus-operator/routes', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create route');
    }
};

export const updateMyRoute = async (id, data) => {
    try {
        const response = await API.put(`/bus-operator/routes/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update route');
    }
};

export const deleteMyRoute = async (id) => {
    try {
        const response = await API.delete(`/bus-operator/routes/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete route');
    }
};

/**
 * SCHEDULES (TRIPS)
 */
export const fetchTrips = async () => {
    try {
        const response = await API.get('/schedules/my-schedules');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch trips');
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

export const createTrip = async (data) => {
    try {
        const response = await API.post('/schedules/create', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to create trip');
    }
};

export const updateTrip = async (id, data) => {
    try {
        const response = await API.put(`/schedules/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.error || 'Failed to update trip');
    }
};

export const deleteTrip = async (id) => {
    try {
        const response = await API.delete(`/schedules/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete trip');
    }
};

/**
 * BOOKINGS
 */
export const fetchMyBookings = async () => {
    try {
        const response = await API.get('/bookings/my-bookings');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
    }
};

/**
 * MARKETING (COUPONS)
 */
export const fetchMyCoupons = async () => {
    try {
        const response = await API.get('/coupons/operator/list');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch coupons');
    }
};

export const deleteCoupon = async (id) => {
    try {
        const response = await API.delete(`/coupons/delete/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to delete coupon');
    }
};

export const createCoupon = async (data) => {
    try {
        const response = await API.post('/coupons/create', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create coupon');
    }
};

/**
 * ENGAGEMENT (REVIEWS)
 */
export const fetchMyReviews = async () => {
    try {
        const response = await API.get('/reviews/my-reviews');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
    }
};

export const replyToReview = async (id, reply) => {
    try {
        const response = await API.put(`/reviews/reply/${id}`, { reply });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to send reply');
    }
};

/**
 * BOARDING REMINDERS
 */
export const updateTripDriverDetails = async (data) => {
    try {
        const response = await API.put('/bus-operator/trips/driver-details', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update driver details');
    }
};

export const sendBoardingReminders = async (tripId) => {
    try {
        const response = await API.post('/bus-operator/trips/send-reminders', { tripId });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to send reminders');
    }
};

export const getTripManifest = async (scheduleId) => {
    try {
        const response = await API.get(`/bus-operator/trips/${scheduleId}/manifest`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch manifest');
    }
};
