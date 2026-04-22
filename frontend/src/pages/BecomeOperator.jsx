import React, { useState } from 'react';
import { 
    Building2, Mail, Phone, User, 
    ChevronRight, CheckCircle2, Loader2,
    Bus as BusIcon, Hotel as HotelIcon,
    ArrowLeft, ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { submitOperatorRequest } from '../services/auth';

export default function BecomeOperator() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobileNumber: '',
        operatorType: 'bus', // Default
        documents: []
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await submitOperatorRequest(formData);
            if (res.success) {
                setSubmitted(true);
                toast.success(res.message);
            }
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
                <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl shadow-blue-500/10 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-green-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-green-500/20">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Request Submitted!</h2>
                    <p className="text-slate-500 font-medium leading-relaxed mb-10">
                        Our administrative team will review your application. Once approved, you'll receive a password setup link via email/SMS.
                    </p>
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                        Return Home <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-10">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors group"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Profile
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Info Side */}
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-5xl font-black text-slate-900 leading-tight">
                                Expand your <span className="text-blue-600">Business</span> with GoAirClass
                            </h1>
                            <p className="text-xl text-slate-500 mt-4 font-medium">
                                Join our network of elite operators and reach thousands of customers daily.
                            </p>
                        </div>

                        <div className="space-y-6">
                            {[
                                { title: 'Direct Management', desc: 'Control your inventory and bookings in real-time.', icon: ShieldCheck },
                                { title: 'Detailed Analytics', desc: 'Track your revenue and growth with visual charts.', icon: Building2 },
                                { title: 'Secure Onboarding', desc: 'Wait for admin approval and set your own secure password.', icon: CheckCircle2 },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                        <item.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                                        <p className="text-sm text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Side */}
                    <div className="bg-white p-8 rounded-[3rem] shadow-2xl shadow-blue-500/10 border border-slate-100 h-fit">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Choose Service Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, operatorType: 'bus'})}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                                            formData.operatorType === 'bus' 
                                            ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-600/10' 
                                            : 'border-slate-100 text-slate-400 grayscale hover:grayscale-0 hover:border-slate-200'
                                        }`}
                                    >
                                        <BusIcon size={32} />
                                        <span className="font-black text-xs uppercase tracking-widest">Bus Operator</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, operatorType: 'hotel'})}
                                        className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                                            formData.operatorType === 'hotel' 
                                            ? 'border-emerald-600 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-600/10' 
                                            : 'border-slate-100 text-slate-400 grayscale hover:grayscale-0 hover:border-slate-200'
                                        }`}
                                    >
                                        <HotelIcon size={32} />
                                        <span className="font-black text-xs uppercase tracking-widest">Hotel Operator</span>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <InputField 
                                    icon={User} 
                                    label="Full Name / Business Name" 
                                    placeholder="Enter your name"
                                    value={formData.fullName}
                                    onChange={(val) => setFormData({...formData, fullName: val})}
                                />
                                <InputField 
                                    icon={Mail} 
                                    label="Official Email" 
                                    placeholder="email@example.com"
                                    type="email"
                                    value={formData.email}
                                    onChange={(val) => setFormData({...formData, email: val})}
                                />
                                <InputField 
                                    icon={Phone} 
                                    label="Contact Number" 
                                    placeholder="+91 0000000000"
                                    value={formData.mobileNumber}
                                    onChange={(val) => setFormData({...formData, mobileNumber: val})}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50 active:scale-[0.98]"
                            >
                                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Submit Application"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

function InputField({ icon: Icon, label, placeholder, type = "text", value, onChange }) {
    return (
        <div className="space-y-2 group">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Icon size={18} className="text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input 
                    type={type}
                    required
                    placeholder={placeholder}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-100 focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-slate-700 outline-none placeholder:text-slate-300"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
        </div>
    );
}
