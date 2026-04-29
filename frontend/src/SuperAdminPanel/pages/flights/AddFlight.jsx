import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ChevronRight, Save, X, Plane, Clock, 
    Users, DollarSign, Briefcase, Settings, 
    ArrowLeft, Info, Calendar, Plus
} from 'lucide-react';
import { addFlightInventory, getAirlines, getFlightRoutes } from '../../../services/flightApi';
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

export default function AddFlight() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [airlines, setAirlines] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [formData, setFormData] = useState({
        flightNumber: '', airline: '', from: '', to: '', routeCode: '',
        aircraftType: 'Airbus A320', departureDate: '', departureTime: '', arrivalTime: '', duration: '',
        totalSeats: 180, availableSeats: 180,
        economySeats: 150, businessSeats: 30, firstClassSeats: 0,
        baseFare: 0, taxes: 0, fuelCharges: 0, finalPrice: 0,
        baggage: { cabin: '7kg', checkin: '15kg' },
        refundable: true, reschedulable: true, status: true
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [airlineRes, routeRes] = await Promise.all([getAirlines(), getFlightRoutes()]);
                setAirlines(airlineRes.airlines.map(a => ({ label: a.name, value: a._id })));
                setRoutes(routeRes.routes.map(r => ({ label: r.routeCode, value: r.routeCode, from: r.from, to: r.to })));
            } catch (error) {
                toast.error('Failed to load dependencies');
            }
        };
        fetchData();
    }, []);

    // Auto-calculate final price
    useEffect(() => {
        const final = Number(formData.baseFare) + Number(formData.taxes) + Number(formData.fuelCharges);
        setFormData(prev => ({ ...prev, finalPrice: final }));
    }, [formData.baseFare, formData.taxes, formData.fuelCharges]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'routeCode') {
            const route = routes.find(r => r.value === value);
            setFormData(prev => ({ 
                ...prev, 
                routeCode: value,
                from: route ? route.from : '',
                to: route ? route.to : ''
            }));
        } else if (name.startsWith('baggage.')) {
            const field = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                baggage: { ...prev.baggage, [field]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.flightNumber || !formData.airline || !formData.routeCode) {
            toast.error('Missing required flight info');
            return;
        }
        setLoading(true);
        try {
            await addFlightInventory(formData);
            toast.success('Flight added to inventory');
            navigate('/super-admin/flights/inventory');
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add flight');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <Link to="/super-admin/flights" className="hover:text-blue-600">Flights</Link>
                        <ChevronRight size={12} />
                        <Link to="/super-admin/flights/inventory" className="hover:text-blue-600">Inventory</Link>
                        <ChevronRight size={12} />
                        <span className="text-slate-900 dark:text-white">Add Flight</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Link to="/super-admin/flights/inventory" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <ArrowLeft size={20} />
                        </Link>
                        Add New Flight Schedule
                    </h1>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold">Cancel</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={loading}
                        className="px-8 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {loading ? 'Saving...' : <><Save size={18} /> Save Flight</>}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="pb-12">
                <FormSection title="Flight Basic Info" icon={Plane}>
                    <InputField label="Flight Number" name="flightNumber" value={formData.flightNumber} onChange={handleChange} required placeholder="e.g. 6E-202" />
                    <InputField label="Airline" name="airline" value={formData.airline} onChange={handleChange} type="select" options={airlines} required />
                    <InputField label="Route" name="routeCode" value={formData.routeCode} onChange={handleChange} type="select" options={routes} required />
                    <InputField label="Aircraft Type" name="aircraftType" value={formData.aircraftType} onChange={handleChange} placeholder="e.g. Airbus A320" />
                </FormSection>

                <FormSection title="Schedule Details" icon={Clock}>
                    <InputField label="Departure Date" name="departureDate" value={formData.departureDate} onChange={handleChange} type="date" required />
                    <InputField label="Departure Time" name="departureTime" value={formData.departureTime} onChange={handleChange} type="time" required />
                    <InputField label="Arrival Time" name="arrivalTime" value={formData.arrivalTime} onChange={handleChange} type="time" required />
                    <InputField label="Duration" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 02h 15m" />
                </FormSection>

                <FormSection title="Seat Configuration" icon={Users}>
                    <InputField label="Total Seats" name="totalSeats" value={formData.totalSeats} onChange={handleChange} type="number" />
                    <InputField label="Economy Class" name="economySeats" value={formData.economySeats} onChange={handleChange} type="number" />
                    <InputField label="Business Class" name="businessSeats" value={formData.businessSeats} onChange={handleChange} type="number" />
                </FormSection>

                <FormSection title="Pricing (INR)" icon={DollarSign}>
                    <InputField label="Base Fare" name="baseFare" value={formData.baseFare} onChange={handleChange} type="number" />
                    <InputField label="Taxes" name="taxes" value={formData.taxes} onChange={handleChange} type="number" />
                    <InputField label="Fuel Charges" name="fuelCharges" value={formData.fuelCharges} onChange={handleChange} type="number" />
                    <InputField label="Final Price" name="finalPrice" value={formData.finalPrice} disabled type="number" />
                </FormSection>

                <FormSection title="Baggage Info" icon={Briefcase}>
                    <InputField label="Cabin Baggage" name="baggage.cabin" value={formData.baggage.cabin} onChange={handleChange} />
                    <InputField label="Check-in Baggage" name="baggage.checkin" value={formData.baggage.checkin} onChange={handleChange} />
                </FormSection>

                <FormSection title="Status & Policies" icon={Settings}>
                    <ToggleField label="Active" name="status" checked={formData.status} onChange={handleChange} />
                    <ToggleField label="Refundable" name="refundable" checked={formData.refundable} onChange={handleChange} />
                    <ToggleField label="Reschedulable" name="reschedulable" checked={formData.reschedulable} onChange={handleChange} />
                </FormSection>
            </form>
        </div>
    );
}
