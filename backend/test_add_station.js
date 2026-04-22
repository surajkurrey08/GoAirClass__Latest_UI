const axios = require('axios');

async function testAddStation() {
    const baseURL = 'http://localhost:5000/api';
    const loginData = {
        username: 'admin', // This depends on what's in the DB, but just a placeholder
        password: 'admin'  
    };

    try {
        console.log('--- TESTING STATION ADD ---');
        // Note: This script assumes a valid superadmin token is needed. 
        // In a real scenario, we'd need to log in first and get the token.
        // For now, we'll just check if the endpoint responds (even if 401/403).
        const res = await axios.post(`${baseURL}/admin/stations`, {
            stationCode: 'TST1',
            stationName: 'Test Station',
            city: 'Test City',
            state: 'Test State',
            latitude: '12.34',
            longitude: '56.78'
        }, {
            validateStatus: () => true
        });

        console.log('Status:', res.status);
        console.log('Response:', JSON.stringify(res.data, null, 2));

        if (res.status === 401 || res.status === 403) {
            console.log('✅ Port 5000 is active and route is protected (Correct Behavior).');
        } else if (res.status === 201) {
            console.log('✅ Station added successfully!');
        } else if (res.status === 500) {
            console.log('❌ Still getting 500 error! Check backend terminal for detailed logs.');
        } else {
            console.log('Unexpected status:', res.status);
        }
    } catch (error) {
        console.error('Connection Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ Backend is not running on port 5000!');
        }
    }
}

testAddStation();
