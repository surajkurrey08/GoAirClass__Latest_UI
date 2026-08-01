
const axios = require('axios');
require('dotenv').config({ path: './.env' });

async function debugSearch() {
    const baseUrl = process.env.CLEARTRIP_HOTEL_BASE_URL;
    const apiKey = process.env.CLEARTRIP_HOTEL_API_KEY;
    const lineageId = process.env.CLEARTRIP_HOTEL_LINEAGE_ID || "goairclass-tirupati-001";

    const requestBody = {
        location: {
            type: "CITY",
            id: 34849 // Lucknow
        },
        checkInDate: "2026-07-21",
        checkOutDate: "2026-07-22",
        ratePlanFilter: "ALL",
        customerInfo: {
            ip: "103.109.13.19",
            userAgent: "PostmanRuntime/7.49.0"
        },
        corpInfo: {
            corpId: ""
        },
        rooms: [
            {
                adults: 1,
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

    console.log("Sending search request to Cleartrip...");
    console.log("URL:", `${baseUrl}/search-by-location`);
    console.log("Headers:", {
        'X-CT-API-KEY': apiKey,
        'x-lineage-id': lineageId,
        'x-request-id': `goairclass-search-${Date.now()}`
    });

    try {
        const response = await axios.post(`${baseUrl}/search-by-location`, requestBody, {
            headers: {
                'x-ct-api-key': apiKey,
                'x-lineage-id': lineageId,
                'x-request-id': `goairclass-search-${Date.now()}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            timeout: 20000
        });
        console.log("Success! Response keys:", Object.keys(response.data));
    } catch (err) {
        console.error("Error Status:", err.response?.status);
        console.error("Error Status Text:", err.response?.statusText);
        console.error("Error Body Data:", JSON.stringify(err.response?.data, null, 2));
    }
}

debugSearch();
