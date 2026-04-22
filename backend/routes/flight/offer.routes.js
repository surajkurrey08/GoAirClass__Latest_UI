const express = require('express');
const router = express.Router();
const { createOffer, getOffers, updateOffer, deleteOffer } = require('../../controllers/flight/offer.controller');

router.post('/', createOffer);
router.get('/', getOffers);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

module.exports = router;
