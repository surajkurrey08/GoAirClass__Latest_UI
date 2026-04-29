
const MealMaster = require('../../models/flight/mealMaster.model');
const FlightMealMapping = require('../../models/flight/mealMapping.model');

// --- MEAL MASTER (SUPER ADMIN) ---

exports.createMealMaster = async (req, res) => {
    try {
        const mealData = { ...req.body };
        
        // Handle Image
        if (req.file) {
            mealData.image = `/uploads/meals/${req.file.filename}`;
        }

        // Parse Arrays if sent as strings (common with FormData)
        if (typeof mealData.applicableAirlines === 'string') mealData.applicableAirlines = JSON.parse(mealData.applicableAirlines);
        if (typeof mealData.sourceAirports === 'string') mealData.sourceAirports = JSON.parse(mealData.sourceAirports);
        if (typeof mealData.destinationAirports === 'string') mealData.destinationAirports = JSON.parse(mealData.destinationAirports);
        if (typeof mealData.applicableFor === 'string') mealData.applicableFor = JSON.parse(mealData.applicableFor);

        const meal = new MealMaster(mealData);
        await meal.save();
        res.status(201).json({ success: true, meal });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getMealMaster = async (req, res) => {
    try {
        const meals = await MealMaster.find()
            .populate('applicableAirlines', 'name logo')
            .populate('sourceAirports', 'name city code')
            .populate('destinationAirports', 'name city code');
        res.json({ success: true, meals });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.updateMealMaster = async (req, res) => {
    try {
        const mealData = { ...req.body };

        // Handle Image
        if (req.file) {
            mealData.image = `/uploads/meals/${req.file.filename}`;
        }

        // Parse Arrays
        if (typeof mealData.applicableAirlines === 'string') mealData.applicableAirlines = JSON.parse(mealData.applicableAirlines);
        if (typeof mealData.sourceAirports === 'string') mealData.sourceAirports = JSON.parse(mealData.sourceAirports);
        if (typeof mealData.destinationAirports === 'string') mealData.destinationAirports = JSON.parse(mealData.destinationAirports);
        if (typeof mealData.applicableFor === 'string') mealData.applicableFor = JSON.parse(mealData.applicableFor);

        const meal = await MealMaster.findByIdAndUpdate(req.params.id, mealData, { new: true });
        res.json({ success: true, meal });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteMealMaster = async (req, res) => {
    try {
        await MealMaster.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Meal deleted from master" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// --- MEAL MAPPING (ADMIN) ---

exports.getFlightMealMapping = async (req, res) => {
    try {
        const { flightId } = req.params;
        const mapping = await FlightMealMapping.findOne({ flightId });
        res.json({ success: true, mapping });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.saveFlightMealMapping = async (req, res) => {
    try {
        const { flightId } = req.params;
        const { mealAvailable, meals } = req.body;

        let mapping = await FlightMealMapping.findOne({ flightId });
        if (mapping) {
            mapping.mealAvailable = mealAvailable;
            mapping.meals = meals;
            await mapping.save();
        } else {
            mapping = new FlightMealMapping({ flightId, mealAvailable, meals });
            await mapping.save();
        }

        res.json({ success: true, mapping });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
