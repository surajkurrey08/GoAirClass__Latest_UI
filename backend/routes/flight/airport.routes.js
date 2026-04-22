const express = require('express');
const router = express.Router();
const { createAirport, getAirports, getAirportById, updateAirport, deleteAirport } = require('../../controllers/flight/airport.controller');

router.post('/', createAirport);
router.get('/', getAirports);
router.get('/:id', getAirportById);
router.put('/:id', updateAirport);
router.delete('/:id', deleteAirport);

module.exports = router;
