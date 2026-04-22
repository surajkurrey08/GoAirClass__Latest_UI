const mongoose = require('mongoose');
const HotelBooking = require('../../models/hotel/HotelBooking');
const Room = require('../../models/hotel/Room');
const Hotel = require('../../models/hotel/Hotel');
const HotelCoupon = require('../../models/hotel/HotelCoupon');
const RoomInventory = require('../../models/hotel/RoomInventory');
const puppeteer = require('puppeteer');
const qrcode = require('qrcode');
const { generateHotelInvoiceHTML } = require('../../utils/hotelInvoiceTemplate');

const generateBookingId = () => {
    return "HTL" + Math.random().toString(36).substr(2, 8).toUpperCase();
};

const getAllHotelBookings = async (req, res) => {
    try {
        const bookings = await HotelBooking.find()
            .populate('hotelId', 'hotelName city')
            .populate('roomId', 'roomType price')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getBookingsByHotel = async (req, res) => {
    try {
        const bookings = await HotelBooking.find({ hotelId: req.params.hotelId })
            .populate('roomId', 'roomType price')
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getUserHotelBookings = async (req, res) => {
    try {
        const bookings = await HotelBooking.find({ userId: req.user.id })
            .populate('hotelId', 'hotelName city address images')
            .populate('roomId', 'roomType price')
            .sort({ createdAt: -1 });
        res.json({ success: true, bookings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const getHotelBookingById = async (req, res) => {
    try {
        const id = req.params.id.trim();
        let booking = null;

        if (id.startsWith('HTL')) {
            // Case-insensitive exact match on bookingId
            booking = await HotelBooking.findOne({ bookingId: { $regex: `^${id}$`, $options: 'i' } })
                .populate('hotelId', 'hotelName city address images')
                .populate('roomId', 'roomType price totalRooms')
                .populate('userId', 'fullName email mobileNumber');
        }

        // Fallback: try _id (valid ObjectId)
        if (!booking && id.match(/^[a-f\d]{24}$/i)) {
            booking = await HotelBooking.findById(id)
                .populate('hotelId', 'hotelName city address images')
                .populate('roomId', 'roomType price totalRooms')
                .populate('userId', 'fullName email mobileNumber');
        }

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.json({ success: true, booking });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const cancelBooking = async (req, res) => {
    try {
        const booking = await HotelBooking.findById(req.params.id).populate('hotelId', 'hotelName city');
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.status === 'cancelled') {
            return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
        }

        // --- CANCELLATION POLICY LOGIC ---
        const checkInTime = new Date(booking.checkInDate).getTime();
        const currentTime = new Date().getTime();
        const hoursUntilCheckIn = (checkInTime - currentTime) / (1000 * 60 * 60);

        let cancellationCharge = 0;
        let refundAmount = booking.totalPrice;
        const serviceFee = 0; // Platform service fee (₹0 for now)

        if (hoursUntilCheckIn < 24) {
            cancellationCharge = Math.round(booking.totalPrice * 0.5);
            refundAmount = booking.totalPrice - cancellationCharge - serviceFee;
        }

        // Accept cancellation reason from frontend for analytics
        const { cancellationReason } = req.body;

        booking.status = 'cancelled';
        booking.paymentStatus = 'Cancelled';
        booking.cancellationReason = cancellationReason || 'Not specified';
        booking.cancellationDetails = {
            cancelledAt: new Date(),
            cancellationCharge,
            serviceFee,
            refundAmount,
            refundStatus: refundAmount > 0 ? 'Processing' : 'N/A'
        };

        await booking.save();

        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            refundDetails: {
                totalPaid: booking.totalPrice,
                cancellationCharge,
                serviceFee,
                refundAmount,
                refundStatus: refundAmount > 0 ? 'Processing' : 'N/A',
                policyNote: hoursUntilCheckIn >= 24 ? 'Free cancellation applied' : 'Late cancellation charges applied',
                hotelName: booking.hotelId?.hotelName || '',
                roomType: booking.roomType || '',
                assignedRoomNumber: booking.assignedRoomNumber || '',
                guestName: booking.guestName || '',
                guestEmail: booking.guestEmail || '',
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

async function createBooking(req, res) {
    try {
        const {
            hotelId, roomId, checkInDate, checkOutDate, guests,
            guestTitle, guestName, guestLastName, guestEmail, guestPhone,
            roomPrice, taxes, totalAmount, couponCode, couponDiscount,
            billingAddress, pincode, state, gstNumber, roomType,
            razorpayPaymentId, razorpayOrderId, razorpaySignature,
        } = req.body;

        if (!hotelId || !roomId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ success: false, message: 'Missing required booking fields' });
        }

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        // --- GUEST CAPACITY VALIDATION ---
        const selectedGuests = Number(guests) || 1;
        if (selectedGuests > room.capacity) {
            return res.status(400).json({
                success: false,
                message: `Guest count (${selectedGuests}) exceeds the maximum capacity of ${room.capacity} for this room type.`
            });
        }

        // Availability check
        const confirmedBookings = await HotelBooking.countDocuments({
            roomId,
            status: 'confirmed'
        });

        if (confirmedBookings >= room.totalRooms) {
            return res.status(400).json({ success: false, message: 'Room Sold Out' });
        }

        const conflicting = await HotelBooking.countDocuments({
            roomId,
            status: { $in: ['confirmed', 'pending'] },
            $or: [{ checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }]
        });

        if (conflicting >= room.totalRooms) {
            return res.status(400).json({ success: false, message: 'No rooms available for the selected dates' });
        }

        // ── ROOM ALLOCATION LOGIC ───────────────────────────────────────────
        // 1. Get all individual rooms for this room type
        const allInventory = await RoomInventory.find({ roomTypeId: roomId });
        
        // 2. Get bookings that overlap with these dates
        const activeBookings = await HotelBooking.find({
            roomId,
            status: { $in: ['confirmed', 'pending'] },
            $or: [{ checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }]
        }).select('inventoryRoomId');

        const bookedInventoryIds = activeBookings.map(b => b.inventoryRoomId?.toString()).filter(Boolean);

        // 3. Find first available room not in bookedInventoryIds
        const availableRoomEntry = allInventory.find(inv => !bookedInventoryIds.includes(inv._id.toString()));

        if (!availableRoomEntry) {
            // This shouldn't happen if the count check passed, but safety first
            return res.status(400).json({ success: false, message: 'Allocation failed: All individual rooms are busy.' });
        }

        // Determine payment status based on razorpay data
        const isPaid = !!(razorpayPaymentId && razorpayOrderId);

        let bookingId = generateBookingId();
        let isUnique = false;
        while (!isUnique) {
            const existing = await HotelBooking.findOne({ bookingId });
            if (existing) {
                bookingId = generateBookingId();
            } else {
                isUnique = true;
            }
        }

        const bookingGuests = Number(guests) || 1;
        const nights = Math.max(1, Math.ceil(
            (new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24)
        ));

        // ── PRICE CALCULATION LOGIC ─────────────────────────────────────────
        const basePerPerson = room.discountPrice || room.price || 0;
        const calculatedRoomPrice = basePerPerson * bookingGuests * nights;
        const calculatedTaxes = Math.round(calculatedRoomPrice * 0.18);
        const calculatedTotal = calculatedRoomPrice + calculatedTaxes - (Number(couponDiscount) || 0);

        const booking = new HotelBooking({
            bookingId,
            hotelId,
            roomId,
            userId: req.user.id,
            inventoryRoomId: availableRoomEntry._id,
            assignedRoomNumber: availableRoomEntry.roomNumber,
            roomType: roomType || room.roomType || '',
            guestTitle: guestTitle || 'Mr',
            guestName: `${guestTitle || ''} ${guestName || ''} ${guestLastName || ''}`.trim() || 'Guest',
            guestEmail: guestEmail || '',
            guestPhone: guestPhone || '',
            checkInDate,
            checkOutDate,
            guests: bookingGuests,
            totalPrice: calculatedTotal, // Using the new guest-multiplied total
            couponCode: couponCode || '',
            couponDiscount: couponDiscount || 0,
            taxes: calculatedTaxes,
            billingAddress: billingAddress || '',
            pincode: pincode || '',
            state: state || '',
            gstNumber: gstNumber || '',
            status: isPaid ? 'confirmed' : 'pending',
            paymentStatus: isPaid ? 'Completed' : 'Pending',
            razorpayPaymentId: razorpayPaymentId || '',
            razorpayOrderId: razorpayOrderId || '',
            razorpaySignature: razorpaySignature || '',
        });

        await booking.save();

        if (couponCode) {

            try {
                await HotelCoupon.findOneAndUpdate(
                    { hotelId: new mongoose.Types.ObjectId(hotelId), couponCode: couponCode.toUpperCase() },
                    { $inc: { timesUsed: 1 } }
                );
            } catch (err) {
                console.error("Failed to increment coupon usage:", err);
            }
        }

        res.status(201).json({ success: true, booking, bookingId: booking.bookingId, message: 'Booking created successfully' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

async function checkRoomAvailability(req, res) {
    try {
        const { roomId, checkInDate, checkOutDate } = req.query;
        if (!roomId || !checkInDate || !checkOutDate) {
            return res.status(400).json({ success: false, message: 'roomId, checkInDate, checkOutDate required' });
        }

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        const bookedCount = await HotelBooking.countDocuments({
            roomId,
            status: { $in: ['confirmed', 'pending'] },
            $or: [
                { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
            ]
        });

        const availableRooms = Math.min(room.availableRooms, Math.max(0, (room.totalRooms || 0) - bookedCount));
        res.json({ success: true, availableRooms, totalRooms: room.totalRooms, status: room.status });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

async function generateInvoice(req, res) {
    try {
        const { bookingId } = req.params;
        const booking = await HotelBooking.findById(bookingId)
            .populate('hotelId')
            .populate('roomId');

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Construct Direct PDF Download URL (Points to backend API)
        let host = req.get('host');
        if (host && (host.includes('localhost') || host.includes('127.0.0.1'))) {
            const os = require('os');
            const interfaces = os.networkInterfaces();
            let localIp = '127.0.0.1';
            for (const name of Object.keys(interfaces)) {
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        localIp = iface.address;
                        break;
                    }
                }
            }
            const port = host.split(':')[1] || '5000';
            host = `${localIp}:${port}`;
        }
        
        const protocol = (host && (host.match(/^[0-9.]+:\d+$/) || host.includes('localhost'))) ? 'http' : 'https';
        const backendUrl = process.env.BACKEND_URL || `${protocol}://${host || 'localhost:5000'}`;
        const qrContent = `${backendUrl}/api/hotel-bookings/${booking._id}/invoice`;
        const qrCodeDataUrl = await qrcode.toDataURL(qrContent, { margin: 1, width: 120 });

        // Generate HTML
        const htmlContent = generateHotelInvoiceHTML(booking, qrCodeDataUrl);

        // Puppeteer PDF Gen
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '0', bottom: '0', left: '0', right: '0' }
        });

        await browser.close();

        const filename = `Invoice_${booking._id}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.setHeader('Content-Length', pdfBuffer.length);
        
        res.end(pdfBuffer);

    } catch (err) {
        console.error('Invoice Generation Error:', err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
}

const migrateBookingIds = async (req, res) => {
    try {
        const bookingsWithoutId = await HotelBooking.find({
            $or: [{ bookingId: null }, { bookingId: { $exists: false } }, { bookingId: '' }]
        });

        let updated = 0;
        for (const booking of bookingsWithoutId) {
            let newId = generateBookingId();
            // Ensure uniqueness
            while (await HotelBooking.findOne({ bookingId: newId })) {
                newId = generateBookingId();
            }
            booking.bookingId = newId;
            await booking.save();
            updated++;
        }

        res.json({ success: true, message: `Migrated ${updated} bookings`, updated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { getAllHotelBookings, getBookingsByHotel, cancelBooking, createBooking, checkRoomAvailability, getUserHotelBookings, generateInvoice, getHotelBookingById, migrateBookingIds };
