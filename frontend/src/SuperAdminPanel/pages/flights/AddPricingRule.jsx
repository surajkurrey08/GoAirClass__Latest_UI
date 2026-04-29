import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Tag, Save, X, ArrowLeft, Globe, Plane, 
    Navigation, Percent, DollarSign, ShieldCheck,
    Calendar, Users, Info, ChevronRight
} from 'lucide-react';
import { addPricingRule, getAirlines, getFlightRoutes } from '../../../services/flightApi';
import { toast } from 'react-toastify';

const FormSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Icon size={20} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children}
            </div>
        </div>
    </div>
);

const InputField = ({ label, name, type = "text", placeholder, value, onChange, required, options }) => (
    <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {type === "select" ? (
            <select 
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold text-sm"
            >
                <option value="">Select Option</option>
                {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
        ) : (
            <input 
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold text-sm"
            />
        )}
    </div>
);

export default function AddPricingRule() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [airlines, setAirlines] = useState([]);
    const [routes, setRoutes] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        applyOn: 'Global',
        airline: '',
        route: '',
        markupType: 'Percentage',
        markupValue: 0,
        convenienceFee: 0,
        serviceFee: 0,
        gst: 18,
        minFare: 0,
        maxFare: 0,
        startDate: '',
        endDate: '',
        userType: 'B2C',
        status: true,
        priority: 0
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [airlineRes, routeRes] = await Promise.all([getAirlines(), getFlightRoutes()]);
                setAirlines(airlineRes.airlines.map(a => ({ label: a.name, value: a._id })));
                setRoutes(routeRes.routes.map(r => ({ label: r.routeCode, value: r.routeCode })));
            } catch (error) {
                toast.error('Failed to load dependency data');
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.markupValue) {
            toast.error('Please fill in required fields');
            return;
        }
        setLoading(true);
        try {
            // Clean data: don't send empty strings for ObjectIds
            const dataToSubmit = { ...formData };
            if (dataToSubmit.applyOn !== 'Airline' || !dataToSubmit.airline) {
                delete dataToSubmit.airline;
            }
            if (dataToSubmit.applyOn !== 'Route' || !dataToSubmit.route) {
                delete dataToSubmit.route;
            }

            await addPricingRule(dataToSubmit);
            toast.success('Pricing rule created successfully');
            navigate('/super-admin/flights/pricing');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to create rule');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <Link to="/super-admin/flights/pricing" className="hover:text-blue-600 transition-colors">Pricing Engine</Link>
                        <ChevronRight size={12} />
                        <span className="text-slate-900 dark:text-white">New Rule</span>
                    </div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Link to="/super-admin/flights/pricing" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        Add New Pricing Rule
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Creating...' : <><Save size={18} /> Save Rule</>}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="pb-12">
                <FormSection title="Rule Basic Info" icon={Tag}>
                    <InputField label="Rule Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Summer Special Markup" />
                    <InputField label="Description" name="description" value={formData.description} onChange={handleChange} placeholder="Brief details about this rule" />
                    <InputField label="Priority" name="priority" type="number" value={formData.priority} onChange={handleChange} placeholder="0 (Higher number = Higher priority)" />
                </FormSection>

                <FormSection title="Apply Configuration" icon={Globe}>
                    <InputField 
                        label="Apply On" 
                        name="applyOn" 
                        type="select" 
                        value={formData.applyOn} 
                        onChange={handleChange} 
                        options={[
                            { label: 'Global (All Flights)', value: 'Global' },
                            { label: 'Specific Airline', value: 'Airline' },
                            { label: 'Specific Route', value: 'Route' }
                        ]} 
                    />
                    {formData.applyOn === 'Airline' && (
                        <InputField label="Select Airline" name="airline" type="select" value={formData.airline} onChange={handleChange} options={airlines} required />
                    )}
                    {formData.applyOn === 'Route' && (
                        <InputField label="Select Route" name="route" type="select" value={formData.route} onChange={handleChange} options={routes} required />
                    )}
                    <InputField 
                        label="Target User Type" 
                        name="userType" 
                        type="select" 
                        value={formData.userType} 
                        onChange={handleChange} 
                        options={[
                            { label: 'B2C Customer', value: 'B2C' },
                            { label: 'Agent', value: 'Agent' },
                            { label: 'Sub-Admin', value: 'Admin' },
                            { label: 'Super Admin', value: 'SuperAdmin' }
                        ]} 
                    />
                </FormSection>

                <FormSection title="Markup & Fees" icon={DollarSign}>
                    <InputField 
                        label="Markup Type" 
                        name="markupType" 
                        type="select" 
                        value={formData.markupType} 
                        onChange={handleChange} 
                        options={[
                            { label: 'Percentage (%)', value: 'Percentage' },
                            { label: 'Fixed Amount (₹)', value: 'Fixed' }
                        ]} 
                    />
                    <InputField label="Markup Value" name="markupValue" type="number" value={formData.markupValue} onChange={handleChange} required />
                    <InputField label="GST (%)" name="gst" type="number" value={formData.gst} onChange={handleChange} />
                    <InputField label="Convenience Fee (₹)" name="convenienceFee" type="number" value={formData.convenienceFee} onChange={handleChange} />
                    <InputField label="Service Fee (₹)" name="serviceFee" type="number" value={formData.serviceFee} onChange={handleChange} />
                </FormSection>

                <FormSection title="Validity & Constraints" icon={Calendar}>
                    <InputField label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={handleChange} />
                    <InputField label="End Date" name="endDate" type="date" value={formData.endDate} onChange={handleChange} />
                    <InputField label="Min Base Fare" name="minFare" type="number" value={formData.minFare} onChange={handleChange} />
                    <InputField label="Max Base Fare" name="maxFare" type="number" value={formData.maxFare} onChange={handleChange} />
                    <div className="flex items-center gap-4 mt-8 px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                        <input 
                            type="checkbox" 
                            name="status" 
                            id="status"
                            checked={formData.status} 
                            onChange={handleChange}
                            className="w-5 h-5 rounded-lg accent-emerald-500"
                        />
                        <label htmlFor="status" className="text-sm font-bold text-emerald-700 dark:text-emerald-400 select-none cursor-pointer">
                            Activate this rule immediately
                        </label>
                    </div>
                </FormSection>
            </form>
        </div>
    );
}
