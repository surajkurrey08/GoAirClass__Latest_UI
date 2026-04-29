
const express = require('express');
const router = express.Router();
const seatMasterController = require('../../controllers/flight/seatMaster.controller');
const { authMiddleware, checkRole } = require('../../middleware/authMiddleware');

// Super Admin only routes
router.get('/', seatMasterController.getSeatMasters);
router.post('/', seatMasterController.createSeatMaster);
router.put('/:id', seatMasterController.updateSeatMaster);
router.delete('/:id', seatMasterController.deleteSeatMaster);

// Flight specific mapping
router.get('/flight/:flightId', seatMasterController.getFlightSeatMapping);
router.post('/flight/:flightId', seatMasterController.saveFlightSeatMapping);

module.exports = router;
