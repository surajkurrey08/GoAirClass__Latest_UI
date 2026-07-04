import API from './axios';

export const fetchInquiries = async () => {
  const response = await API.get('/inquiries');
  return response.data.inquiries;
};

export const updateInquiryStatus = async (id, status) => {
  const response = await API.put(`/inquiries/${id}/status`, { status });
  return response.data;
};

export const deleteInquiry = async (id) => {
  const response = await API.delete(`/inquiries/${id}`);
  return response.data;
};
