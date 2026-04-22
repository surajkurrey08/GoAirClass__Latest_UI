const express = require('express');
const router = express.Router();
const {
    createHotel,
    getAllHotels,
    getPendingHotels,
    getApprovedHotels,
    getRejectedHotels,
    getHotelById,
    approveHotel,
    rejectHotel,
    blockHotel,
    unblockHotel,
    deleteHotel,
} = require('../../controllers/hotel/hotelController');

router.get('/', getAllHotels);
router.get('/pending', getPendingHotels);
router.get('/approved', getApprovedHotels);
router.get('/rejected', getRejectedHotels);
router.get('/:id', getHotelById);

router.post('/', createHotel);

router.put('/:id/approve', approveHotel);
router.put('/:id/reject', rejectHotel);
router.put('/:id/block', blockHotel);
router.put('/:id/unblock', unblockHotel);

router.delete('/:id', deleteHotel);

module.exports = router;
