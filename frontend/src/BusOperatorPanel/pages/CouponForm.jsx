import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { 
    Tag, 
    Type, 
    Percent, 
    IndianRupee, 
    Route, 
    Bus, 
    Calendar, 
    Lock, 
    User, 
    Infinity, 
    Activity, 
    Save, 
    X, 
    Sparkles,
    ChevronLeft,
    CheckCircle2,
    Info,
    ArrowUpRight,
    Clock
} from 'lucide-react';
import { 
    createCoupon, 
    fetchMyBuses, 
    fetchRoutes 
} from '../../services/auth';
import { toast } from 'react-toastify';

const CouponForm = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [routes, setRoutes] = useState([]);
    const [buses, setBuses] = useState([]);
    
    // Form State
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minBookingAmount: '',
        applyToAllRoutes: true,
        applicableRoutes: [],
        applyToAllBuses: true,
        applicableBuses: [],
        totalUsageLimit: '',
        perUserLimit: 1,
        validFrom: new Date().toISOString().split('T')[0],
        validTill: '',
        status: 'Active'
    });

    // Validation State
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [routesData, busesData] = await Promise.all([
                    fetchRoutes(),
                    fetchMyBuses()
                ]);
                
                setRoutes(routesData.map(r => ({
                    value: r._id,
                    label: `${r.fromCity} → ${r.toCity}`
                })));
                
                setBuses(busesData.map(b => ({
                    value: b._id,
                    label: `${b.busName} (${b.busNumber})`
                })));
            } catch (error) {
                toast.error("Failed to load targeting data");
            }
        };
        loadInitialData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const autoGenerateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = 'GOAIR';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setFormData(prev => ({ ...prev, code: result }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.code) newErrors.code = "Coupon code is required";
        if (!formData.discountValue) newErrors.discountValue = "Discount value is required";
        if (!formData.validTill) newErrors.validTill = "Expiry date is required";
        if (formData.discountType === 'percentage' && (formData.discountValue > 100 || formData.discountValue <= 0)) {
            newErrors.discountValue = "Percentage must be between 1 and 100";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) {
            toast.error("Please fix errors before saving");
            return;
        }

        try {
            setLoading(true);
            // Prepare data for backend
            const payload = {
                ...formData,
                code: formData.code.toUpperCase(),
                applicableRoutes: formData.applyToAllRoutes ? [] : formData.applicableRoutes.map(r => r.value),
                applicableBuses: formData.applyToAllBuses ? [] : formData.applicableBuses.map(b => b.value),
                role: 'operator' // Explicitly set as operator deal
            };

            await createCoupon(payload);
            toast.success("Coupon created successfully!");
            navigate('/bus-operator/coupons');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const SelectStyles = {
        control: (provided, state) => ({
            ...provided,
            borderRadius: '20px',
            padding: '4px',
            border: state.isFocused ? '2px solid #3b82f6' : '2px solid #f1f5f9',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#e2e8f0'
            }
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: '#eff6ff',
            borderRadius: '10px',
            color: '#1d4ed8'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: '#1d4ed8',
            fontWeight: 'bold'
        })
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-8">
                    <div>
                        <button 
                            onClick={() => navigate('/bus-operator/coupons')}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-semibold mb-2 transition-colors"
                        >
                            <ChevronLeft size={18} />
                            Back to Coupons
                        </button>
                        <h1 className="text-3xl font-bold text-slate-900">Create New Coupon</h1>
                        <p className="text-slate-500 text-sm mt-1">Fill in the details below to create a new promotional offer.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate('/bus-operator/coupons')}
                            className="px-6 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save size={18} />
                            )}
                            Save Coupon
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* SECTION 1: COUPON DETAILS */}
                    <div className="p-8 border-b border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <Tag className="text-blue-600" size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Coupon Details</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Coupon Code</label>
                                <div className="relative">
                                    <input 
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        placeholder="E.g. SAVE50"
                                        className={`w-full pl-4 pr-24 py-2.5 bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.code ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500'}`}
                                    />
                                    <button 
                                        type="button"
                                        onClick={autoGenerateCode}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-white text-blue-600 text-xs font-bold border border-blue-100 rounded-lg hover:bg-blue-50 transition-all flex items-center gap-1.5"
                                    >
                                        <Sparkles size={12} />
                                        Generate
                                    </button>
                                </div>
                                {errors.code && <p className="text-red-500 text-xs font-medium ml-1">{errors.code}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Discount Type</label>
                                <div className="flex p-1 bg-slate-100 rounded-xl">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, discountType: 'percentage'})}
                                        className={`flex-1 py-1.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${formData.discountType === 'percentage' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <Percent size={14} />
                                        Percentage
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, discountType: 'flat'})}
                                        className={`flex-1 py-1.5 px-4 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2 ${formData.discountType === 'flat' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        <IndianRupee size={14} />
                                        Flat Amount
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Discount Value</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        {formData.discountType === 'percentage' ? <Percent size={16} /> : <IndianRupee size={16} />}
                                    </div>
                                    <input 
                                        type="number"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleChange}
                                        placeholder="0"
                                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.discountValue ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500'}`}
                                    />
                                </div>
                                {errors.discountValue && <p className="text-red-500 text-xs font-medium ml-1">{errors.discountValue}</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Min. Booking Amount</label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                        <IndianRupee size={16} />
                                    </div>
                                    <input 
                                        type="number"
                                        name="minBookingAmount"
                                        value={formData.minBookingAmount}
                                        onChange={handleChange}
                                        placeholder="E.g. 500"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-700">Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Short description of the offer..."
                                    rows="3"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: TARGETING */}
                    <div className="p-8 border-b border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <Route className="text-emerald-600" size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Targeting</h2>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-700">Applicable Routes</label>
                                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                        <button 
                                            onClick={() => setFormData({...formData, applyToAllRoutes: true})}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${formData.applyToAllRoutes ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                        >All Routes</button>
                                        <button 
                                            onClick={() => setFormData({...formData, applyToAllRoutes: false})}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!formData.applyToAllRoutes ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                                        >Specific</button>
                                    </div>
                                </div>
                                {!formData.applyToAllRoutes && (
                                    <Select 
                                        isMulti
                                        options={routes}
                                        value={formData.applicableRoutes}
                                        onChange={(selected) => setFormData({...formData, applicableRoutes: selected})}
                                        styles={SelectStyles}
                                        placeholder="Select routes..."
                                    />
                                )}
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-semibold text-slate-700">Applicable Buses</label>
                                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                        <button 
                                            onClick={() => setFormData({...formData, applyToAllBuses: true})}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${formData.applyToAllBuses ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                                        >All Buses</button>
                                        <button 
                                            onClick={() => setFormData({...formData, applyToAllBuses: false})}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${!formData.applyToAllBuses ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                                        >Specific</button>
                                    </div>
                                </div>
                                {!formData.applyToAllBuses && (
                                    <Select 
                                        isMulti
                                        options={buses}
                                        value={formData.applicableBuses}
                                        onChange={(selected) => setFormData({...formData, applicableBuses: selected})}
                                        styles={SelectStyles}
                                        placeholder="Select buses..."
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: LIMITS & VALIDITY */}
                    <div className="p-8 border-b border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <Clock className="text-purple-600" size={20} />
                            <h2 className="text-lg font-bold text-slate-900">Limits & Validity</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Total Usage Limit</label>
                                <input 
                                    type="number"
                                    name="totalUsageLimit"
                                    value={formData.totalUsageLimit}
                                    onChange={handleChange}
                                    placeholder="E.g. 100"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Usage Per User</label>
                                <input 
                                    type="number"
                                    name="perUserLimit"
                                    value={formData.perUserLimit}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Valid From</label>
                                <input 
                                    type="date"
                                    name="validFrom"
                                    value={formData.validFrom}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Valid Till</label>
                                <input 
                                    type="date"
                                    name="validTill"
                                    value={formData.validTill}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${errors.validTill ? 'border-red-500 bg-red-50' : 'border-slate-200 focus:border-blue-500'}`}
                                />
                                {errors.validTill && <p className="text-red-500 text-xs font-medium ml-1">{errors.validTill}</p>}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: STATUS */}
                    <div className="p-8 bg-slate-50/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Activity className={formData.status === 'Active' ? 'text-green-600' : 'text-slate-400'} size={20} />
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Coupon Status</h2>
                                <p className="text-xs text-slate-500">Currently set to {formData.status.toLowerCase()}</p>
                            </div>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.status === 'Active' ? 'bg-green-600' : 'bg-slate-300'}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.status === 'Active' ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? 'Initializing...' : 'Create Coupon Now'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CouponForm;
