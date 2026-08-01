const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const baseUrl = process.env.CLEARTRIP_HOTEL_BASE_URL || 'https://api.cleartrip.com/hotels/api/v4';
const apiKey = process.env.CLEARTRIP_HOTEL_API_KEY;
const lineageId = process.env.CLEARTRIP_HOTEL_LINEAGE_ID || 'goairclass-hotel-flow-001';
const tripId = 'Q260724965470';

console.log('Using Base URL:', baseUrl);
console.log('Using API Key:', apiKey ? 'Loaded' : 'Not Loaded');

async function test() {
    try {
        const response = await axios.get(`${baseUrl}/trip`, {
            params: { tripId },
            headers: {
                'x-ct-api-key': apiKey,
                'x-lineage-id': lineageId,
                'x-request-id': `trip-details-${tripId}-${Date.now()}`,
                'Accept': 'application/json'
            },
            timeout: 15000
        });
        console.log('SUCCESS!');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('FAILED!');
        console.error(err.response?.status, err.response?.data || err.message);
    }
}

test();
