const express = require('express');
const router = express.Router();
const { addRoom, getRoomsByHotel, getAllRooms, updateRoom, deleteRoom, updateRoomAvailability, getRoomAvailability } = require('../../controllers/hotel/roomController');

router.get('/', getAllRooms);
router.get('/availability', getRoomAvailability);
router.get('/hotel/:hotelId', getRoomsByHotel);
router.post('/', addRoom);
router.put('/update-availability', updateRoomAvailability);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);



module.exports = router;
