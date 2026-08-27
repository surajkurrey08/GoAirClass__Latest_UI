const Seat = require('../../legacy/models/Seat');
const OccupancyLog = require('../../legacy/models/OccupancyLog');
const UserType = require('../../legacy/models/UserType');
const BoardingPoint = require('../../legacy/models/BoardingPoint');
const Coupon = require('../../legacy/models/Coupon');

/**
 * Modular Pricing Engine Orchestrator
 */
class PricingEngine {
    constructor() {
        this.modules = [];

        // Register modules in order of application
        this.registerModule(require('./modules/occupancyTracking'));
        this.registerModule(require('./modules/surgePricing'));
        this.registerModule(require('./modules/userTypePricing'));
        this.registerModule(require('./modules/competitionPricing'));
        this.registerModule(require('./modules/seatPricing'));
        this.registerModule(require('./modules/boardingPointPricing'));
        this.registerModule(require('./modules/couponImpact'));
        this.registerModule(require('./modules/commissionSystem'));
    }

    /**
     * Register a pricing module
     * @param {Object} module - Module with apply(context) method
     */
    registerModule(module) {
        this.modules.push(module);
    }

    /**
     * Calculate final price and commission breakdown
     * @param {Object} context - { bus, schedule, route, user, selectedSeats, boardingPoint, couponCode, isSimulation }
     * @returns {Object} - Breakdown of all price components
     */
    async calculate(context) {
        const breakdown = {
            baseFare: (context.schedule ? context.schedule.ticketPrice : context.basePrice) || 0,
            seatPremiums: 0,
            surgeAmount: 0,
            userDiscount: 0,
            couponDiscount: 0,
            boardingPremium: 0,
            commission: 0,
            gst: 0,
            totalFare: 0,
            operatorEarnings: 0,
            appliedModules: []
        };

        // Run through all registered modules
        for (const module of this.modules) {
            if (typeof module.apply === 'function') {
                await module.apply(context, breakdown);
            }
        }

        // Final Calculations (Corrected Formula)
        breakdown.totalFare = Math.round(
            breakdown.baseFare +
            breakdown.seatPremiums +
            breakdown.surgeAmount +
            breakdown.boardingPremium -
            breakdown.userDiscount -
            breakdown.couponDiscount +
            breakdown.commission
        );

        // Standard GST if not already calculated by a module
        if (breakdown.gst === 0) {
            const gstRate = 0.05; // Default 5% or from config
            breakdown.gst = Math.round(breakdown.commission * 0.18); // GST on Commission (18%)
        }

        breakdown.operatorEarnings = breakdown.totalFare - breakdown.commission - breakdown.gst;

        return breakdown;
    }
}

// Singleton instances for common use
const engine = new PricingEngine();

module.exports = engine;
