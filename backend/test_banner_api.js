const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

const BASE_URL = 'http://localhost:5000/api/banner';

async function generateDummyImage() {
    // Generate a simple dummy file just for upload purposes
    const filePath = path.join(__dirname, 'dummy_banner.jpg');
    fs.writeFileSync(filePath, 'dummy image content');
    return filePath;
}

async function runTests() {
    let bannerId = null;
    let dummyImage = null;

    try {
        console.log('🔄 Starting Banner API Tests...\n');

        // 1. Create a dummy image
        dummyImage = await generateDummyImage();

        // 2. Test POST /api/banner (Create Banner)
        console.log('[TEST 1] Testing POST /api/banner...');
        const form = new FormData();
        form.append('title', 'Summer Sale 2026');
        form.append('offerText', 'Flat 50% Off');
        form.append('buttonText', 'Grab Now');
        form.append('redirectUrl', 'https://example.com/summer-sale');
        form.append('isActive', 'true');
        form.append('showType', 'popup');
        form.append('priority', '10');
        // Setting expiry date to a future date
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 1);
        form.append('expiryDate', futureDate.toISOString());
        form.append('image', fs.createReadStream(dummyImage));

        const createRes = await axios.post(BASE_URL, form, {
            headers: form.getHeaders()
        });

        if (createRes.data.success) {
            console.log('✅ POST /api/banner PASSED');
            bannerId = createRes.data.banner._id;
            console.log('   Created Banner ID:', bannerId);
        } else {
            console.error('❌ POST /api/banner FAILED', createRes.data);
            return;
        }

        // 3. Test GET /api/banner/admin (Get All Banners)
        console.log('\n[TEST 2] Testing GET /api/banner/admin...');
        const allAdminRes = await axios.get(`${BASE_URL}/admin`);
        if (allAdminRes.data.success && allAdminRes.data.banners.length > 0) {
            console.log('✅ GET /api/banner/admin PASSED');
            console.log(`   Found ${allAdminRes.data.count} banners.`);
        } else {
            console.error('❌ GET /api/banner/admin FAILED', allAdminRes.data);
            return;
        }

        // 4. Test GET /api/banner (Get Active Banners)
        console.log('\n[TEST 3] Testing GET /api/banner...');
        const activeRes = await axios.get(BASE_URL);
        if (activeRes.data.success) {
            console.log('✅ GET /api/banner PASSED');
            console.log(`   Found ${activeRes.data.count} active banners.`);
        } else {
            console.error('❌ GET /api/banner FAILED', activeRes.data);
            return;
        }

        // 5. Test PATCH /api/banner/:id/toggle
        console.log(`\n[TEST 4] Testing PATCH /api/banner/${bannerId}/toggle...`);
        const toggleRes = await axios.patch(`${BASE_URL}/${bannerId}/toggle`);
        if (toggleRes.data.success) {
            console.log(`✅ PATCH /api/banner/${bannerId}/toggle PASSED`);
            console.log(`   New isActive status: ${toggleRes.data.isActive}`);
        } else {
            console.error('❌ PATCH toggle FAILED', toggleRes.data);
            return;
        }

        // 6. Test Analytics /api/banner/:id/impression
        console.log(`\n[TEST 5] Testing POST /api/banner/${bannerId}/impression...`);
        const impressionRes = await axios.post(`${BASE_URL}/${bannerId}/impression`);
        if (impressionRes.data.success) {
            console.log('✅ POST /impression PASSED');
        } else {
            console.error('❌ POST /impression FAILED', impressionRes.data);
            return;
        }

        // 7. Test Analytics /api/banner/:id/click
        console.log(`\n[TEST 6] Testing POST /api/banner/${bannerId}/click...`);
        const clickRes = await axios.post(`${BASE_URL}/${bannerId}/click`);
        if (clickRes.data.success) {
            console.log('✅ POST /click PASSED');
        } else {
            console.error('❌ POST /click FAILED', clickRes.data);
            return;
        }

        // 8. Test DELETE /api/banner/:id
        console.log(`\n[TEST 7] Testing DELETE /api/banner/${bannerId}...`);
        const deleteRes = await axios.delete(`${BASE_URL}/${bannerId}`);
        if (deleteRes.data.success) {
            console.log('✅ DELETE /api/banner PASSED');
        } else {
            console.error('❌ DELETE FAILED', deleteRes.data);
            return;
        }

        console.log('\n🎉 All tests completed successfully!');

    } catch (error) {
        console.error('\n❌ Error during testing:', error.response ? error.response.data : error.message);
    } finally {
        if (dummyImage && fs.existsSync(dummyImage)) {
            fs.unlinkSync(dummyImage);
        }
    }
}

runTests();
