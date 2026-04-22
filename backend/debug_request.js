const axios = require('axios');

async function debug() {
    try {
        const res = await axios.post('http://localhost:5000/api/auth/admin-request', {
            fullName: "No Email User",
            mobileNumber: "8877665544"
        });
        console.log("Success:", res.data);
    } catch (err) {
        console.log("Error Status:", err.response?.status);
        console.log("Error Data:", JSON.stringify(err.response?.data, null, 2));
    }
}

debug();
