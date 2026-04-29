
const express = require('express');
const router = express.Router();
const mealController = require('../../controllers/flight/meal.controller');

const mealUpload = require('../../middleware/mealUpload');

// Meal Master Routes (Super Admin)
router.post('/master', mealUpload.single('image'), mealController.createMealMaster);
router.get('/master', mealController.getMealMaster);
router.put('/master/:id', mealUpload.single('image'), mealController.updateMealMaster);
router.delete('/master/:id', mealController.deleteMealMaster);

// Flight Meal Mapping Routes (Admin)
router.get('/flight/:flightId', mealController.getFlightMealMapping);
router.post('/flight/:flightId', mealController.saveFlightMealMapping);

module.exports = router;
