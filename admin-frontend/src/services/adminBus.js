import API from './axios';

/**
 * BUS MANAGEMENT SERVICE
 */

export const fetchAllBuses = async (params = {}) => {
  try {
    const response = await API.get('/admin/buses', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch buses');
  }
};

export const fetchBusCount = async (params = {}) => {
  try {
    const response = await API.get('/admin/buses/count', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch count');
  }
};

export const createAdminBus = async (data) => {
  try {
    const response = await API.post('/admin/buses', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create bus');
  }
};

export const deleteAdminBus = async (id) => {
  try {
    const response = await API.delete(`/admin/buses/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete bus');
  }
};

export const updateBusStatus = async (id, action) => {
  try {
    const response = await API.patch(`/admin/buses/${id}/${action}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || `Failed to ${action} bus`);
  }
};

/**
 * OPERATOR MANAGEMENT SERVICE
 */

export const fetchAllOperators = async () => {
  try {
    const response = await API.get('/admin/operators');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch operators');
  }
};

export const fetchOperatorById = async (id) => {
  try {
    const response = await API.get(`/admin/operators/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch operator details');
  }
};

/**
 * BUS TYPES SERVICE
 */

export const fetchBusTypes = async () => {
  try {
    const response = await API.get('/admin/bus-types');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch bus types');
  }
};

export const createBusType = async (data) => {
  try {
    const response = await API.post('/admin/bus-types', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create bus type');
  }
};

export const deleteBusType = async (id) => {
  try {
    const response = await API.delete(`/admin/bus-types/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete bus type');
  }
};

/**
 * ROUTE NETWORK SERVICE (Super Admin)
 */

export const fetchGlobalRoutes = async (params = {}) => {
  try {
    const response = await API.get('/admin/routes', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch global routes');
  }
};

export const createGlobalRoute = async (data) => {
  try {
    const response = await API.post('/admin/routes', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create global route');
  }
};

export const updateGlobalRoute = async (id, data) => {
  try {
    const response = await API.put(`/admin/routes/${id}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update global route');
  }
};

export const deleteGlobalRoute = async (id) => {
  try {
    const response = await API.delete(`/admin/routes/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete global route');
  }
};

export const toggleRoutePopularity = async (id) => {
  try {
    const response = await API.patch(`/admin/routes/${id}/popular`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to toggle route popularity');
  }
};

/**
 * UTILITIES / COMMON SERVICE
 */

export const fetchGlobalCities = async () => {
    try {
        const response = await API.get('/cities');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch cities');
    }
};

/**
 * BOOKING CONTROL SERVICE (Super Admin)
 */

export const fetchAdminBookings = async (params = {}) => {
  try {
    const response = await API.get('/admin/bookings', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch bookings');
  }
};

export const fetchAdminHotelBookings = async () => {
  try {
    const response = await API.get('/admin/bookings/hotels');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch hotel bookings');
  }
};

export const fetchAdminTripDetails = async (tripId) => {
  try {
    const response = await API.get(`/hotels/trip/${tripId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch trip details');
  }
};

export const fetchBookingStats = async () => {
  try {
    const response = await API.get('/admin/bookings/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch booking stats');
  }
};

export const forceCancelAdminBooking = async (id, data) => {
  try {
    const response = await API.patch(`/admin/bookings/${id}/force-cancel`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to force cancel booking');
  }
};

export const cancelAdminBooking = async (id, data) => {
  try {
    const response = await API.patch(`/admin/bookings/${id}/force-cancel`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to cancel booking');
  }
};

export const fetchRefundLogs = async () => {
  try {
    const response = await API.get('/admin/bookings/refunds');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch refund logs');
  }
};

export const getCancelRequests = async () => {
  try {
    const response = await API.get('/admin/bookings/cancel-requests');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch cancel requests');
  }
};

export const approveCancel = async (id) => {
  try {
    const response = await API.post(`/admin/bookings/cancel/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve cancellation');
  }
};

export const rejectCancel = async (id) => {
  try {
    const response = await API.post(`/admin/bookings/reject-cancel/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to reject cancellation');
  }
};

export const initiateRefund = async (id) => {
  try {
    const response = await API.post(`/admin/bookings/refund/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to initiate refund');
  }
};

export const getOperatorBookings = async (operatorId) => {
  try {
    const response = await API.get(`/admin/bookings/operator/${operatorId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch operator bookings');
  }
};

export const fetchFraudAlerts = async () => {
  try {
    const response = await API.get('/admin/bookings/fraud-alerts');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch fraud alerts');
  }
};

export const processFraudAction = async (id, action) => {
  try {
    const response = await API.post(`/admin/bookings/fraud-alerts/${id}/action`, { action });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to process fraud action');
  }
};
