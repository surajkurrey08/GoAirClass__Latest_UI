const axios = require('axios');

async function testLocationsWith9() {
    const url = 'https://b2b.cleartrip.com/hotels/api/v4/content/locations';
    const headers = {
        'x-ct-api-key': 'f45f1c204a4697a92ed3babc97681b56', // Key with 9
        'x-lineage-id': 'goairclass-tirupati-001',
        'x-request-id': `goairclass-loc-test-${Date.now()}`,
        'Accept': 'application/json'
    };

    try {
        const response = await axios.get(url, {
            params: { locationType: 'CITY', pageSize: 10 },
            headers
        });
        console.log("Locations with 9: Success! Count:", response.data?.locationsHierarchy?.length);
    } catch (err) {
        console.error("Locations with 9: Failed! Status:", err.response?.status, err.response?.data);
    }
}

testLocationsWith9();
