const Bus = require('../models/Bus');
const Operator = require('../models/Operator');
const BusType = require('../models/BusType');
const User = require('../models/User');
const Schedule = require('../models/Schedule');

/**
 * GET /api/admin/buses
 * Supports filters: status, search
 */
exports.getAllBuses = async (req, res) => {
    try {
        const { status, search, operatorId } = req.query;
        let query = {};
        
        // Filter by specific operator if provided
        if (operatorId) {
            query.operator = operatorId;
        }
        
        // Contextual Status Filtering with Logical Grouping
        if (status) {
            if (status.toLowerCase() === 'active') {
                query.status = { $in: ['active', 'live', 'approved'] };
            } else if (status.toLowerCase() === 'pending') {
                query.status = { $in: ['pending', 'under_review'] };
            } else {
                query.status = { $regex: new RegExp(`^${status}$`, 'i') };
            }
        }

        // Real-time Search Filtering
        if (search) {
            query.$or = [
                { busName: { $regex: search, $options: 'i' } },
                { busNumber: { $regex: search, $options: 'i' } }
            ];
        }

        const buses = await Bus.find(query)
            .populate('operator', 'companyName name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, buses });
    } catch (error) {
        console.error('Error fetching buses:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching buses' });
    }
};

/**
 * GET /api/admin/buses/count
 * Returns counts for badges
 */
exports.getBusCounts = async (req, res) => {
    try {
        const { status } = req.query;
        let query = {};
        if (status) {
            if (status.toLowerCase() === 'active') {
                query.status = { $in: ['active', 'live', 'approved'] };
            } else if (status.toLowerCase() === 'pending') {
                query.status = { $in: ['pending', 'under_review'] };
            } else {
                query.status = status;
            }
        }

        const count = await Bus.countDocuments(query);
        res.json({ success: true, count });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * PATCH /api/admin/buses/:id/:action
 * Approve, Reject, Suspend, Activate
 */
exports.updateBusStatus = async (req, res) => {
    try {
        const { id, action } = req.params;
        let status;

        switch (action) {
            case 'approve':
                status = 'approved';
                break;
            case 'activate':
                status = 'live';
                break;
            case 'reject':
                status = 'rejected';
                break;
            case 'suspend':
                status = 'suspended';
                break;
            case 'submit_for_approval':
                status = 'under_review';
                break;
            default:
                return res.status(400).json({ success: false, message: 'Invalid action' });
        }

        const bus = await Bus.findByIdAndUpdate(id, { status }, { new: true });
        if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });

        // Cascading Status Update for Schedules
        let scheduleStatus;
        if (['approved', 'live', 'active'].includes(status)) {
            scheduleStatus = 'active';
        } else if (status === 'suspended') {
            scheduleStatus = 'inactive';
        } else if (status === 'rejected') {
            scheduleStatus = 'canceled';
        }

        if (scheduleStatus) {
            await Schedule.updateMany({ bus: id }, { status: scheduleStatus });
        }

        res.json({ success: true, bus, message: `Bus ${action}ed successfully and schedules updated` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * POST /api/admin/buses
 */
exports.createBus = async (req, res) => {
    try {
        const bus = new Bus(req.body);
        await bus.save();
        res.status(201).json({ success: true, bus });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * DELETE /api/admin/buses/:id
 */
exports.deleteBus = async (req, res) => {
    try {
        const bus = await Bus.findByIdAndDelete(req.params.id);
        if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
        res.json({ success: true, message: 'Bus deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * OPERATORS MANAGEMENT
 */
exports.getAllOperators = async (req, res) => {
    try {
        const operators = await Operator.find({ isDeleted: false }).sort({ createdAt: -1 });
        res.json({ success: true, operators });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * GET /api/admin/operators/:id
 */
exports.getOperatorById = async (req, res) => {
    try {
        const operator = await Operator.findById(req.params.id);
        if (!operator) return res.status(404).json({ success: false, message: 'Operator not found' });
        res.json({ success: true, operator });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * BUS TYPES MANAGEMENT
 */
exports.getAllBusTypes = async (req, res) => {
    try {
        const types = await BusType.find().sort({ name: 1 });
        res.json({ success: true, types });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createBusType = async (req, res) => {
    try {
        const type = new BusType(req.body);
        await type.save();
        res.status(201).json({ success: true, type });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteBusType = async (req, res) => {
    try {
        const type = await BusType.findByIdAndDelete(req.params.id);
        if (!type) return res.status(404).json({ success: false, message: 'Bus Type not found' });
        res.json({ success: true, message: 'Bus Type deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
