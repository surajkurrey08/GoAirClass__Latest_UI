import API from './axios';

/**
 * Hotel Booking & Location Search APIs
 */
export const searchHotelsByLocation = async (params) => {
    const response = await API.get('/hotels/search-by-location', { params });
    return response.data;
};

export const searchHotelsByIds = async (searchData) => {
    const response = await API.post('/hotels/search', searchData);
    return response.data;
};

export const getLocations = async (params) => {
    const response = await API.get('/hotels/locations', { params });
    return response.data;
};

export const getHotelRoomDetails = async (hotelId, params) => {
    const response = await API.get(`/hotels/details/${hotelId}`, { params });
    return response.data;
};

export const provisionalBookHotel = async (bookingData) => {
    const response = await API.post('/hotels/provisional-book', bookingData);
    return response.data;
};

export const confirmBookHotel = async (confirmData) => {
    const response = await API.post('/hotels/confirm-book', confirmData);
    return response.data;
};

export const getTripDetails = async (tripId) => {
    const response = await API.get(`/hotels/trip/${tripId}`);
    return response.data;
};

export const getHotelRefundInfo = async (tripId) => {
    const response = await API.get(`/hotels/refund-info/${tripId}`);
    return response.data;
};

export const getUserHotelBookings = async (page, limit) => {
    const url = page && limit ? `/hotels/my-bookings?page=${page}&limit=${limit}` : '/hotels/my-bookings';
    const response = await API.get(url);
    return response.data;
};

export const cancelHotelBooking = async (bookingId) => {
    const response = await API.post('/hotels/cancel-booking', { bookingId });
    return response.data;
};

export const getHotelProfiles = async (hotelIds) => {
    const response = await API.post('/hotels/batch-profiles', { hotelIds });
    return response.data;
};
