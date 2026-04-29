import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ChevronRight, Save, X, Globe, MapPin, 
    Settings, ShieldCheck, DollarSign, Percent, 
    ArrowLeft, Info, Activity, Database, Clock
} from 'lucide-react';
import { addAirport } from '../../../services/flightApi';
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

export default function AddAirport() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '', iataCode: '', icaoCode: '', city: '', country: 'India',
        latitude: '', longitude: '', timezone: 'UTC+5:30',
        status: true, showInSearch: true, isPopular: false, priority: 0,
        provider: 'Manual', providerCode: '',
        type: 'Domestic',
        airportTax: 0, udf: 0, serviceCharges: 0
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.iataCode || !formData.name || !formData.city) {
            toast.error('Please fill all required fields');
            return;
        }
        setLoading(true);
        try {
            const res = await addAirport(formData);
            if (res.success) {
                toast.success('Airport added successfully!');
                navigate('/super-admin/flights/airports');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add airport');
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
                        <Link to="/super-admin/flights/airports" className="hover:text-blue-600 transition-colors">Airports</Link>
                        <ChevronRight size={12} />
                        <span className="text-slate-900 dark:text-white">Add New Airport</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Link to="/super-admin/flights/airports" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                            <ArrowLeft size={20} />
                        </Link>
                        Add New Airport
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
                        {loading ? 'Saving...' : <><Save size={18} /> Save Airport</>}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="pb-12">
                <FormSection title="Basic Information" icon={Info}>
                    <InputField label="Airport Name" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Indira Gandhi International" />
                    <InputField label="IATA Code" name="iataCode" value={formData.iataCode} onChange={handleChange} required placeholder="e.g. DEL" />
                    <InputField label="ICAO Code" name="icaoCode" value={formData.icaoCode} onChange={handleChange} placeholder="e.g. VIDP" />
                    <InputField label="City" name="city" value={formData.city} onChange={handleChange} required placeholder="e.g. Delhi" />
                    <InputField label="Country" name="country" value={formData.country} onChange={handleChange} type="select" options={[
                        { label: 'India', value: 'India' },
                        { label: 'UAE', value: 'UAE' },
                        { label: 'Singapore', value: 'Singapore' },
                        { label: 'USA', value: 'USA' },
                    ]} />
                </FormSection>

                <FormSection title="Location Details" icon={MapPin}>
                    <InputField label="Latitude" name="latitude" value={formData.latitude} onChange={handleChange} type="number" placeholder="28.5562" />
                    <InputField label="Longitude" name="longitude" value={formData.longitude} onChange={handleChange} type="number" placeholder="77.1000" />
                    <InputField label="Timezone" name="timezone" value={formData.timezone} onChange={handleChange} type="select" options={[
                        { label: 'IST (UTC+5:30)', value: 'UTC+5:30' },
                        { label: 'GST (UTC+4:00)', value: 'UTC+4:00' },
                        { label: 'SGT (UTC+8:00)', value: 'UTC+8:00' },
                        { label: 'UTC', value: 'UTC+0:00' },
                    ]} />
                </FormSection>

                <FormSection title="Status & Control" icon={Settings}>
                    <InputField label="Priority" name="priority" value={formData.priority} onChange={handleChange} type="number" />
                    <ToggleField label="Active Status" name="status" checked={formData.status} onChange={handleChange} info="Enable/Disable airport globally" />
                    <ToggleField label="Show in Search" name="showInSearch" checked={formData.showInSearch} onChange={handleChange} info="Make airport visible in search results" />
                    <ToggleField label="Is Popular" name="isPopular" checked={formData.isPopular} onChange={handleChange} info="Show in popular airports list" />
                </FormSection>

                <FormSection title="Airport Type & API" icon={Globe}>
                    <InputField label="Airport Type" name="type" value={formData.type} onChange={handleChange} type="select" options={[
                        { label: 'Domestic', value: 'Domestic' },
                        { label: 'International', value: 'International' },
                        { label: 'Both', value: 'Both' },
                    ]} />
                    <InputField label="API Provider" name="provider" value={formData.provider} onChange={handleChange} type="select" options={[
                        { label: 'Manual', value: 'Manual' },
                        { label: 'Amadeus', value: 'Amadeus' },
                        { label: 'Sabre', value: 'Sabre' },
                    ]} />
                    <InputField label="Provider Code" name="providerCode" value={formData.providerCode} onChange={handleChange} placeholder="e.g. DEL" />
                </FormSection>

                <FormSection title="Charges & Fees" icon={DollarSign}>
                    <InputField label="Airport Tax" name="airportTax" value={formData.airportTax} onChange={handleChange} type="number" placeholder="0" />
                    <InputField label="UDF (User Dev Fee)" name="udf" value={formData.udf} onChange={handleChange} type="number" placeholder="0" />
                    <InputField label="Service Charges" name="serviceCharges" value={formData.serviceCharges} onChange={handleChange} type="number" placeholder="0" />
                </FormSection>
            </form>
        </div>
    );
}
