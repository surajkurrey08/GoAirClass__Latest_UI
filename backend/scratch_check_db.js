const mongoose = require('mongoose');
require('dotenv').config();

const Operator = require('./models/Operator');
const User = require('./models/User');

async function checkDatabase() {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) throw new Error('MONGO_URI not found in environment');
        
        console.log('Connecting to Atlas Cluster...');
        await mongoose.connect(uri);
        console.log('Connected to DB successfully');

        const admins = await User.find({ role: 'admin' });
        console.log('\n--- Admins Found ---');
        admins.forEach(a => console.log(`Admin: ${a.name} | ID: ${a._id}`));

        if (admins.length === 0) {
            console.log('No admins found. Checking SuperAdmins...');
            const supers = await User.find({ role: 'superadmin' });
            supers.forEach(s => console.log(`SuperAdmin: ${s.name} | ID: ${s._id}`));
        }

        const operators = await Operator.find({ isDeleted: false });
        console.log('\n--- Operators Found ---');
        operators.forEach(o => console.log(`Operator: ${o.companyName} | Assigned AdminID: ${o.adminId}`));

        if (operators.length > 0 && (admins.length > 0)) {
            const unassigned = operators.filter(o => !o.adminId);
            if (unassigned.length > 0) {
                const targetAdmin = admins[0];
                console.log(`\nFound ${unassigned.length} unassigned operators. Assigning to admin "${targetAdmin.name}" (${targetAdmin._id}) for testing...`);
                
                for (let op of unassigned) {
                    op.adminId = targetAdmin._id;
                    await op.save();
                    console.log(`[FIXED] Assigned ${op.companyName} to ${targetAdmin.name}`);
                }
            } else {
                console.log('\nAll operators are already assigned.');
            }
        }

    } catch (err) {
        console.error('Error during diagnostic:', err.message);
    } finally {
        await mongoose.disconnect();
    }
}

checkDatabase();
