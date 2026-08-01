const axios = require('axios');
require('dotenv').config();

const runTest = async () => {
    const baseUrl = process.env.CLEARTRIP_HOTEL_BASE_URL || 'https://b2b.cleartrip.com/hotels/api/v4';
    const apiKey = process.env.CLEARTRIP_HOTEL_API_KEY || 'f45f1c204a4697a92ed3babc97681b56';
    const lineageId = process.env.CLEARTRIP_HOTEL_LINEAGE_ID || 'goairclass-tirupati-001';

    console.log('Testing Cleartrip Incremental Updates API directly...');
    
    try {
        const response = await axios.get(`${baseUrl}/content/incremental-updates`, {
            params: {
                lastUpdatedAt: 1753164000, // Using the same timestamp from Postman
                pageSize: 2000
            },
            headers: {
                'x-ct-api-key': apiKey,
                'x-lineage-id': lineageId,
                'x-request-id': `test-incremental-${Date.now()}`,
                'Accept': 'application/json'
            },
            timeout: 20000
        });

        console.log('API Status:', response.status);
        console.log('API Response Data Keys:', Object.keys(response.data));
        console.log('hasNextPage:', response.data?.hasNextPage);
        if (response.data?.hotels) {
            console.log(`Successfully fetched ${response.data.hotels.length} changed hotel IDs!`);
            console.log('First 5 hotel IDs sample:', response.data.hotels.slice(0, 5));
        } else {
            console.log('No hotels list in response:', response.data);
        }
    } catch (error) {
        console.error('Error during testing:', error.response?.data || error.message);
    }
};

runTest();
