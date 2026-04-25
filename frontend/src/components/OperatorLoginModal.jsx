import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, Loader2, Bus } from 'lucide-react';
import { loginOperator } from '../services/operatorService';
import { toast } from 'react-toastify';

export default function OperatorLoginModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await loginOperator(formData.email, formData.password);
      
      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.operator)); // Fix: Store as 'user' object for ProtectedRoute
        localStorage.setItem('role', response.operator.role);
        localStorage.setItem('userName', response.operator.name);
        
        toast.success(`Welcome back, ${response.operator.name}!`);
        onClose();
        
        // Redirect to operator dashboard
        navigate('/bus-operator/dashboard');
        // Refresh to update Navbar state
        window.location.reload();
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md overflow-hidden bg-white shadow-2xl rounded-2xl animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="h-2 bg-blue-600" />
        
        <button 
          onClick={onClose}
          className="absolute p-2 transition-colors rounded-full top-4 right-4 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600">
              <Bus size={32} />
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800">Operator Login</h2>
            <p className="mt-2 text-slate-500">Manage your fleet and bookings</p>
          </div>

          {error && (
            <div className="p-3 mb-6 text-sm text-red-600 rounded-lg bg-red-50 animate-shake">
              <p className="flex items-center gap-2">
                <span className="font-bold">Error:</span> {error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
                <input 
                  type="email"
                  required
                  className="w-full py-2.5 pl-10 pr-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="operator@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute -translate-y-1/2 left-3 top-1/2 text-slate-400" size={18} />
                <input 
                  type="password"
                  required
                  className="w-full py-2.5 pl-10 pr-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" className="w-4 h-4 text-blue-600 rounded border-slate-300" />
                Remember me
              </label>
              <a href="#" className="font-semibold text-blue-600 hover:text-blue-700">Forgot password?</a>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-4 font-bold text-white transition-all bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-200"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Logging in...
                </>
              ) : (
                'Login to Dashboard'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-slate-500 text-sm">
            Not an operator? {' '}
            <button 
              onClick={() => { onClose(); navigate('/register'); }}
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Register your business
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
