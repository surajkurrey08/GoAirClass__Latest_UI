const axios = require('axios');
require('dotenv').config();

const runTest = async () => {
    const baseUrl = process.env.CLEARTRIP_HOTEL_BASE_URL || 'https://b2b.cleartrip.com/hotels/api/v4';
    const apiKey = process.env.CLEARTRIP_HOTEL_API_KEY || 'f45f1c204a4697a92ed3babc97681b56';
    const lineageId = process.env.CLEARTRIP_HOTEL_LINEAGE_ID || 'goairclass-tirupati-001';

    console.log('Testing Cleartrip Search by IDs API directly...');
    
    const requestBody = {
        hotelIds: ["1352788"],
        checkInDate: "2026-07-28",
        checkOutDate: "2026-07-29",
        ratePlanFilter: "ALL",
        customerInfo: {
            ip: "103.109.13.19",
            userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
        },
        rooms: [
            {
                adults: 2,
                children: 0,
                childAges: []
            }
        ],
        rateType: [
            "SPECIFIC_CORPORATE",
            "GENERIC_CORPORATE",
            "THIRD_PARTY"
        ]
    };

    try {
        const response = await axios.post(`${baseUrl}/search`, requestBody, {
            headers: {
                'x-ct-api-key': apiKey,
                'x-lineage-id': lineageId,
                'x-request-id': `test-search-ids-${Date.now()}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 20000
        });

        console.log('API Status:', response.status);
        console.log('API Response Data keys:', Object.keys(response.data));
        if (response.data?.hotels) {
            console.log(`Successfully fetched ${response.data.hotels.length} hotels!`);
            console.log('First hotel details sample:', JSON.stringify(response.data.hotels[0], null, 2).substring(0, 1000));
        } else {
            console.log('No hotels list in response:', response.data);
        }
    } catch (error) {
        console.error('Error during testing:', error.response?.data || error.message);
    }
};

runTest();
