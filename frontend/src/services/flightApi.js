import API from './axios';

const API_URL = '/admin/flights';

/**
 * Airline Management APIs
 */
export const addAirline = async (data) => {
    const response = await API.post(`${API_URL}/airlines`, data);
    return response.data;
};

export const getAirlines = async () => {
    const response = await API.get('/flights/airlines');
    return response.data;
};

export const updateAirline = async (id, data) => {
    const response = await API.put(`${API_URL}/airlines/${id}`, data);
    return response.data;
}

export const toggleAirlineStatus = async (id) => {
    const response = await API.patch(`${API_URL}/airlines/${id}/status`);
    return response.data;
};

/**
 * Airport Management APIs
 */
export const addAirport = async (data) => {
    const response = await API.post(`${API_URL}/airports`, data);
    return response.data;
};

export const getAirports = async (params) => {
    const response = await API.get(`${API_URL}/airports`, { params });
    return response.data;
};

export const updateAirport = async (id, data) => {
    const response = await API.put(`${API_URL}/airports/${id}`, data);
    return response.data;
};

export const deleteAirport = async (id) => {
    const response = await API.delete(`${API_URL}/airports/${id}`);
    return response.data;
};

/**
 * Route Management APIs
 */
export const addFlightRoute = async (data) => {
    const response = await API.post(`${API_URL}/routes`, data);
    return response.data;
};

export const getFlightRoutes = async (params) => {
    const response = await API.get(`${API_URL}/routes`, { params });
    return response.data;
};

export const updateFlightRoute = async (id, data) => {
    const response = await API.put(`${API_URL}/routes/${id}`, data);
    return response.data;
};

export const deleteFlightRoute = async (id) => {
    const response = await API.delete(`${API_URL}/routes/${id}`);
    return response.data;
};

/**
 * Inventory Management APIs
 */
export const addFlightInventory = async (data) => {
    const response = await API.post(`${API_URL}/inventory`, data);
    return response.data;
};

export const getFlightInventory = async (params) => {
    const response = await API.get(`${API_URL}/inventory`, { params });
    return response.data;
};

export const updateFlightInventory = async (id, data) => {
    const response = await API.put(`${API_URL}/inventory/${id}`, data);
    return response.data;
};

export const deleteFlightInventory = async (id) => {
    const response = await API.delete(`${API_URL}/inventory/${id}`);
    return response.data;
};

/**
 * API Config APIs
 */
export const getApiConfigs = async () => {
    const response = await API.get(`${API_URL}/api-config`);
    return response.data;
};

export const saveApiConfig = async (data) => {
    const response = await API.post(`${API_URL}/api-config`, data);
    return response.data;
};

/**
 * Pricing Engine APIs
 */
export const addPricingRule = async (data) => {
    const response = await API.post(`${API_URL}/pricing`, data);
    return response.data;
};

export const getPricingRules = async () => {
    const response = await API.get(`${API_URL}/pricing`);
    return response.data;
};

export const updatePricingRule = async (id, data) => {
    const response = await API.put(`${API_URL}/pricing/${id}`, data);
    return response.data;
};

export const deletePricingRule = async (id) => {
    const response = await API.delete(`${API_URL}/pricing/${id}`);
    return response.data;
};

/**
 * Dashboard & Analytics APIs
 */
export const getFlightDashboardStats = async () => {
    const response = await API.get(`${API_URL}/dashboard`);
    return response.data;
};

export const getFlightReports = async (params) => {
    const response = await API.get(`${API_URL}/reports`, { params });
    return response.data;
};

/**
 * Booking APIs
 */
export const getFlightBookings = async (params) => {
    const response = await API.get(`${API_URL}/bookings`, { params });
    return response.data;
};

/**
 * Refund APIs
 */
export const getFlightRefunds = async () => {
    const response = await API.get(`${API_URL}/refunds`);
    return response.data;
};

export const updateFlightRefundStatus = async (id, data) => {
    const response = await API.put(`${API_URL}/refunds/${id}`, data);
    return response.data;
};

/**
 * Support Ticket APIs
 */
export const getFlightTickets = async () => {
    const response = await API.get(`${API_URL}/tickets`);
    return response.data;
};

export const updateFlightTicket = async (id, data) => {
    const response = await API.put(`${API_URL}/tickets/${id}`, data);
    return response.data;
};

/**
 * Booking APIs
 */
export const createBookingSession = async (bookingData) => {
    try {
        const response = await API.post('/flight-bookings/create-session', bookingData);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const lockPrice = async (sessionId) => {
    try {
        const response = await API.post('/flight-bookings/lock-price', { sessionId });
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getSessionDetails = async (sessionId) => {
    try {
        const response = await API.get(`/flight-bookings/session/${sessionId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getBookingByPNR = async (pnr) => {
    try {
        const response = await API.get(`/flight-bookings/pnr/${pnr}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

export const getUserFlightBookings = async () => {
    try {
        const response = await API.get('/flight-bookings/user/all');
        return response.data;
    } catch (error) {
        throw error.response?.data || error;
    }
};

/**
 * Public Flight Search APIs
 */
export const searchFlights = async (params) => {
    // Note: This uses the base /flights path, not the admin path
    const response = await API.get('/flights/search', { params });
    return response.data;
};

export const searchFlightsPost = async (data) => {
    const response = await API.post('/flights/search', data);
    return response.data;
};

export const searchFlightsWithBudget = async (data) => {
    const response = await API.post('/flights/search-with-budget', data);
    return response.data;
};

export const getFlightDetails = async (id) => {
    const response = await API.get(`/flights/${id}`);
    return response.data;
};

/**
 * Ancillary & Meal Management APIs
 */
export const getMealMaster = async () => {
    const response = await API.get('/meals/master');
    return response.data;
};

export const addMealMaster = async (data) => {
    const response = await API.post('/meals/master', data);
    return response.data;
};

export const updateMealMaster = async (id, data) => {
    const response = await API.put(`/meals/master/${id}`, data);
    return response.data;
};

export const deleteMealMaster = async (id) => {
    const response = await API.delete(`/meals/master/${id}`);
    return response.data;
};

export const getFlightMealMapping = async (flightId) => {
    const response = await API.get(`/meals/flight/${flightId}`);
    return response.data;
};

export const saveFlightMealMapping = async (flightId, data) => {
    const response = await API.post(`/meals/flight/${flightId}`, data);
    return response.data;
};

/**
 * Seat Mapping APIs
 */
export const getFlightSeatMapping = async (flightId) => {
    const response = await API.get(`/seats-master/flight/${flightId}`);
    return response.data;
};

export const saveFlightSeatMapping = async (flightId, data) => {
    const response = await API.post(`/seats-master/flight/${flightId}`, data);
    return response.data;
};

/**
 * Baggage Mapping APIs
 */
export const getFlightBaggageMapping = async (flightId) => {
    const response = await API.get(`/baggage-mapping/${flightId}`);
    return response.data;
};

export const saveFlightBaggageMapping = async (flightId, data) => {
    const response = await API.post(`/baggage-mapping/${flightId}`, data);
    return response.data;
};
/**
 * Seat Inventory & Locking APIs
 */
export const getFlightSeats = async (flightId) => {
    const response = await API.get(`/seats?flightId=${flightId}`);
    return response.data;
};

export const lockSeat = async (flightId, seatNumber, userId) => {
    const response = await API.post('/seats/lock', { flightId, seatNumber, userId });
    return response.data;
};

export const releaseSeat = async (flightId, seatNumber, userId) => {
    const response = await API.post('/seats/release', { flightId, seatNumber, userId });
    return response.data;
};
