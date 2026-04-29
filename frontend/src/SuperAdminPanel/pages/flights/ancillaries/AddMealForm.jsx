
import React, { useState, useEffect } from 'react';
import { 
    X, Coffee, Upload, Globe, Users, Clock, Info, ShieldCheck, ArrowLeft, Save, Check
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    addMealMaster, updateMealMaster, getMealMaster,
    getAirlines, getAirports 
} from '../../../../services/flightApi';
import { toast } from 'react-toastify';

const AddMealForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [airlines, setAirlines] = useState([]);
    const [activeSection, setActiveSection] = useState('basic');

    const initialFormData = {
        mealCode: '',
        name: '',
        description: '',
        type: 'Veg',
        basePrice: '',
        currency: 'INR',
        taxIncluded: true,
        convenienceFee: 0,
        applicableAirlines: [],
        tripType: 'Both',
        sourceAirports: [],
        destinationAirports: [],
        applicableFor: ['Adult', 'Child'],
        availabilityType: 'Pre-book',
        cutoffTime: 24,
        externalMealCode: '',
        supplier: '',
        status: true,
        priority: 0
    };

    const [formData, setFormData] = useState(initialFormData);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [airlinesRes] = await Promise.all([getAirlines()]);
            if (airlinesRes.success) setAirlines(airlinesRes.airlines);
            
            if (id) {
                const mealsRes = await getMealMaster();
                const mealToEdit = mealsRes.meals.find(m => m._id === id);
                if (mealToEdit) {
                    setFormData({
                        ...initialFormData,
                        ...mealToEdit,
                        applicableAirlines: mealToEdit.applicableAirlines?.map(a => a._id) || [],
                        sourceAirports: mealToEdit.sourceAirports?.map(a => a._id) || [],
                        destinationAirports: mealToEdit.destinationAirports?.map(a => a._id) || []
                    });
                    if (mealToEdit.image) {
                        setImagePreview(mealToEdit.image);
                    }
                }
            }
        } catch (err) {
            toast.error("Failed to load data");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.applicableAirlines.length === 0) {
            toast.error("Please select at least one airline");
            return;
        }
        
        setLoading(true);
        try {
            const data = new FormData();
            // Append all form fields to FormData
            Object.keys(formData).forEach(key => {
                if (Array.isArray(formData[key])) {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key]);
                }
            });

            // Append Image if selected
            if (image) {
                data.append('image', image);
            }

            if (id) {
                await updateMealMaster(id, data);
                toast.success("Meal blueprint updated");
            } else {
                await addMealMaster(data);
                toast.success("New meal blueprint deployed");
            }
            navigate('/super-admin/flights/ancillaries/meals');
        } catch (err) {
            toast.error(err.response?.data?.error || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    const toggleArrayItem = (field, value) => {
        const current = formData[field];
        if (current.includes(value)) {
            setFormData({ ...formData, [field]: current.filter(item => item !== value) });
        } else {
            setFormData({ ...formData, [field]: [...current, value] });
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => navigate('/super-admin/flights/ancillaries/meals')}
                        className="p-3 bg-white rounded-2xl text-slate-400 hover:text-slate-800 shadow-sm border border-slate-100 transition-all"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
                            {id ? 'Modify Meal Blueprint' : 'Deploy New Meal'}
                        </h1>
                        <p className="text-slate-500 text-sm font-medium">Industry-standard ancillary configuration module</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={() => navigate('/super-admin/flights/ancillaries/meals')}
                        className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        form="meal-form"
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 transition-all font-black shadow-lg shadow-blue-600/25 disabled:opacity-50"
                    >
                        <Save size={20} /> {loading ? 'Processing...' : (id ? 'Save Changes' : 'Publish Meal')}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Navigation Sidebar */}
                <div className="col-span-12 lg:col-span-3 space-y-2">
                    <TabBtn icon={Info} label="Basic Information" active={activeSection === 'basic'} onClick={() => setActiveSection('basic')} />
                    <TabBtn icon={ShieldCheck} label="Pricing & Tax" active={activeSection === 'pricing'} onClick={() => setActiveSection('pricing')} />
                    <TabBtn icon={Globe} label="Airline & Route" active={activeSection === 'mapping'} onClick={() => setActiveSection('mapping')} />
                    <TabBtn icon={Users} label="Applicability" active={activeSection === 'apps'} onClick={() => setActiveSection('apps')} />
                    <TabBtn icon={Clock} label="Availability" active={activeSection === 'availability'} onClick={() => setActiveSection('availability')} />
                    <TabBtn icon={Upload} label="API & Media" active={activeSection === 'api'} onClick={() => setActiveSection('api')} />
                </div>

                {/* Form Body */}
                <div className="col-span-12 lg:col-span-9">
                    <form id="meal-form" onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 min-h-[600px]">
                        
                        {activeSection === 'basic' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Meal Code (IATA Standard)</label>
                                        <input required value={formData.mealCode} onChange={e => setFormData({...formData, mealCode: e.target.value.toUpperCase()})} placeholder="e.g. AVML" className="form-input" />
                                        <p className="text-[10px] text-slate-400 mt-2 font-medium">Global unique identifier for this meal type</p>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Category</label>
                                        <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="form-input">
                                            <option>Veg</option>
                                            <option>Non-Veg</option>
                                            <option>Vegan</option>
                                            <option>Jain</option>
                                            <option>Diabetic</option>
                                            <option>Gluten-Free</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Public Display Name</label>
                                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Asian Vegetarian Meal" className="form-input" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Detailed Description</label>
                                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Specify ingredients, preparation style, and nutritional highlights." className="form-input h-40 resize-none" />
                                </div>
                            </div>
                        )}

                        {activeSection === 'pricing' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Base Price</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-lg">₹</span>
                                            <input type="number" required value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: e.target.value})} placeholder="0.00" className="form-input pl-12 text-lg" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Currency</label>
                                        <select value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})} className="form-input">
                                            <option>INR</option>
                                            <option>USD</option>
                                            <option>AED</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="p-8 bg-blue-600 rounded-[2rem] text-white flex items-center justify-between shadow-xl shadow-blue-600/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center"><ShieldCheck size={24} /></div>
                                        <div>
                                            <h4 className="font-black text-lg">Tax Inclusive Pricing</h4>
                                            <p className="text-blue-100 text-sm font-medium opacity-80">Toggle if the price already includes local GST/VAT</p>
                                        </div>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, taxIncluded: !formData.taxIncluded})}
                                        className={`w-16 h-8 rounded-full relative transition-all ${formData.taxIncluded ? 'bg-white' : 'bg-blue-800'}`}
                                    >
                                        <div className={`absolute top-1.5 w-5 h-5 rounded-full transition-all ${formData.taxIncluded ? 'left-9 bg-blue-600' : 'left-1.5 bg-white'}`}></div>
                                    </button>
                                </div>

                                {!formData.taxIncluded && (
                                    <div className="animate-in slide-in-from-top-4 duration-300">
                                        <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Convenience Fee / Markup</label>
                                        <input type="number" value={formData.convenienceFee} onChange={e => setFormData({...formData, convenienceFee: e.target.value})} placeholder="e.g. 50" className="form-input" />
                                    </div>
                                )}
                            </div>
                        )}

                        {activeSection === 'mapping' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-6 block flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div> Airline Mapping (Multi-select)
                                    </label>
                                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
                                        {airlines.map(a => (
                                            <div 
                                                key={a._id} 
                                                onClick={() => toggleArrayItem('applicableAirlines', a._id)}
                                                className={`p-4 rounded-[1.5rem] border-2 cursor-pointer flex items-center gap-4 transition-all ${
                                                    formData.applicableAirlines.includes(a._id) ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 hover:border-blue-200'
                                                }`}
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-2 shadow-sm border border-slate-50">
                                                    <img src={a.logo} alt="" className="object-contain" />
                                                </div>
                                                <span className="font-black text-slate-700 text-sm">{a.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-slate-100">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-6 block">Trip Sector Type</label>
                                    <div className="flex gap-4">
                                        {['Domestic', 'International', 'Both'].map(t => (
                                            <button 
                                                key={t}
                                                type="button"
                                                onClick={() => setFormData({...formData, tripType: t})}
                                                className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                                                    formData.tripType === t ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'border-slate-100 text-slate-500 hover:border-slate-200'
                                                }`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'apps' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-6 block text-center">Applicable Passenger Types</label>
                                    <div className="flex gap-6">
                                        {['Adult', 'Child', 'Infant'].map(p => (
                                            <button 
                                                key={p}
                                                type="button"
                                                onClick={() => toggleArrayItem('applicableFor', p)}
                                                className={`flex-1 py-10 rounded-[3rem] border-2 font-black transition-all flex flex-col items-center gap-4 ${
                                                    formData.applicableFor.includes(p) ? 'border-blue-600 bg-blue-50/50 text-blue-600 shadow-lg' : 'border-slate-100 text-slate-300'
                                                }`}
                                            >
                                                <Users size={40} />
                                                <span className="text-lg">{p}</span>
                                                {formData.applicableFor.includes(p) && <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white"><Check size={14} /></div>}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-10 bg-slate-900 rounded-[3rem] text-center shadow-2xl">
                                    <p className="text-slate-400 font-bold mb-4 uppercase tracking-widest text-[10px]">Inventory Display Priority</p>
                                    <div className="flex items-center justify-center gap-6">
                                        <button type="button" onClick={() => setFormData({...formData, priority: Math.max(0, formData.priority - 1)})} className="w-12 h-12 bg-white/10 rounded-2xl text-white flex items-center justify-center text-2xl font-black hover:bg-white/20">-</button>
                                        <input type="number" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-24 text-center text-4xl font-black bg-transparent outline-none text-white" />
                                        <button type="button" onClick={() => setFormData({...formData, priority: parseInt(formData.priority) + 1})} className="w-12 h-12 bg-white/10 rounded-2xl text-white flex items-center justify-center text-2xl font-black hover:bg-white/20">+</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'availability' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div>
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-6 block">Availability Model</label>
                                    <div className="grid grid-cols-3 gap-6">
                                        {['Pre-book', 'Onboard', 'Both'].map(t => (
                                            <button 
                                                key={t}
                                                type="button"
                                                onClick={() => setFormData({...formData, availabilityType: t})}
                                                className={`p-6 rounded-[2rem] border-2 font-black transition-all flex flex-col items-center gap-3 ${
                                                    formData.availabilityType === t ? 'border-blue-600 bg-blue-600 text-white shadow-xl' : 'border-slate-100 text-slate-500 bg-white hover:border-blue-200'
                                                }`}
                                            >
                                                <Clock size={24} />
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="p-10 bg-slate-50 rounded-[2.5rem] border-2 border-slate-100">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-blue-600 shadow-sm"><Clock size={32} /></div>
                                        <div>
                                            <h4 className="font-black text-xl text-slate-800">Booking Cut-off Window</h4>
                                            <p className="text-slate-500 font-medium">Prevent bookings within these many hours of departure</p>
                                        </div>
                                        <div className="ml-auto flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                            <input type="number" value={formData.cutoffTime} onChange={e => setFormData({...formData, cutoffTime: e.target.value})} className="w-12 text-center font-black text-2xl text-blue-600 bg-transparent outline-none" />
                                            <span className="font-bold text-slate-400">HRS</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'api' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="p-10 bg-blue-50/50 rounded-[3rem] border-2 border-blue-100/50">
                                    <h3 className="font-black text-slate-800 text-lg flex items-center gap-3 mb-6"><Globe size={24} className="text-blue-600" /> External Mapping (GDS)</h3>
                                    <div className="grid grid-cols-2 gap-8">
                                        <div>
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Third-party Provider Code</label>
                                            <input value={formData.externalMealCode} onChange={e => setFormData({...formData, externalMealCode: e.target.value})} placeholder="e.g. AMAD-V-001" className="form-input bg-white" />
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3 block">Primary Supplier Name</label>
                                            <input value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="e.g. LSG Sky Chefs" className="form-input bg-white" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div 
                                    className="w-full h-64 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center gap-4 bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-all group relative overflow-hidden"
                                    onClick={() => document.getElementById('meal-image-upload').click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-300 shadow-sm group-hover:scale-110 transition-transform"><Upload size={40} /></div>
                                            <div className="text-center">
                                                <p className="font-black text-slate-500">Upload High-Res Meal Image</p>
                                                <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">JPG, PNG up to 5MB</p>
                                            </div>
                                        </>
                                    )}
                                    <input 
                                        id="meal-image-upload"
                                        type="file" 
                                        hidden 
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>

            <style>{`
                .form-input {
                    width: 100%;
                    padding: 1.125rem 1.5rem;
                    background-color: #f8fafc;
                    border: 2.5px solid transparent;
                    border-radius: 1.5rem;
                    font-weight: 700;
                    font-size: 1rem;
                    transition: all 0.3s;
                    outline: none;
                    color: #1e293b;
                }
                .form-input:focus {
                    background-color: white;
                    border-color: #3b82f6;
                    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.15);
                }
                .form-input::placeholder {
                    color: #94a3b8;
                    font-weight: 500;
                }
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

const TabBtn = ({ icon: Icon, label, active, onClick }) => (
    <button 
        type="button"
        onClick={onClick}
        className={`w-full flex items-center gap-4 p-5 rounded-[1.5rem] transition-all font-black text-sm text-left group ${
            active ? 'bg-slate-900 text-white shadow-2xl translate-x-2' : 'bg-white text-slate-400 hover:text-slate-800 border border-slate-100'
        }`}
    >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
            <Icon size={20} />
        </div>
        {label}
    </button>
);

export default AddMealForm;
