import React from 'react';
import { X, User, CheckCircle2 } from 'lucide-react';

const SeatMapModal = ({ isOpen, onClose, busData, bookings }) => {
    if (!isOpen) return null;

    const totalSeats = busData?.totalSeats || 40;
    const bookedSeats = bookings.flatMap(b => b.seatNumbers || [b.seatNumber]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-4xl rounded-[40px] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-300">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Seat Occupancy</h2>
                        <p className="text-slate-400 text-sm font-medium">Real-time seat layout for {busData?.busName}</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-2xl transition-all">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Seat Map Visualization */}
                    <div className="bg-slate-50 rounded-[40px] p-10 border border-slate-100 relative">
                        {/* Steering Wheel Placeholder */}
                        <div className="absolute top-8 right-8 w-10 h-10 border-4 border-slate-200 rounded-full flex items-center justify-center">
                            <div className="w-1 h-6 bg-slate-200 rotate-45" />
                        </div>

                        <div className="grid grid-cols-4 gap-4 mt-12">
                            {Array.from({ length: totalSeats }).map((_, i) => {
                                const seatNo = `S${i + 1}`;
                                const isBooked = bookedSeats.includes(seatNo);
                                return (
                                    <div 
                                        key={i}
                                        className={`h-12 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                                            isBooked 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105' 
                                            : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-400'
                                        }`}
                                    >
                                        {seatNo}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Stats & Legend */}
                    <div className="flex flex-col justify-center space-y-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                    <User size={24} />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-slate-800">{bookedSeats.length}</div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Seats Booked</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <div className="text-3xl font-black text-slate-800">{totalSeats - bookedSeats.length}</div>
                                    <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Available</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-10 border-t border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-blue-600 rounded-md" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Booked by Passenger</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-white border border-slate-200 rounded-md" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Empty / Available</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 bg-slate-300 rounded-md" />
                                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Blocked (Operator)</span>
                            </div>
                        </div>

                        <button onClick={onClose} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl shadow-slate-200">
                            Close Preview
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SeatMapModal;
