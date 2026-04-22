import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
    Shield, Lock, Eye, EyeOff, Loader2,
    CheckCircle2, XCircle, ArrowRight, User,
    Bus as BusIcon, Hotel as HotelIcon
} from 'lucide-react';
import { toast } from 'react-toastify';
import API from '../services/axios';

export default function SetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const [verifying, setVerifying] = useState(true);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState('admin');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: ''
    });

    const [requirements, setRequirements] = useState({
        length: false,
        number: false,
        special: false,
        match: false
    });

    useEffect(() => {
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            setVerifying(true);
            setError(null);
            const res = await API.get(`/auth/verify-activation/${token}`);
            if (res.data.success) {
                setRole(res.data.role);
            }
        } catch (err) {
            console.error("Token Verification Error:", err);
            setError(err.response?.data?.message || 'Verification failed. Please check if the link is valid or the server is running.');
        } finally {
            setVerifying(false);
        }
    };

    const validate = (value, name) => {
        const newData = { ...formData, [name]: value };
        setFormData(newData);

        if (name === 'password' || name === 'confirmPassword') {
            const pass = newData.password;
            setRequirements({
                length: pass.length >= 8,
                number: /\d/.test(pass),
                special: /[!@#$%^&*]/.test(pass),
                match: pass === newData.confirmPassword && pass !== ''
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!requirements.length || !requirements.number || !requirements.special || !requirements.match) {
            toast.error('Please meet all password requirements');
            return;
        }

        setLoading(true);
        try {
            const response = await API.post('/auth/set-admin-password', {
                token,
                username: formData.username,
                password: formData.password
            });

            if (response.data.success) {
                toast.success(`${role.replace('_', ' ').toUpperCase()} account activated! Please login.`);
                navigate('/login');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to set password');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Verifying Token...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200 text-center border border-slate-100">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <XCircle size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Access Denied</h2>
                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                        {error}
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                    >
                        Try Again
                    </button>
                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full mt-4 py-2 text-slate-400 font-bold hover:text-slate-600 transition-all text-sm uppercase tracking-widest"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    const getRoleInfo = () => {
        if (role.includes('bus')) return { title: 'Bus Operator Activation', icon: <BusIcon size={32} />, color: 'bg-amber-600' };
        if (role.includes('hotel')) return { title: 'Hotel Operator Activation', icon: <HotelIcon size={32} />, color: 'bg-emerald-600' };
        return { title: 'Admin Activation', icon: <Shield size={32} />, color: 'bg-blue-600' };
    };

    const info = getRoleInfo();

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-inter relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40 animate-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-40 animate-pulse" />

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/70 backdrop-blur-2xl p-8 rounded-[2.5rem] shadow-2xl shadow-blue-500/10 border border-white">

                    <div className="text-center mb-8">
                        <div className={`w-16 h-16 ${info.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-xl shadow-opacity-20`}>
                            {info.icon}
                        </div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{info.title}</h1>
                        <p className="text-slate-400 mt-2 font-medium">Set your secure password to access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Username Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Username / ID</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={18} className="text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. operator_name"
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                                    value={formData.username}
                                    onChange={(e) => validate(e.target.value, 'username')}
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                                    value={formData.password}
                                    onChange={(e) => validate(e.target.value, 'password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all font-semibold"
                                    value={formData.confirmPassword}
                                    onChange={(e) => validate(e.target.value, 'confirmPassword')}
                                />
                            </div>
                        </div>

                        {/* Requirements Checklist */}
                        <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                            <RequirementItem met={requirements.length} label="At least 8 characters" />
                            <RequirementItem met={requirements.number} label="Includes a number" />
                            <RequirementItem met={requirements.special} label="Includes special character" />
                            <RequirementItem met={requirements.match} label="Passwords match" />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 ${info.color} hover:opacity-90 text-white rounded-2xl font-bold transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2`}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    Activate Account <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

function RequirementItem({ met, label }) {
    return (
        <div className="flex items-center gap-2">
            {met ? (
                <CheckCircle2 size={14} className="text-green-500" />
            ) : (
                <XCircle size={14} className="text-slate-300" />
            )}
            <span className={`text-[11px] font-bold uppercase tracking-wider ${met ? 'text-green-600' : 'text-slate-400'}`}>
                {label}
            </span>
        </div>
    );
}
