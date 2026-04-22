import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, History, Star, X } from 'lucide-react';

const SearchableCityInput = ({ 
    value, 
    onChange, 
    label, 
    placeholder, 
    icon: Icon, 
    cities = [], 
    className = "" 
}) => {
    const [inputValue, setInputValue] = useState(value || '');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const containerRef = useRef(null);

    const popularCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"];

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        onChange(val);
        setIsOpen(true);
        
        if (val.length >= 2) {
            const filtered = cities.filter(city => 
                city.name.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 10);
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (cityName) => {
        onChange(cityName);
        setInputValue(cityName);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    return (
        <div ref={containerRef} className={`relative space-y-3 ${className}`}>
            {label && (
                <div className="flex items-center gap-2 text-slate-500 group-focus-within:text-blue-600 transition-colors px-1">
                    {Icon && <Icon size={14} className="opacity-70" />}
                    <label className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</label>
                </div>
            )}
            
            <div className="relative group">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[24px] text-sm font-bold placeholder:text-slate-400 focus:ring-2 focus:ring-blue-600/10 transition-all outline-none"
                    autoComplete="off"
                />
                
                {inputValue && (
                    <button 
                        onClick={() => { setInputValue(''); onChange(''); setIsOpen(true); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-3 bg-white dark:bg-slate-900 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in duration-200">
                    <div className="max-h-[300px] overflow-y-auto p-4 custom-scrollbar">
                        {inputValue.length >= 2 ? (
                            <div className="space-y-1">
                                {suggestions.length > 0 ? (
                                    suggestions.map((city, index) => (
                                        <button
                                            key={city._id || city.name}
                                            onClick={() => handleSelect(city.name)}
                                            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-blue-50 dark:hover:bg-blue-900/20 text-left group transition-all"
                                        >
                                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-white dark:group-hover:bg-slate-700">
                                                <MapPin size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{city.name}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{city.state}</span>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <p className="p-4 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">No matching cities</p>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Star size={12} className="text-amber-500" />
                                    Popular Cities
                                </p>
                                <div className="grid grid-cols-2 gap-2">
                                    {popularCities.map((city) => (
                                        <button
                                            key={city}
                                            onClick={() => handleSelect(city)}
                                            className="px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-xs font-bold text-slate-600 dark:text-slate-300 transition-all border border-transparent hover:border-blue-200 text-center"
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableCityInput;
