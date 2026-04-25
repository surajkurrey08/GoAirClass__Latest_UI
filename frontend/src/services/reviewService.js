import API from './axios';

export const fetchAllTestimonials = async () => {
  try {
    const response = await API.get('/testimonials');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch testimonials');
  }
};

export const fetchTestimonialById = async (id) => {
  try {
    const response = await API.get(`/testimonials/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch testimonial');
  }
};

export const fetchPublicTestimonials = async () => {
  try {
    const response = await API.get('/testimonials/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public testimonials:', error);
    return [];
  }
};

export const createTestimonial = async (formData) => {
  try {
    const response = await API.post('/testimonials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create testimonial');
  }
};

export const updateTestimonial = async (id, formData) => {
  try {
    const response = await API.put(`/testimonials/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update testimonial');
  }
};

export const deleteTestimonial = async (id) => {
  try {
    const response = await API.delete(`/testimonials/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete testimonial');
  }
};
