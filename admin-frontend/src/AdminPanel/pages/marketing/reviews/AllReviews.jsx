import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Star, User, ShieldCheck, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchAllTestimonials, deleteTestimonial } from '../../../../services/reviewService';
import { toast } from 'react-toastify';

export default function AllReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const data = await fetchAllTestimonials();
      setReviews(data);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteTestimonial(id);
        toast.success('Review deleted successfully');
        setReviews(reviews.filter(r => r._id !== id));
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customer Reviews</h1>
          <p className="text-gray-500">Manage homepage testimonials</p>
        </div>
        <Link
          to="/admin/marketing/reviews/add"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
        >
          <Plus size={18} /> Add New Review
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((review) => (
          <div key={review._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={review.image}
                    alt={review.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-blue-50"
                  />
                  <div>
                    <h3 className="font-bold text-gray-800">{review.name}</h3>
                    <p className="text-xs text-gray-500 font-medium">{review.role}</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${review.status ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {review.status ? 'Active' : 'Inactive'}
                </div>
              </div>

              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}
                  />
                ))}
              </div>

              <p className="text-gray-600 text-sm italic mb-6 line-clamp-3">
                "{review.reviewText}"
              </p>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-50">
                <Link
                  to={`/admin/marketing/reviews/edit/${review._id}`}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit2 size={16} />
                </Link>
                <button
                  onClick={() => handleDelete(review._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {reviews.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <User className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No reviews added yet.</p>
        </div>
      )}
    </div>
  );
}
