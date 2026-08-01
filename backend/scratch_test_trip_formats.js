const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const baseUrl = process.env.CLEARTRIP_HOTEL_BASE_URL || 'https://api.cleartrip.com/hotels/api/v4';
const apiKey = process.env.CLEARTRIP_HOTEL_API_KEY;
const lineageId = process.env.CLEARTRIP_HOTEL_LINEAGE_ID || 'goairclass-hotel-flow-001';
const tripId = 'Q260723965132';

async function testAll() {
    // Test 1: GET with query param instead of path param
    try {
        console.log('Testing GET with query param...');
        const res = await axios.get(`${baseUrl}/trip`, {
            params: { tripId },
            headers: {
                'x-ct-api-key': apiKey,
                'x-lineage-id': lineageId,
                'x-request-id': `trip-details-qp-${Date.now()}`,
                'Accept': 'application/json'
            }
        });
        console.log('Test 1 Success:', res.status);
        console.log(res.data);
    } catch (err) {
        console.log('Test 1 Fail:', err.response?.status, err.response?.data || err.message);
    }

    // Test 2: POST with JSON body
    try {
        console.log('\nTesting POST with JSON body...');
        const res = await axios.post(`${baseUrl}/trip`, { tripId }, {
            headers: {
                'x-ct-api-key': apiKey,
                'x-lineage-id': lineageId,
                'x-request-id': `trip-details-post-${Date.now()}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
        console.log('Test 2 Success:', res.status);
        console.log(res.data);
    } catch (err) {
        console.log('Test 2 Fail:', err.response?.status, err.response?.data || err.message);
    }

    // Test 3: Standard GET with different lineageId (default flow ID)
    try {
        console.log('\nTesting standard GET with default lineageId...');
        const res = await axios.get(`${baseUrl}/trip/${tripId}`, {
            headers: {
                'x-ct-api-key': apiKey,
                'x-lineage-id': 'goairclass-hotel-flow-001',
                'x-request-id': `trip-details-std-${Date.now()}`,
                'Accept': 'application/json'
            }
        });
        console.log('Test 3 Success:', res.status);
        console.log(res.data);
    } catch (err) {
        console.log('Test 3 Fail:', err.response?.status, err.response?.data || err.message);
    }
}

testAll();
