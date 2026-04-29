const express = require('express');
const router = express.Router();
const {
    createFlight,
    getFlights,
    searchFlights,
    getFlightById,
    updateFlight,
    deleteFlight,
    createFlightSchedule,
    getFlightFares
} = require('../../controllers/flight/flight.controller');
const { getAirlines } = require('../../controllers/flight/airline.controller');

router.get('/airlines', getAirlines);
router.post('/schedules', createFlightSchedule);
router.post('/', createFlight);
router.get('/search', searchFlights);
router.post('/search', searchFlights);
router.post('/search-with-budget', searchFlights);
router.get('/fares', getFlightFares);
router.get('/', getFlights);
router.get('/:id', getFlightById);
router.put('/:id', updateFlight);
router.delete('/:id', deleteFlight);

module.exports = router;
