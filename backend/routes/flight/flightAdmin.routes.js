const express = require('express');
const router = express.Router();
const flightAdminController = require('../../controllers/flight/flightAdmin.controller');
const { authMiddleware, checkRole } = require('../../middleware/authMiddleware');

// All routes here are protected and restricted to Admin & Super Admin
router.use(authMiddleware);
router.use(checkRole(['superadmin', 'admin']));

// API Config
router.get('/api-config', flightAdminController.getApiConfigs);
router.post('/api-config', flightAdminController.saveApiConfig);

// Airlines
router.get('/airlines', flightAdminController.getAirlines);
router.post('/airlines', flightAdminController.addAirline);
router.put('/airlines/:id', flightAdminController.updateAirline);
router.patch('/airlines/:id/status', flightAdminController.toggleAirlineStatus);

// Airports
router.get('/airports', flightAdminController.getAirports);
router.post('/airports', flightAdminController.addAirport);
router.put('/airports/:id', flightAdminController.updateAirport);
router.delete('/airports/:id', flightAdminController.deleteAirport);

// Routes
router.get('/routes', flightAdminController.getRoutes);
router.post('/routes', flightAdminController.addRoute);
router.put('/routes/:id', flightAdminController.updateRoute);
router.delete('/routes/:id', flightAdminController.deleteRoute);

// Inventory
router.get('/inventory', flightAdminController.getFlights);
router.post('/inventory', flightAdminController.addFlight);
router.put('/inventory/:id', flightAdminController.updateFlight);
router.delete('/inventory/:id', flightAdminController.deleteFlight);

// Pricing
router.get('/pricing', flightAdminController.getPricingRules);
router.post('/pricing', flightAdminController.addPricingRule);
router.put('/pricing/:id', flightAdminController.updatePricingRule);
router.delete('/pricing/:id', flightAdminController.deletePricingRule);

// Dashboard & Analytics
router.get('/dashboard', flightAdminController.getDashboardStats);
router.get('/reports', flightAdminController.getReports);

// Bookings
router.get('/bookings', flightAdminController.getAllBookings);

// Refunds
router.get('/refunds', flightAdminController.getRefunds);
router.put('/refunds/:id', flightAdminController.updateRefundStatus);

// Tickets
router.get('/tickets', flightAdminController.getTickets);
router.put('/tickets/:id', flightAdminController.updateTicket);

module.exports = router;
