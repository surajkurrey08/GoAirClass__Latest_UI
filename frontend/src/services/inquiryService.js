import API from './axios';

export const submitInquiry = async ({ name, email, phone, subject, message }) => {
  try {
    const response = await API.post('/inquiries', { name, email, phone, subject, message });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to submit your inquiry. Please try again.';
    throw new Error(errorMessage);
  }
};
