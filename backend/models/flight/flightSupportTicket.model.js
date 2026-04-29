const mongoose = require('mongoose');

const flightSupportTicketSchema = new mongoose.Schema({
    ticketId: { type: String, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FlightBooking' },
    issueType: { 
        type: String, 
        enum: ['Payment', 'Cancellation', 'Seat', 'Baggage', 'Other'], 
        required: true 
    },
    description: { type: String, required: true },
    priority: { 
        type: String, 
        enum: ['Low', 'Medium', 'High'], 
        default: 'Medium' 
    },
    status: { 
        type: String, 
        enum: ['Open', 'In Progress', 'Closed'], 
        default: 'Open' 
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Admin reference
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('FlightSupportTicket', flightSupportTicketSchema);
