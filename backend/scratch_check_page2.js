const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function checkPage2() {
    const baseUrl = process.env.CLEARTRIP_HOTEL_BASE_URL;
    const apiKey = process.env.CLEARTRIP_HOTEL_API_KEY;
    const lineageId = process.env.CLEARTRIP_HOTEL_LINEAGE_ID || 'goairclass-location-001';

    const params = {
        locationType: 'CITY',
        pageSize: 1000,
        nextPageToken: "1" // Page 2 token
    };

    console.log("Calling Cleartrip page 2...");
    try {
        const response = await axios.get(`${baseUrl}/content/locations`, {
            params,
            headers: {
                'X-CT-API-KEY': apiKey,
                'x-lineage-id': lineageId,
                'x-request-id': `debug-page2-${Date.now()}`,
                'Accept': 'application/json'
            },
            timeout: 30000
        });

        console.log("Response Keys:", Object.keys(response.data));
        console.log("hasNextPage:", response.data?.hasNextPage);
        console.log("nextPageToken:", response.data?.nextPageToken);
        console.log("locationsHierarchy length:", response.data?.locationsHierarchy?.length);
        if (response.data?.locationsHierarchy) {
            console.log("Sample of locationsHierarchy:", response.data.locationsHierarchy.slice(0, 3));
        }
    } catch (err) {
        console.error("Error fetching page 2:", err.message);
        if (err.response) {
            console.error("Response data:", err.response.data);
        }
    }
}

checkPage2();
