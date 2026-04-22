const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function test() {
    try {
        console.log("Creating dummy image...");
        fs.writeFileSync('dummy.jpg', 'dummy image content');

        const form = new FormData();
        form.append('busName', 'Test Bus');
        form.append('busNumber', 'MH12AB1234');
        form.append('busType', 'AC Sleeper');
        form.append('totalSeats', '30');
        form.append('amenities', JSON.stringify(['AC', 'WiFi']));
        form.append('seatLayout', JSON.stringify([]));
        form.append('images', fs.createReadStream('dummy.jpg'));

        console.log("Sending request...");
        const response = await axios.post('http://localhost:5000/api/buses/create', form, {
            headers: {
                ...form.getHeaders(),
                // Using a fake operator token or just let it fail at auth
            }
        });
        console.log("Success:", response.data);
    } catch (e) {
        console.log("Error status:", e.response?.status);
        console.log("Error data:", e.response?.data);
        console.log("Error message:", e.message);
    } finally {
        if (fs.existsSync('dummy.jpg')) fs.unlinkSync('dummy.jpg');
    }
}

test();
