
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

/**
 * Create Flight Booking Session on Cleartrip B2B API
 * POST /api/flights/session
 */
export const createFlightSession = async (searchId) => {
    try {
        const response = await API.post('/flights/session', { searchId });
        return response.data;
    } catch (error) {
        console.error("Create Flight Session failed:", error);
        throw error;
    }
};

/**
 * Execute Flight Preview on Cleartrip B2B API
 * POST /api/flights/preview
 */
export const previewFlightApi = async (sessionId, previewPayload) => {
    try {
        const response = await API.post('/flights/preview', {
            sessionId,
            ...previewPayload
        });
        return response.data;
    } catch (error) {
        console.error("Flight Preview failed:", error);
        throw error;
    }
};

/**
 * Fetch Ancillaries (Seats, Meals, Extra Baggage) on Cleartrip B2B API
 * POST /api/flights/fetch-ancillaries
 */
export const fetchAncillariesApi = async (sessionId, ancillaryPayload) => {
    try {
        const response = await API.post('/flights/fetch-ancillaries', {
            sessionId,
            ...ancillaryPayload
        });
        return response.data;
    } catch (error) {
        console.error("Fetch Ancillaries failed:", error);
        throw error;
    }
};

/**
 * Hold Flight Booking on Cleartrip B2B API
 * POST /api/flights/hold
 */
export const holdFlightApi = async (sessionId, holdPayload) => {
    try {
        const requestBody = {
            sessionId,
            ...holdPayload
        };

        // Pre-flight debugging
        console.log('[holdFlightApi] sessionId:', sessionId);
        console.log('[holdFlightApi] holdPayload keys:', Object.keys(holdPayload));

        // Test serialization before sending
        let serialized;
        try {
            serialized = JSON.stringify(requestBody);
            console.log('[holdFlightApi] Serialized payload size:', serialized.length, 'bytes');
        } catch (serErr) {
            console.error('[holdFlightApi] SERIALIZATION FAILED:', serErr.message);
            throw new Error('Failed to serialize hold payload: ' + serErr.message);
        }

        console.log('[holdFlightApi] Sending request to /flights/hold ...');
        const response = await API.post('/flights/hold', requestBody, {
            timeout: 90000, // 90 second timeout
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });
        console.log('[holdFlightApi] Response received:', response.status);
        return response.data;
    } catch (error) {
        console.error("[holdFlightApi] FAILED:", error);
        console.error("[holdFlightApi] error.code:", error.code);
        console.error("[holdFlightApi] error.message:", error.message);
        console.error("[holdFlightApi] error.response?.status:", error.response?.status);
        console.error("[holdFlightApi] error.response?.data:", error.response?.data);

        // Provide more helpful error messages
        if (error.code === 'ECONNABORTED') {
            error.message = 'Request timed out. The airline API is taking too long to respond. Please try again.';
        } else if (error.response?.data?.message) {
            error.message = error.response.data.message;
        } else if (!error.response) {
            error.message = 'Network Error: Could not reach the server. Please check your connection and try again.';
        }
        throw error;
    }
};

/**
 * Commit Flight Booking on Cleartrip B2B API
 * POST /api/flights/book
 */
export const bookFlightApi = async (sessionId, travelIds, additionalData = {}) => {
    try {
        console.log('[bookFlightApi] Committing booking for sessionId:', sessionId, 'travelIds:', travelIds);
        const response = await API.post('/flights/book', {
            sessionId,
            travelIds: Array.isArray(travelIds) ? travelIds : [travelIds],
            ...additionalData
        }, {
            timeout: 90000
        });
        return response.data;
    } catch (error) {
        console.error("Book Flight failed:", error);
        if (error.code === 'ECONNABORTED') {
            error.message = 'Request timed out. The airline API is taking too long to respond. Please try again.';
        } else if (error.response?.data?.message) {
            error.message = error.response.data.message;
        } else if (!error.response) {
            error.message = 'Network Error: Could not reach the server. Please check your connection and try again.';
        }
        throw error;
    }
};

