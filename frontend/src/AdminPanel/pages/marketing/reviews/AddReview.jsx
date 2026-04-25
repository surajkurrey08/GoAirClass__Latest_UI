import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Star, Upload, Trash2 } from 'lucide-react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createTestimonial, updateTestimonial, fetchTestimonialById } from '../../../../services/reviewService';
import { toast } from 'react-toastify';

export default function AddReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    rating: 5,
    reviewText: '',
    status: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (id) {
      setFetching(true);
      loadReview();
    }
  }, [id]);

  const loadReview = async () => {
    try {
      const data = await fetchTestimonialById(id);
      if (data) {
        setFormData({
          name: data.name,
          role: data.role,
          rating: data.rating,
          reviewText: data.reviewText,
          status: data.status
        });
        setImagePreview(data.image);
      }
    } catch (error) {
      toast.error('Failed to load review');
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('name', formData.name);
    data.append('role', formData.role);
    data.append('rating', formData.rating);
    data.append('reviewText', formData.reviewText);
    data.append('status', formData.status);
    if (imageFile) {
      data.append('image', imageFile);
    }

    try {
      if (id) {
        await updateTestimonial(id, data);
        toast.success('Review updated successfully!');
      } else {
        if (!imageFile) {
          toast.error('Please upload a profile image');
          setLoading(false);
          return;
        }
        await createTestimonial(data);
        toast.success('Review added successfully!');
      }
      navigate('/admin/marketing/reviews');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/marketing/reviews" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{id ? 'Edit Review' : 'Add New Review'}</h1>
          <p className="text-gray-500">Create a customer testimonial for the homepage</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role / Title</label>
              <input
                type="text"
                name="role"
                required
                value={formData.role}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="e.g. Travel Blogger"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg w-fit">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: num })}
                    className="p-1 transition"
                  >
                    <Star
                      size={24}
                      className={num <= formData.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <label className="relative inline-flex items-center cursor-pointer mt-2">
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-700">{formData.status ? 'Active (Shows on Homepage)' : 'Inactive'}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Review Content</label>
            <textarea
              name="reviewText"
              required
              rows="4"
              value={formData.reviewText}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="What did the customer say about us?"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Image</label>
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 relative group">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={24} className="text-gray-300" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500 mb-1">Upload a clear square photo of the customer.</p>
                <p className="text-xs text-gray-400">Recommended size: 200x200px. JPG, PNG or WebP.</p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-50 flex justify-end gap-3">
            <Link
              to="/admin/marketing/reviews"
              className="px-6 py-2 border border-gray-200 rounded-lg text-gray-600 font-semibold hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-bold transition disabled:opacity-50 shadow-lg shadow-blue-100"
            >
              {loading ? 'Saving...' : <><Save size={18} /> Save Review</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
