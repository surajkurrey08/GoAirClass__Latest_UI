const express = require('express');
const router = express.Router();
const ticketController = require('../../controllers/flight/ticket.controller');

// GET /api/tickets/:bookingId
router.get('/:bookingId', (req, res, next) => {
    return ticketController.generateTicketPDF(req, res, next);
});

module.exports = router;
