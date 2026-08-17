import React from 'react';
import { Plane, Clock } from 'lucide-react';

export default function FlightItineraryTimeline({ segments }) {
    if (!segments || segments.length === 0) return null;

    const formatTime = (dtStr) => {
        if (!dtStr) return '--:--';
        try {
            const date = new Date(dtStr);
            if (isNaN(date.getTime())) return dtStr;
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        } catch (e) {
            return dtStr;
        }
    };

    const formatDate = (dtStr) => {
        if (!dtStr) return '';
        try {
            const date = new Date(dtStr);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
        } catch (e) {
            return '';
        }
    };

    const getLayoverDuration = (arrStr, depStr) => {
        if (!arrStr || !depStr) return null;
        const arr = new Date(arrStr);
        const dep = new Date(depStr);
        const diffMs = dep - arr;
        if (isNaN(diffMs) || diffMs <= 0) return null;
        const totalMinutes = Math.floor(diffMs / (1000 * 60));
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
    };

    const systemFont = { fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"' };

    return (
        <div className="bg-slate-50/90 border border-slate-200/80 rounded-none p-5 my-4" style={systemFont}>
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-5 flex items-center gap-2" style={systemFont}>
                <Plane className="w-4 h-4 text-[#b89565]" />
                {segments.length > 1 ? `Flight Itinerary & Connecting Layover Details (${segments.length - 1} Stop${segments.length > 2 ? 's' : ''})` : 'Flight Itinerary Details'}
            </h4>

            <div className="space-y-6">
                {segments.map((seg, idx) => {
                    const nextSeg = segments[idx + 1];
                    const layoverTime = nextSeg ? getLayoverDuration(seg.arrivalDateTime, nextSeg.departureDateTime) : null;
                    const isDifferentAirport = nextSeg && seg.destination !== nextSeg.origin;

                    return (
                        <div key={idx} className="space-y-4">
                            {/* Segment Timeline Block */}
                            <div className="relative pl-8 border-l-2 border-slate-300 ml-3 space-y-5">

                                {/* 1. Departure Node */}
                                <div className="relative flex items-start gap-4">
                                    {/* Dot */}
                                    <div className="absolute -left-[39px] top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-white ring-2 ring-slate-300"></div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-slate-500" style={systemFont}>IST</span>
                                            <span className="font-black text-base text-slate-950" style={systemFont}>{formatTime(seg.departureDateTime)}</span>
                                            <span className="font-bold text-sm text-slate-900" style={systemFont}>{seg.originCity || seg.originName || seg.origin} ({seg.origin})</span>
                                            {formatDate(seg.departureDateTime) && (
                                                <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-none ml-1" style={systemFont}>
                                                    {formatDate(seg.departureDateTime)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="block text-xs font-medium text-slate-500 mt-0.5" style={systemFont}>
                                            {seg.originAirportName || 'Airport Terminal'}
                                        </span>
                                    </div>
                                </div>

                                {/* 2. Flight Duration & Airline Pill */}
                                <div className="my-3 py-2 px-3 bg-white border border-slate-200/90 rounded-none inline-flex items-center gap-3 shadow-xs">
                                    {seg.duration && (
                                        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1" style={systemFont}>
                                            {seg.duration}
                                        </span>
                                    )}
                                    <span className="text-slate-300">✈</span>
                                    <div className="flex items-center gap-2 bg-slate-100/90 px-3 py-1 rounded-none border border-slate-200/50">
                                        <span className="w-2 h-2 rounded-full bg-[#b89565]"></span>
                                        <span className="text-xs font-bold text-slate-900" style={systemFont}>{seg.airlineName || seg.airlineCode}</span>
                                        <span className="text-slate-400">•</span>
                                        <span className="text-xs font-mono font-bold text-slate-800" style={systemFont}>{seg.flightNumber}</span>
                                    </div>
                                    {seg.aircraft && (
                                        <span className="text-[11px] text-slate-500 font-medium hidden sm:inline" style={systemFont}>
                                            {seg.aircraft}
                                        </span>
                                    )}
                                </div>

                                {/* 3. Arrival Node */}
                                <div className="relative flex items-start gap-4">
                                    {/* Dot */}
                                    <div className="absolute -left-[39px] top-1 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-200"></div>
                                    <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-xs font-bold text-slate-500" style={systemFont}>IST</span>
                                            <span className="font-black text-base text-slate-950" style={systemFont}>{formatTime(seg.arrivalDateTime)}</span>
                                            <span className="font-bold text-sm text-slate-900" style={systemFont}>{seg.destinationCity || seg.destinationName || seg.destination} ({seg.destination})</span>
                                            {formatDate(seg.arrivalDateTime) && (
                                                <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-none ml-1" style={systemFont}>
                                                    {formatDate(seg.arrivalDateTime)}
                                                </span>
                                            )}
                                        </div>
                                        <span className="block text-xs font-medium text-slate-500 mt-0.5" style={systemFont}>
                                            {seg.destinationAirportName || 'Airport Terminal'}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            {/* 4. Layover Notice Box (Between Segments) */}
                            {nextSeg && (
                                <div className="my-4 p-3.5 bg-white border border-slate-200 rounded-none shadow-xs flex items-center justify-between text-xs" style={systemFont}>
                                    <div className="flex items-center gap-2 text-slate-800" style={systemFont}>
                                        <Clock className="w-4 h-4 text-[#b89565] shrink-0" />
                                        <span style={systemFont}>
                                            {layoverTime ? <strong className="font-black text-slate-950" style={systemFont}>{layoverTime}</strong> : 'Connecting'}{' '}
                                            Layover in <strong className="font-bold text-slate-900" style={systemFont}>{seg.destinationCity || seg.destinationName || seg.destination} ({seg.destination})</strong>
                                        </span>
                                    </div>
                                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-none" style={systemFont}>
                                        {isDifferentAirport ? '⚠️ Self-Transfer / Airport Change' : 'Change of planes'}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
