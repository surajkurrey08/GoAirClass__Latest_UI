const express = require('express');
const router = express.Router();
const { createAirline, getAirlines, updateAirline, deleteAirline } = require('../../controllers/flight/airline.controller');

router.post('/', createAirline);
router.get('/', getAirlines);
router.put('/:id', updateAirline);
router.delete('/:id', deleteAirline);

module.exports = router;
