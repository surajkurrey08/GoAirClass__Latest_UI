import React, { useState, useEffect } from 'react';
import {
    Star,
    MessageCircle,
    User,
    Bus,
    CornerDownRight,
    Send,
    Filter,
    Search,
    Flag,
    CheckCircle2
} from 'lucide-react';
import {
    fetchMyReviews,
    replyToReview
} from '../../services/auth';
import { toast } from 'react-toastify';

const ReviewList = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyText, setReplyText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);

    const getReviews = async () => {
        try {
            setLoading(true);
            const data = await fetchMyReviews();
            setReviews(data);
        } catch (error) {
            console.error("Fetch Reviews Error:", error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getReviews();
    }, []);

    const handleReply = async (id) => {
        if (!replyText[id]) return;
        try {
            await replyToReview(id, replyText[id]);
            toast.success("Reply sent successfully");
            setReplyText({ ...replyText, [id]: '' });
            getReviews();
        } catch (error) {
            toast.error(error.message);
        }
    };

    const renderStars = (rating) => (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={14}
                    className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}
                />
            ))}
        </div>
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">Reviews & Sentiment</h1>
                    <p className="text-slate-500 font-medium">Monitor your reputation and engage with passenger feedback.</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.length === 0 ? (
                        <div className="bg-white p-20 rounded-[32px] border-2 border-dashed border-slate-100 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                                <MessageCircle size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800">No reviews yet</h3>
                            <p className="text-slate-500 max-w-xs mt-2 font-medium">Passenger feedback will appear here once they complete their journeys.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review._id} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                <div className="flex flex-col md:flex-row gap-8">
                                    {/* Left: User & Bus Info */}
                                    <div className="md:w-1/4 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 font-black">
                                                {review.userId?.name?.[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-black text-slate-800">{review.userId?.name}</h4>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-slate-50 rounded-2xl">
                                            <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                <Bus size={14} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">Traveled via</span>
                                            </div>
                                            <p className="text-xs font-black text-slate-700">{review.busId?.busName}</p>
                                            <p className="text-[10px] text-slate-400 font-bold">{review.busId?.busNumber}</p>
                                        </div>
                                    </div>

                                    {/* Right: Review Content */}
                                    <div className="flex-grow space-y-6">
                                        <div className="space-y-3">
                                            {renderStars(review.rating)}
                                            <p className="text-slate-600 font-medium leading-relaxed italic">
                                                "{review.comment}"
                                            </p>
                                        </div>

                                        {/* Reply Section */}
                                        {review.reply ? (
                                            <div className="p-6 bg-blue-50/50 rounded-[24px] border border-blue-100 relative group">
                                                <div className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">
                                                    <CornerDownRight size={10} />
                                                    Operator Reply
                                                </div>
                                                <p className="text-sm text-blue-800 font-semibold leading-relaxed">
                                                    {review.reply}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex gap-3 items-end">
                                                <div className="flex-grow">
                                                    <textarea
                                                        placeholder="Write a professional reply..."
                                                        className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all"
                                                        value={replyText[review._id] || ''}
                                                        onChange={(e) => setReplyText({ ...replyText, [review._id]: e.target.value })}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleReply(review._id)}
                                                    disabled={!replyText[review._id]}
                                                    className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-slate-900 transition-all mb-1"
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Status / Flagging */}
                                    <div className="flex md:flex-col gap-2">
                                        <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Report">
                                            <Flag size={18} />
                                        </button>
                                        <div className="p-2 text-green-500 bg-green-50 rounded-xl flex items-center justify-center">
                                            <CheckCircle2 size={18} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ReviewList;
