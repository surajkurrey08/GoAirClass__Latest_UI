const express = require('express');
const router = express.Router();
const { createOffer, getAllOffers, updateOffer, deleteOffer } = require('../../controllers/hotel/offerController');

router.get('/', getAllOffers);
router.post('/', createOffer);
router.put('/:id', updateOffer);
router.delete('/:id', deleteOffer);

module.exports = router;
