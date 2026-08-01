const axios = require('axios');

async function testRaw() {
    const url = 'https://b2b.cleartrip.com/hotels/api/v4/search-by-location';
    const body = {
        location: {
            type: "CITY",
            id: 34849
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

    const headers = {
        'x-ct-api-key': 'f45f1c204a4697a92ed3babc97681b56',
        'x-lineage-id': 'goairclass-tirupati-001',
        'x-request-id': 'goairclass-location-search-001',
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    console.log("Testing completely raw request...");
    try {
        const response = await axios.post(url, body, { headers });
        console.log("Success! Status:", response.status);
        console.log("Data:", JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.log("Failed! Status:", err.response?.status);
        console.log("Message:", err.response?.data?.error?.message);
        console.log("Full Error Data:", JSON.stringify(err.response?.data, null, 2));
    }
}

testRaw();
