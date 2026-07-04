import React, { useState, useEffect } from 'react';
import { 
    Search, Filter, MessageSquare, AlertCircle, 
    User, Clock, ChevronRight, CheckCircle, 
    UserPlus, Tag, Plus, RefreshCcw
} from 'lucide-react';
import { getFlightTickets, updateFlightTicket } from '../../../services/flightApi';
import { toast } from 'react-toastify';

const TicketRow = ({ ticket, onUpdate }) => {
    const priorityColors = {
        High: 'bg-rose-100 text-rose-600 border-rose-200',
        Medium: 'bg-amber-100 text-amber-600 border-amber-200',
        Low: 'bg-blue-100 text-blue-600 border-blue-200'
    };

    const statusColors = {
        Open: 'bg-emerald-100 text-emerald-600',
        'In Progress': 'bg-blue-100 text-blue-600',
        Closed: 'bg-slate-100 text-slate-400'
    };

    return (
        <tr className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
            <td className="py-5 pl-6">
                <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">TKT-{ticket._id?.substring(0, 8)}</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase">{ticket.issueType}</span>
                </div>
            </td>
            <td className="py-5">
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{ticket.userId?.name}</span>
                    <span className="text-[10px] text-slate-400 font-medium">PNR: {ticket.bookingId?.pnr || 'N/A'}</span>
                </div>
            </td>
            <td className="py-5 max-w-xs">
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed line-clamp-1">{ticket.description}</p>
            </td>
            <td className="py-5">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                </span>
            </td>
            <td className="py-5">
                <select 
                    value={ticket.status}
                    onChange={(e) => onUpdate(ticket._id, { status: e.target.value })}
                    className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider outline-none cursor-pointer ${statusColors[ticket.status]}`}
                >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                </select>
            </td>
            <td className="py-5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                        <User size={14} />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                        {ticket.assignedTo?.name || 'Unassigned'}
                    </span>
                </div>
            </td>
            <td className="py-5 pr-6 text-right">
                <button className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                    <ChevronRight size={20} />
                </button>
            </td>
        </tr>
    );
};

export default function SupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await getFlightTickets();
            setTickets(data.tickets);
        } catch (error) {
            toast.error('Failed to load support tickets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleUpdate = async (id, data) => {
        try {
            await updateFlightTicket(id, data);
            toast.success('Ticket updated');
            fetchTickets();
        } catch (error) {
            toast.error('Update failed');
        }
    };

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Support Tickets</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Manage customer queries and operational issues.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchTickets}
                        className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-blue-600 shadow-sm transition-all"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/25 flex items-center gap-2">
                        <Plus size={18} /> New Ticket
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <CheckCircle size={24} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-100 px-2 py-1 rounded-md">84% Resolved</span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">12</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Open Tickets</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-500/10 p-6 rounded-3xl border border-blue-100 dark:border-blue-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <Clock size={24} className="text-blue-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">4.2h</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">Avg Response Time</p>
                </div>
                <div className="bg-rose-50 dark:bg-rose-500/10 p-6 rounded-3xl border border-rose-100 dark:border-rose-500/20">
                    <div className="flex items-center justify-between mb-4">
                        <AlertCircle size={24} className="text-rose-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">03</h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">High Priority</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-100 dark:border-slate-700/50 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-50 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by Ticket ID, User or Issue..." 
                            className="w-full pl-12 pr-6 py-4 rounded-2xl border-none bg-slate-50 dark:bg-slate-900/50 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Filter By Issue</span>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 uppercase text-[10px] font-black tracking-[0.15em]">
                                <th className="py-5 pl-6">Ticket ID</th>
                                <th className="py-5">Customer</th>
                                <th className="py-5">Description</th>
                                <th className="py-5">Priority</th>
                                <th className="py-5">Status</th>
                                <th className="py-5">Agent</th>
                                <th className="py-5 pr-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="7" className="py-10 px-6">
                                            <div className="h-10 bg-slate-50 dark:bg-slate-900 rounded-xl"></div>
                                        </td>
                                    </tr>
                                ))
                            ) : tickets.length > 0 ? (
                                tickets.map(ticket => (
                                    <TicketRow key={ticket._id} ticket={ticket} onUpdate={handleUpdate} />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-40 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-200">
                                                <MessageSquare size={40} />
                                            </div>
                                            <h3 className="text-xl font-black text-slate-400 uppercase tracking-[0.2em]">No Active Tickets</h3>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
