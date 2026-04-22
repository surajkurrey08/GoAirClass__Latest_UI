const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    phone: { 
        type: String, 
        required: true,
        match: [/^\+[1-9]\d{1,14}$/, 'Invalid phone']
    }
});

schema.pre('save', async function() {
    console.log('Pre-save hook running');
    if (this.phone && !this.phone.startsWith('+')) {
        this.phone = '+91' + this.phone;
    }
});

schema.pre('validate', async function() {
    console.log('Pre-validate hook running');
});

const TestModel = mongoose.model('TestOrder', schema);

async function run() {
    try {
        const doc = new TestModel({ phone: '8767605792' });
        console.log('Calling save...');
        await doc.save();
        console.log('Save successful:', doc.phone);
    } catch (err) {
        console.error('Save failed:', err.message);
    }
    process.exit();
}

run();
