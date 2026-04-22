const mongoose = require('mongoose');
require('dotenv').config();

const Operator = require('./backend/models/Operator');
const User = require('./backend/models/User');

async function checkDatabase() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goairclass');
        console.log('Connected to DB');

        const admins = await User.find({ role: 'admin' });
        console.log('\n--- Admins ---');
        admins.forEach(a => console.log(`Admin: ${a.name} | ID: ${a._id}`));

        const operators = await Operator.find({ isDeleted: false });
        console.log('\n--- Operators ---');
        operators.forEach(o => console.log(`Operator: ${o.companyName} | Assigned AdminID: ${o.adminId}`));

        if (operators.length > 0 && admins.length > 0) {
            console.log('\nChecking for unassigned operators to fix data...');
            const unassigned = operators.filter(o => !o.adminId);
            if (unassigned.length > 0) {
                console.log(`Found ${unassigned.length} unassigned operators. Assigning to first admin for testing...`);
                // for (let op of unassigned) {
                //     op.adminId = admins[0]._id;
                //     await op.save();
                //     console.log(`Assigned ${op.companyName} to ${admins[0].name}`);
                // }
            }
        }

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

checkDatabase();
