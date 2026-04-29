import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { sendRegistrationOtp, verifyRegistrationOtp } from '../services/auth';
import { User, Phone, Loader2, ArrowRight, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import "./Register.css";

export default function Register() {
  const [formData, setFormData] = useState({ name: '', mobileNumber: '', otp: '' });
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.name.trim()) return setError('Name is required');
    if (!formData.mobileNumber.trim()) return setError('Mobile number is required');
    if (formData.mobileNumber.length !== 10) return setError('Mobile number must be 10 digits');

    setLoading(true);
    setError('');

    try {
      const data = await sendRegistrationOtp(formData.name, formData.mobileNumber);
      if (data.otp) {
        toast.info(`Development OTP: ${data.otp}`, { autoClose: false });
      }
      setStep(2);
      toast.success('OTP sent successfully!');
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (formData.otp.length < 4) return setError('Enter a valid OTP');

    setLoading(true);
    setError('');

    try {
      const data = await verifyRegistrationOtp(formData.mobileNumber, formData.otp);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess(true);
        toast.success('Registration successful!');
        const from = location.state?.from || '/';
        const bookingData = location.state?.bookingData;
        setTimeout(() => navigate(from, { state: bookingData }), 2000);
      } else {
        toast.error('Token not received. Contact support.');
        setError('Token not received. Contact support.');
      }
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-white/20 backdrop-blur-sm">
        <div className="p-8">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-500">
              {step === 1 ? 'Join us for a seamless booking experience' : `Enter OTP sent to ${formData.mobileNumber}`}
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

          {success ? (
            <div className="flex flex-col items-center justify-center py-8 animate-fadeIn">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-xl font-semibold text-gray-800">Registration Successful!</h2>
              <p className="text-gray-500 mt-2 text-center">Redirecting you to dashboard...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg animate-shake">
                  {error}
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500">
                        <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                      </div>
                      <input
                        name="name"
                        type="text"
                        required
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 ml-1">Mobile Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                      </div>
                      <input
                        name="mobileNumber"
                        type="tel"
                        required
                        maxLength="10"
                        placeholder="9876543210"
                        value={formData.mobileNumber}
                        onChange={handleChange}
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
                        Send OTP
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
                        <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500" />
                      </div>
                      <input
                        name="otp"
                        type="text"
                        required
                        maxLength="6"
                        placeholder="123456"
                        value={formData.otp}
                        onChange={handleChange}
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
                      'Verify & Register'
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-full text-center text-gray-500 text-sm hover:text-blue-600 transition-colors"
                  >
                    Change name or mobile number
                  </button>
                </form>
              )}

              <p className="text-center text-gray-600 text-sm mt-8">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
