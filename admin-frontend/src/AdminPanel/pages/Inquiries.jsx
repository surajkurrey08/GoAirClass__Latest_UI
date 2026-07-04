import React, { useState, useEffect } from 'react';
import { Mail, Phone, Trash2, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchInquiries, updateInquiryStatus, deleteInquiry } from '../../services/inquiryService';

const STATUS_STYLES = {
  new: 'bg-blue-50 text-blue-600',
  read: 'bg-yellow-50 text-yellow-600',
  resolved: 'bg-green-50 text-green-600',
};

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      const data = await fetchInquiries();
      setInquiries(data);
    } catch (error) {
      toast.error(error.message || 'Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateInquiryStatus(id, status);
      setInquiries(inquiries.map((i) => (i._id === id ? { ...i, status } : i)));
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry?')) return;
    try {
      await deleteInquiry(id);
      toast.success('Inquiry deleted');
      setInquiries(inquiries.filter((i) => i._id !== id));
    } catch (error) {
      toast.error(error.message || 'Failed to delete inquiry');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Inquiries</h1>
        <p className="text-gray-500">Messages submitted from the website contact form</p>
      </div>

      <div className="space-y-4">
        {inquiries.map((inquiry) => (
          <div key={inquiry._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-bold text-gray-800">{inquiry.name}</h3>
                {inquiry.subject && (
                  <p className="text-sm text-gray-500">{inquiry.subject}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={inquiry.status}
                  onChange={(e) => handleStatusChange(inquiry._id, e.target.value)}
                  className={`text-xs font-bold uppercase px-2 py-1 rounded border-0 ${STATUS_STYLES[inquiry.status]}`}
                >
                  <option value="new">New</option>
                  <option value="read">Read</option>
                  <option value="resolved">Resolved</option>
                </select>
                <button
                  onClick={() => handleDelete(inquiry._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4 flex items-start gap-2">
              <MessageSquare size={15} className="mt-0.5 shrink-0 text-gray-400" />
              {inquiry.message}
            </p>

            <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-3 border-t border-gray-50">
              <span className="flex items-center gap-1"><Mail size={13} /> {inquiry.email}</span>
              <span className="flex items-center gap-1"><Phone size={13} /> {inquiry.phone}</span>
              <span>{new Date(inquiry.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {inquiries.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No inquiries yet.</p>
        </div>
      )}
    </div>
  );
}
