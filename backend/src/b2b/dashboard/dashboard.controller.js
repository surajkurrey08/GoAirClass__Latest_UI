const dashboardService = require('./dashboard.service');

const getDashboard = async (req, res) => {
    try {
        const dashboard = await dashboardService.getDashboard({
            agency: req.b2b.agency,
            agencyUser: req.b2b.agencyUser
        });
        res.json({ success: true, dashboard });
    } catch (error) {
        console.error('B2B dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

module.exports = {
    getDashboard
};
