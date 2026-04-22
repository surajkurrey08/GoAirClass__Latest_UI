const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';
const TEST_MOBILE = '9876543210';
const TEST_NAME = 'Test User';
const TEST_CAPTCHA = 'mock_token';

async function testOtpFlow() {
    console.log('--- Starting Registration OTP Flow Test ---');

    try {
        // 1. Send Registration OTP
        console.log('\nStep 1: Sending Registration OTP...');
        const sendRes = await axios.post(`${API_URL}/send-registration-otp`, { 
            fullName: TEST_NAME, 
            mobileNumber: TEST_MOBILE, 
            captchaToken: TEST_CAPTCHA 
        });
        console.log('Send OTP Response:', sendRes.data);

        // We can't easily capture the OTP from console here since it's printed by the server.
        // We will pause and expect the user to check the backend console if running interactively.
        console.log('\n>>> Please check the backend console for the generated OTP.');
        console.log('>>> You can verify it manually or use curl:');
        console.log(`>>> curl -X POST ${API_URL}/verify-registration-otp -H "Content-Type: application/json" -d '{"mobileNumber":"${TEST_MOBILE}","otp":"<OTP_HERE>"}'`);
        
    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

testOtpFlow();
