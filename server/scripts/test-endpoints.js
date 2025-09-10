const axios = require('axios');

async function testEndpoint() {
    console.log('🔍 Testing Tally Dashboard Endpoint...');
    
    try {
        // Test without authentication first
        console.log('\n1. Testing endpoint without auth...');
        const response1 = await axios.get('http://localhost:7010/api/tally/dashboard');
        console.log('✅ Response:', response1.status, response1.data);
    } catch (error1) {
        console.log('❌ Without auth failed:', error1.response?.status, error1.response?.data || error1.message);
        
        // Test with dummy token
        console.log('\n2. Testing with dummy authorization...');
        try {
            const response2 = await axios.get('http://localhost:7010/api/tally/dashboard', {
                headers: { Authorization: 'Bearer dummy-token' }
            });
            console.log('✅ Response:', response2.status, response2.data);
        } catch (error2) {
            console.log('❌ With auth failed:', error2.response?.status, error2.response?.data || error2.message);
        }
    }
    
    // Test the route that was being called incorrectly
    console.log('\n3. Testing the double-api route (should fail)...');
    try {
        const response3 = await axios.get('http://localhost:7010/api/api/tally/dashboard');
        console.log('✅ Double API worked (unexpected):', response3.status);
    } catch (error3) {
        console.log('❌ Double API failed as expected:', error3.response?.status, error3.message);
    }
    
    // Test connection endpoint
    console.log('\n4. Testing connection endpoint...');
    try {
        const response4 = await axios.get('http://localhost:7010/api/tally/test-connection');
        console.log('✅ Connection test:', response4.status, response4.data);
    } catch (error4) {
        console.log('❌ Connection test failed:', error4.response?.status, error4.response?.data || error4.message);
    }
    
    // List all available routes
    console.log('\n5. Testing root API...');
    try {
        const response5 = await axios.get('http://localhost:7010/api/');
        console.log('✅ API root:', response5.status);
    } catch (error5) {
        console.log('❌ API root failed:', error5.response?.status, error5.message);
    }
}

testEndpoint();
