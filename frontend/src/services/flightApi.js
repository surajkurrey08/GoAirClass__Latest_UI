import API from './axios';

/**
 * Trigger Partner Flight login (Cleartrip B2B session)
 * POST /api/flights/login
 */
export const loginFlightPartner = async () => {
    try {
        const response = await API.post('/flights/login');
        return response.data;
    } catch (error) {
        console.error("Flight Partner login failed:", error);
        throw error;
    }
};

/**
 * Search flights using Cleartrip B2B proxy route
 * POST /api/flights/search
 */
export const searchFlights = async (searchPayload) => {
    try {
        const response = await API.post('/flights/search', searchPayload);
        return response.data;
    } catch (error) {
        console.error("Flight Search failed:", error);
        throw error;
    }
};

/**
 * Search airports by name using Cleartrip B2B airports search API
 * GET /api/flights/airports/search?name=...
 */
export const searchAirports = async (nameQuery) => {
    try {
        const response = await API.get(`/flights/airports/search?name=${encodeURIComponent(nameQuery)}`);
        return response.data;
    } catch (error) {
        console.error("Airport Search failed:", error);
        throw error;
    }
};

/**
 * Fetch Fare Calendar (Lowest fare matrix by date)
 * POST /api/flights/fare-calendar
 */
export const getFareCalendar = async (payload) => {
    try {
        const response = await API.post('/flights/fare-calendar', payload);
        return response.data;
    } catch (error) {
        console.error("Fare Calendar fetch failed:", error);
        throw error;
    }
};
