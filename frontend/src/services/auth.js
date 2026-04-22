import API from './axios';

/**
 * Register a new user
 * @param {string} name 
 * @param {string} mobileNumber 
 */
export const registerUser = async (name, mobileNumber) => {
  try {
    const response = await API.post('/users/register', { fullName: name, mobileNumber });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
    throw new Error(errorMessage);
  }
};

/**
 * Send OTP to a mobile number
 * @param {string} mobileNumber 
 */
export const sendOtp = async (mobileNumber) => {
  try {
    const response = await API.post('/auth/send-otp', { mobileNumber });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please check the mobile number.';
    throw new Error(errorMessage);
  }
};

/**
 * Verify OTP for a mobile number
 * @param {string} mobileNumber 
 * @param {string} otp 
 */
export const verifyOtp = async (mobileNumber, otp) => {
  try {
    const response = await API.post('/auth/verify-otp', { mobileNumber, otp });
    // Expecting response to contain the JWT token e.g., { token: '...' }
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Invalid OTP. Please try again.';
    throw new Error(errorMessage);
  }
};

/**
 * Send OTP for registration
 * @param {string} fullName 
 * @param {string} mobileNumber 
 * @param {string} captchaToken - Optional/Mock for development
 */
export const sendRegistrationOtp = async (fullName, mobileNumber, captchaToken = 'mock-token') => {
  try {
    const response = await API.post('/auth/send-registration-otp', { fullName, mobileNumber, captchaToken });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to send registration OTP.';
    throw new Error(errorMessage);
  }
};

/**
 * Verify OTP for registration
 * @param {string} mobileNumber 
 * @param {string} otp 
 */
export const verifyRegistrationOtp = async (mobileNumber, otp) => {
  try {
    const response = await API.post('/auth/verify-registration-otp', { mobileNumber, otp });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Registration verification failed.';
    throw new Error(errorMessage);
  }
};

/**
 * Submit a request to become an admin
 * @param {string} mobileNumber 
 * @param {string} fullName
 * @param {string} email
 */
export const submitAdminRequest = async (mobileNumber, fullName, email) => {
  try {
    const response = await API.post('/auth/admin-request', { mobileNumber, fullName, email });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to submit admin request.';
    throw new Error(errorMessage);
  }
};

/**
 * Get all admin requests (Super Admin only)
 */
export const fetchAdminRequests = async () => {
  try {
    const response = await API.get('/auth/admin-requests');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch admin requests.';
    throw new Error(errorMessage);
  }
};

/**
 * Update the status of an admin request (Approve/Reject)
 * @param {string} requestId 
 * @param {string} status 
 * @param {Array} permissions 
 */
export const updateAdminRequestStatus = async (requestId, status, permissions = ['dashboard', 'users', 'bookings']) => {
  try {
    const response = await API.put('/auth/update-request-status', { requestId, status, permissions });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || `Failed to ${status} the request.`;
    throw new Error(errorMessage);
  }
};

/**
 * Get all system administrators (Super Admin only)
 */
export const fetchAllAdmins = async () => {
  try {
    const response = await API.get('/auth/admins');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch administrator directory.';
    throw new Error(errorMessage);
  }
};

/**
 * Get dashboard statistical summary (Super Admin only)
 */
export const fetchDashboardStats = async () => {
  try {
    const response = await API.get('/auth/dashboard-stats');
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard statistics.';
    throw new Error(errorMessage);
  }
};

/**
 * Delete an administrator (Super Admin only)
 * @param {string} adminId 
 */
export const deleteAdmin = async (adminId) => {
  try {
    const response = await API.delete(`/auth/admin/${adminId}`);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to delete administrator.';
    throw new Error(errorMessage);
  }
};

/**
 * Fetch stats for the User Directory
 */
export const fetchDirectoryStats = async () => {
  try {
    const response = await API.get('/user-directory/stats');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch directory stats');
  }
};

/**
 * Fetch users by role for the User Directory
 */
export const fetchDirectoryUsers = async (role, search = '', status = '') => {
  try {
    const response = await API.get(`/user-directory/users?role=${role}&search=${search}&status=${status}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch directory users');
  }
};

/**
 * Fetch operators by type for the User Directory
 */
export const fetchDirectoryOperators = async (type, search = '', status = '') => {
  try {
    const response = await API.get(`/user-directory/operators?type=${type}&search=${search}&status=${status}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch directory operators');
  }
};

/**
 * Update status of a directory user/operator
 */
export const updateDirectoryStatus = async (id, type, status) => {
  try {
    const response = await API.put(`/user-directory/status/${id}`, { type, status });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update status');
  }
};

/**
 * Submit a request to become an operator (Bus/Hotel)
 */
export const submitOperatorRequest = async (data) => {
  try {
    const response = await API.post('/operator-mgmt/request', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to submit operator request');
  }
};

/**
 * Fetch all operator requests (Admin/Super Admin only)
 */
export const fetchOperatorRequests = async () => {
  try {
    const response = await API.get('/operator-mgmt/requests');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch operator requests');
  }
};

/**
 * Approve an operator request (Admin/Super Admin only)
 */
export const approveOperatorRequest = async (requestId) => {
  try {
    const response = await API.post('/operator-mgmt/approve', { requestId });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to approve request');
  }
};

/**
 * Manually create an operator (Admin/Super Admin only)
 */
export const manualCreateOperator = async (data) => {
  try {
    const response = await API.post('/operator-mgmt/manual-create', data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create operator');
  }
};

/**
 * Delete a directory record (Generic)
 */
export const deleteDirectoryRecord = async (id, type) => {
  try {
    const response = await API.delete(`/user-directory/delete/${id}/${type}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete record');
  }
};

/**
 * Update a directory record (Generic)
 */
export const updateDirectoryRecord = async (id, type, data) => {
  try {
    const response = await API.put(`/user-directory/update/${id}/${type}`, data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update record');
  }
};
/**
 * Toggle block status for a user/admin
 */
export const toggleUserBlock = async (id, isBlocked) => {
  try {
    const response = await API.put(`/user-directory/block/${id}`, { isBlocked });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update block status');
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

/**
 * NETWORK (ROUTES)
 */
export const fetchRoutes = async () => {
    try {
        const response = await API.get('/routes');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch routes');
    }
};

export const fetchRouteById = async (id) => {
    try {
        const response = await API.get(`/routes/${id}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch route details');
    }
};

export const createRoute = async (data) => {
    try {
        const response = await API.post('/routes/create', data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to create route');
    }
};

export const updateRoute = async (id, data) => {
    try {
        const response = await API.put(`/routes/${id}`, data);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to update route');
    }
};

export const deleteRoute = async (id) => {
    try {
        const response = await API.delete(`/routes/${id}`);
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
 * UTILITIES
 */
export const fetchCities = async () => {
    try {
        const response = await API.get('/cities');
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || 'Failed to fetch cities');
    }
};

/**
 * PUBLIC SEARCH
 */
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
