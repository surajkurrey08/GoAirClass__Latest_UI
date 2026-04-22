const axios = require('axios');

async function testSearch() {
    try {
        const res = await axios.get('http://127.0.0.1:5000/api/trains/search', {
            params: {
                from: 'NDLS',
                to: 'MMCT',
                date: '18-03-2026'
            }
        });
        console.log('Search Results:', JSON.stringify(res.data, null, 2));
    } catch (error) {
        console.error('Search failed:', error.response?.data || error.message);
    }
}

testSearch();
