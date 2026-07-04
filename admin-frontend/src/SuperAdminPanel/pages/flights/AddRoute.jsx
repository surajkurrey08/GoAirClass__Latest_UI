import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ChevronRight, Save, X, Navigation, 
    ArrowRight, Clock, MapPin, Edit2, 
    Settings, ShieldCheck, DollarSign, 
    ArrowLeft, Info, Activity, Database
} from 'lucide-react';
import { addFlightRoute, getAirports } from '../../../services/flightApi';
import { toast } from 'react-toastify';

const FormSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Icon size={18} />
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold text-sm"
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
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all font-semibold text-sm"
            />
        )}
    </div>
);

const ToggleField = ({ label, name, checked, onChange, info }) => (
    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
        <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{label}</p>
            {info && <p className="text-[10px] text-slate-500">{info}</p>}
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
            <input 
                type="checkbox" 
                checked={checked}
                onChange={(e) => onChange({ target: { name, value: e.target.checked } })}
                className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
    </div>
);

export default function AddRoute() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [airports, setAirports] = useState([]);
    const [formData, setFormData] = useState({
        from: '', to: '', fromCity: '', toCity: '',
        distance: 0, duration: '',
        status: true, isPopular: false, priority: 0
    });

    useEffect(() => {
        const fetchAirports = async () => {
            try {
                const data = await getAirports();
                setAirports(data.airports.map(a => ({ label: `${a.iataCode} - ${a.city}`, value: a.iataCode, city: a.city })));
            } catch (error) {
                toast.error('Failed to load airports');
            }
        };
        fetchAirports();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'from' || name === 'to') {
            const airport = airports.find(a => a.value === value);
            const cityField = name === 'from' ? 'fromCity' : 'toCity';
            setFormData(prev => ({ 
                ...prev, 
                [name]: value,
                [cityField]: airport ? airport.city : '' 
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.from || !formData.to) {
            toast.error('Please select both Origin and Destination');
            return;
        }
        if (formData.from === formData.to) {
            toast.error('Origin and Destination cannot be the same');
            return;
        }

        setLoading(true);
        try {
            const res = await addFlightRoute(formData);
            if (res.success) {
                toast.success('Route added successfully!');
                navigate('/super-admin/flights/routes');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add route');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header & Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <Link to="/super-admin/flights" className="hover:text-blue-600 transition-colors">Flights</Link>
                        <ChevronRight size={12} />
                        <Link to="/super-admin/flights/routes" className="hover:text-blue-600 transition-colors">Routes</Link>
                        <ChevronRight size={12} />
                        <span className="text-slate-900 dark:text-white">Add New Route</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Link to="/super-admin/flights/routes" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        Add New Route
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button 
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : <><Save size={18} /> Save Route</>}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="pb-12">
                <FormSection title="Route Connection" icon={Navigation}>
                    <InputField 
                        label="From Airport" 
                        name="from" 
                        value={formData.from} 
                        onChange={handleChange} 
                        type="select" 
                        options={airports} 
                        required 
                    />
                    <div className="hidden lg:flex items-center justify-center pt-8">
                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400">
                            <ArrowRight size={20} />
                        </div>
                    </div>
                    <InputField 
                        label="To Airport" 
                        name="to" 
                        value={formData.to} 
                        onChange={handleChange} 
                        type="select" 
                        options={airports} 
                        required 
                    />
                    
                    <InputField label="Distance (km)" name="distance" value={formData.distance} onChange={handleChange} type="number" placeholder="e.g. 1150" />
                    <InputField label="Duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 02:15" />
                    <InputField label="Route Code" name="routeCode" value={`${formData.from}-${formData.to}`} onChange={() => {}} disabled placeholder="Auto-generated" />
                </FormSection>

                <FormSection title="Status & Control" icon={Settings}>
                    <InputField label="Priority" name="priority" value={formData.priority} onChange={handleChange} type="number" />
                    <ToggleField label="Active Status" name="status" checked={formData.status} onChange={handleChange} info="Enable/Disable this route" />
                    <ToggleField label="Is Popular" name="isPopular" checked={formData.isPopular} onChange={handleChange} info="Highlight as a popular route" />
                </FormSection>
            </form>
        </div>
    );
}