/**
 * Fetch Bulk Benefits (Baggage rules & refund penalties) on Cleartrip B2B API
 * POST /api/flights/benefits/bulk
 */
export const fetchBulkBenefitsApi = async (payload) => {
    try {
        const response = await API.post('/flights/benefits/bulk', payload);
        return response.data;
    } catch (error) {
        console.error("Fetch Bulk Benefits failed:", error);
        throw error;
    }
};

/**
 * Fetch Standard Benefits (Baggage rules, cancellation charges for single option)
 * POST /api/flights/benefits
 */
export const fetchBenefitsApi = async (payload) => {
    try {
        const response = await API.post('/flights/benefits', payload);
        return response.data;
    } catch (error) {
        console.error("Fetch Standard Benefits failed:", error);
        throw error;
    }
};

/**
 * Fetch complete trip details by trip ID from Cleartrip B2B API
 * GET /api/flights/trip/:tripId
 */
export const fetchTripDetailsApi = async (tripId) => {
    try {
        const response = await API.get(`/flights/trip/${tripId}`);
        return response.data;
    } catch (error) {
        console.error(`Fetch Trip Details failed for tripId ${tripId}:`, error);
        throw error;
    }
};

/**
 * Fetch logged-in user's flight bookings
 * GET /api/flights/my-bookings
 */
export const getUserFlightBookings = async (page, limit) => {
    try {
        const url = page && limit ? `/flights/my-bookings?page=${page}&limit=${limit}` : '/flights/my-bookings';
        const response = await API.get(url);
        return response.data;
    } catch (error) {
        console.error("Fetch user flight bookings failed:", error);
        throw error;
    }
};

/**
 * Fetch logged-in user's flight trips
 * GET /api/flights/my-trips
 */
export const getMyFlightTrips = async () => {
    try {
        const response = await API.get('/flights/my-trips');
        return response.data;
    } catch (error) {
        console.error("Fetch my flight trips failed:", error);
        throw error;
    }
};

/**
 * Fetch cancellation reasons for a flight trip from Cleartrip
 * GET /api/flights/cancel-reasons/:tripId
 */
export const getFlightCancelReasonsApi = async (tripId) => {
    try {
        const response = await API.get(`/flights/cancel-reasons/${tripId}`);
        return response.data;
    } catch (error) {
        console.error(`Fetch flight cancel reasons failed for tripId ${tripId}:`, error);
        throw error;
    }
};

/**
 * Cancel a flight ticket
 * POST /api/flights/cancel
 */
export const cancelFlightBookingApi = async (bookingId, reasonCode, remarks = '') => {
    try {
        const response = await API.post(`/flights/cancel`, { bookingId, reasonCode, remarks });
        return response.data;
    } catch (error) {
        console.error("Cancel flight booking failed:", error);
        throw error;
    }
};

/**
 * Fetch cancellation refund details before cancelling
 * GET /api/flights/cancel-refund-info/:tripId/:reasonCode
 */
export const getFlightCancelRefundInfoApi = async (tripId, reasonCode, bookingInfoSequence = 1) => {
    try {
        const response = await API.get(`/flights/cancel-refund-info/${tripId}/${reasonCode}?bookingInfoSequence=${bookingInfoSequence}`);
        return response.data;
    } catch (error) {
        console.error(`Fetch flight cancel refund info failed:`, error);
        throw error;
    }
};

/**
 * Fetch refund details of an already cancelled flight trip
 * GET /api/flights/refund-info/:tripId
 */
export const getFlightRefundInfoApi = async (tripId) => {
    try {
        const response = await API.get(`/flights/refund-info/${tripId}`);
        return response.data;
    } catch (error) {
        console.error(`Fetch flight refund info failed for tripId ${tripId}:`, error);
        throw error;
    }
};



