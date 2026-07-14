import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLoginStep1, adminVerifyOtp } from '../services/auth';
import { Mail, Lock, KeyRound, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Email + Password, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError('Email address is required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return setError('Enter a valid email address');
    if (!password) return setError('Password is required');

    setLoading(true);
    setError('');

    try {
      const data = await adminLoginStep1(email, password);
      if (data.otp) {
        toast.info(`Development OTP: ${data.otp}`, { autoClose: false });
      }
      setStep(2);
      toast.success('OTP sent to your email!');
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length < 6) return setError('Enter a valid 6-digit OTP');

    setLoading(true);
    setError('');

    try {
      const data = await adminVerifyOtp(email, otp);
      if (!data.token) {
        toast.error('Token not received. Contact support.');
        setError('Token not received. Contact support.');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success('Logged in successfully!');

      if (data.user.role === 'superadmin') {
        navigate('/super-admin');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-white/20 backdrop-blur-sm">
        <div className="p-8">
          <div className="text-center mb-8">
            <img src="/logo_new.jpg" alt="GoAirClass" className="w-14 h-14 rounded-2xl mx-auto mb-4 object-cover" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
            <p className="text-gray-500">
              {step === 1
                ? 'Sign in with your admin credentials'
                : `Enter OTP sent to ${email}`
              }
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step === 1 ? 'border-blue-600 bg-blue-50 text-blue-600 ring-4 ring-blue-100' : 'border-green-500 bg-green-50 text-green-500'}`}>
                {step === 1 ? '1' : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div className={`w-8 h-1 bg-gray-200 rounded transition-all ${step === 2 ? 'bg-blue-600' : ''}`} />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${step === 2 ? 'border-blue-600 bg-blue-50 text-blue-600 ring-4 ring-blue-100' : 'border-gray-200 text-gray-400'}`}>
                2
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg animate-shake">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="admin@goairclass.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError('');
                    }}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 group transform active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 ml-1">OTP</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-all">
                    <KeyRound className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      setError('');
                    }}
                    className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all tracking-[0.5em] font-mono text-center"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-green-500/30 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Verify & Log In'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-center text-gray-500 text-sm hover:text-blue-600 transition-colors"
              >
                Back to login
              </button>
            </form>
          )}

          <p className="text-center text-gray-400 text-xs mt-8">
            Authorized personnel only. Customer login is at{' '}
            <a href="https://goairclass.com/login" className="text-blue-600 font-semibold hover:underline">
              goairclass.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
