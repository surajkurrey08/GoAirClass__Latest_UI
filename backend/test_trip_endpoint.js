const jwt = require('jsonwebtoken');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

const secret = process.env.JWT_SECRET || 'fallback_secret';
const token = jwt.sign(
    { id: '6a28de3e94b7693ebbd76dbc', role: 'user' },
    secret,
    { expiresIn: '1h' }
);

async function testEndpoint() {
    try {
        const response = await axios.get('http://localhost:5000/api/hotels/trip/Q260724965470', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        console.log('ENDPOINT RESPONSE STATUS:', response.status);
        console.log('ENDPOINT RESPONSE DATA:', JSON.stringify(response.data, null, 2));
    } catch (err) {
        console.error('ENDPOINT REQUEST FAILED:');
        console.error(err.response?.status, err.response?.data || err.message);
    }
}

testEndpoint();
