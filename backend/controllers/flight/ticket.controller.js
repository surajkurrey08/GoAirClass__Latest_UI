const PDFDocument = require('pdfkit');
const FlightBooking = require('../../models/flight/flightBooking.model');
const path = require('path');

const generateTicketPDF = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const booking = await FlightBooking.findOne({ bookingId });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        if (booking.bookingStatus !== 'CONFIRMED') {
            return res.status(400).json({ success: false, message: 'Ticket can only be generated for confirmed bookings' });
        }

        const doc = new PDFDocument({ margin: 50 });
        
        // Response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Ticket_${booking.pnr}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(20).text('FLIGHT E-TICKET', { align: 'center' });
        doc.moveDown();
        doc.fontSize(10).text(`PNR: ${booking.pnr}`, { align: 'right' });
        doc.text(`Booking ID: ${booking.bookingId}`, { align: 'right' });
        doc.text(`Ticket No: ${booking.ticketNumber}`, { align: 'right' });
        doc.moveDown();

        // Flight Info
        doc.rect(50, doc.y, 500, 20).fill('#006ce4');
        doc.fillColor('white').text('FLIGHT INFORMATION', 60, doc.y + 5);
        doc.fillColor('black').moveDown(2);

        doc.fontSize(12).text(`${booking.flightDetails.airline} - ${booking.flightDetails.flightNumber}`);
        doc.fontSize(10).text(`From: ${booking.flightDetails.departureAirport}`);
        doc.text(`To: ${booking.flightDetails.arrivalAirport}`);
        doc.text(`Departure: ${new Date(booking.flightDetails.departureTime).toLocaleString()}`);
        doc.text(`Arrival: ${new Date(booking.flightDetails.arrivalTime).toLocaleString()}`);
        doc.moveDown();

        // Passenger Info
        doc.rect(50, doc.y, 500, 20).fill('#006ce4');
        doc.fillColor('white').text('PASSENGER DETAILS', 60, doc.y + 5);
        doc.fillColor('black').moveDown(2);

        booking.passengers.forEach((p, index) => {
            doc.fontSize(10).text(`${index + 1}. ${p.name} (${p.gender}) - Seat: ${p.seatNumber} (${p.seatType})`);
        });

        doc.moveDown();

        // Footer
        doc.fontSize(8).text('Important Notes:', 50, doc.y);
        doc.text('1. Please carry a valid Photo ID for check-in.');
        doc.text('2. Report at least 2 hours before departure for domestic flights.');
        
        doc.end();
    } catch (err) {
        console.error('PDF Generation Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { generateTicketPDF };
