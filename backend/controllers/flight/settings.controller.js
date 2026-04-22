const FlightSetting = require('../../models/flight/flightSetting.model');

const getSettings = async (req, res) => {
    try {
        let settings = await FlightSetting.findOne();
        if (!settings) {
            settings = new FlightSetting();
            await settings.save();
        }
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

const updateSettings = async (req, res) => {
    try {
        let settings = await FlightSetting.findOne();
        if (!settings) {
            settings = new FlightSetting(req.body);
        } else {
            Object.assign(settings, req.body);
        }
        await settings.save();
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

module.exports = { getSettings, updateSettings };
