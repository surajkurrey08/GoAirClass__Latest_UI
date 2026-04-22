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
    const [recentSearches, setRecentSearches] = useState([]);
    const containerRef = useRef(null);

    const popularCities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad"];

    useEffect(() => {
        setInputValue(value || '');
    }, [value]);

    useEffect(() => {
        const storedRecent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(storedRecent);
    }, []);

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
        onChange(val); // Sync with parent state immediately
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

        // Update recent searches
        const updatedRecent = [cityName, ...recentSearches.filter(c => c !== cityName)].slice(0, 5);
        setRecentSearches(updatedRecent);
        localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === 'ArrowDown') setIsOpen(true);
            return;
        }

        const totalItems = suggestions.length > 0 ? suggestions.length : 
                           (inputValue.length < 2 ? (recentSearches.length + popularCities.length) : 0);

        if (e.key === 'ArrowDown') {
            setHighlightedIndex(prev => (prev < totalItems - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && highlightedIndex >= 0) {
            e.preventDefault();
            let selected;
            if (suggestions.length > 0) {
                selected = suggestions[highlightedIndex].name;
            } else if (inputValue.length < 2) {
                if (highlightedIndex < recentSearches.length) {
                    selected = recentSearches[highlightedIndex];
                } else {
                    selected = popularCities[highlightedIndex - recentSearches.length];
                }
            }
            if (selected) handleSelect(selected);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={containerRef} className={`relative space-y-3 ${className}`}>
            {label && (
                <div className="flex items-center gap-2 text-slate-500 group-focus-within:text-blue-600 transition-colors">
                    {Icon && <Icon size={16} className="opacity-70" />}
                    <label className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</label>
                </div>
            )}
            
            <div className="relative group">
                <input
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-bold placeholder:text-slate-400 focus:bg-white focus:border-blue-600/10 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none"
                    autoComplete="off"
                />
                
                {inputValue && (
                    <button 
                        onClick={() => { setInputValue(''); onChange(''); setIsOpen(true); }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-3 bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-fadeIn backdrop-blur-xl">
                    <div className="max-h-[380px] overflow-y-auto p-4 custom-scrollbar">
                        {inputValue.length >= 2 ? (
                            <>
                                {suggestions.length > 0 ? (
                                    <div className="space-y-1">
                                        <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggestions</p>
                                        {suggestions.map((city, index) => (
                                            <button
                                                key={city._id || city.name}
                                                onClick={() => handleSelect(city.name)}
                                                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left group ${
                                                    highlightedIndex === index ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                                                }`}
                                            >
                                                <div className={`p-2 rounded-xl transition-colors ${
                                                    highlightedIndex === index ? 'bg-blue-100' : 'bg-slate-100 group-hover:bg-white'
                                                }`}>
                                                    <MapPin size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm tracking-tight">{city.name}</span>
                                                    {city.state && <span className="text-[10px] text-slate-400 font-medium">{city.state}</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center space-y-3">
                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                            <Search size={20} className="text-slate-300" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-600">No cities found</p>
                                            <p className="text-xs text-slate-400 font-medium">Try searching for something else</p>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-6">
                                {recentSearches.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <History size={12} />
                                            Recent Searches
                                        </p>
                                        <div className="space-y-1">
                                            {recentSearches.map((city, index) => (
                                                <button
                                                    key={`recent-${city}`}
                                                    onClick={() => handleSelect(city)}
                                                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all text-left ${
                                                        highlightedIndex === index ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                                                    }`}
                                                >
                                                    <div className={`p-2 rounded-xl ${highlightedIndex === index ? 'bg-blue-100' : 'bg-slate-100'}`}>
                                                        <MapPin size={16} />
                                                    </div>
                                                    <span className="font-bold text-sm tracking-tight">{city}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Star size={12} />
                                        Popular Cities
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 p-2">
                                        {popularCities.map((city, index) => {
                                            const adjustedIndex = index + recentSearches.length;
                                            return (
                                                <button
                                                    key={`popular-${city}`}
                                                    onClick={() => handleSelect(city)}
                                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all text-left border ${
                                                        highlightedIndex === adjustedIndex 
                                                        ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                                        : 'bg-white border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 text-slate-600 hover:text-blue-600'
                                                    }`}
                                                >
                                                    <span className="font-bold text-xs tracking-tight">{city}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
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
