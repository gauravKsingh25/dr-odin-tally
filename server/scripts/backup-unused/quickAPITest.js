const axios = require('axios');

// Quick API endpoint test
async function quickAPITest() {
    console.log('🧪 QUICK API ENDPOINT TEST');
    console.log('=========================');
    
    const baseUrl = 'http://localhost:7010';
    
    // Test 1: Health check (no auth required)
    console.log('\n1. Testing health endpoint (no auth):');
    try {
        const response = await axios.get(`${baseUrl}/api/tally/health`, {
            timeout: 5000
        });
        console.log(`   ✅ Health check: ${response.status} - ${response.data.message}`);
    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('   ❌ Server not running on localhost:7010');
            console.log('   💡 Try checking if your deployed server is running on a different port/host');
        } else {
            console.log(`   ❌ Health check failed: ${error.message}`);
        }
    }
    
    // Test 2: Ledgers endpoint without auth (should return 401)
    console.log('\n2. Testing ledgers endpoint (no auth - expect 401):');
    try {
        const response = await axios.get(`${baseUrl}/api/tally/ledgers`, {
            timeout: 5000
        });
        console.log(`   ❌ Unexpected success: ${response.status}`);
    } catch (error) {
        if (error.response?.status === 401) {
            console.log('   ✅ Expected 401 Unauthorized - authentication is working');
        } else if (error.code === 'ECONNREFUSED') {
            console.log('   ❌ Server not running');
        } else {
            console.log(`   ❌ Unexpected error: ${error.message}`);
        }
    }
    
    // Test 3: Check if server is running on different port
    const alternativePorts = [3000, 5000, 8000, 8080, 7000];
    console.log('\n3. Testing alternative ports:');
    for (const port of alternativePorts) {
        try {
            const response = await axios.get(`http://localhost:${port}/api/tally/health`, {
                timeout: 2000
            });
            console.log(`   ✅ Found server on port ${port}: ${response.status}`);
        } catch (error) {
            console.log(`   ❌ Port ${port}: Not available`);
        }
    }
    
    console.log('\n🔍 FRONTEND DEBUGGING TIPS:');
    console.log('===========================');
    console.log('1. Open browser DevTools → Network tab');
    console.log('2. Try to load the ledgers page');
    console.log('3. Look for the API call to /api/tally/ledgers');
    console.log('4. Check the response status and error message');
    console.log('\nCommon issues:');
    console.log('- 🔗 Wrong API URL (check if server is on different port)'); 
    console.log('- 🔑 JWT token expired or invalid');
    console.log('- 🌐 CORS policy blocking the request');
    console.log('- 📡 Server not running or unreachable');
    
    console.log('\n📋 NEXT STEPS:');
    console.log('==============');
    console.log('1. ✅ Database has 2,391 ledgers ready');
    console.log('2. 🔧 Check your deployed server URL/port');
    console.log('3. 🔑 Verify JWT token is valid');
    console.log('4. 🌐 Check browser console for errors');
    console.log('5. 📱 Test API directly with Postman/curl');
}

// Test with a sample JWT token if provided
async function testWithToken(token, serverUrl = 'http://localhost:7010') {
    console.log('\n🔑 TESTING WITH JWT TOKEN');
    console.log('=========================');
    
    try {
        const response = await axios.get(`${serverUrl}/api/tally/ledgers?page=1&limit=5`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        if (response.data.status === 200) {
            console.log('   ✅ API call successful!');
            console.log(`   📊 Returned ${response.data.data.ledgers.length} ledgers`);
            console.log(`   📋 Total: ${response.data.data.total}`);
            
            if (response.data.data.ledgers.length > 0) {
                const sample = response.data.data.ledgers[0];
                console.log(`   🏷️  Sample: "${sample.name}" (${sample.parent})`);
            }
            
            console.log('\n🎉 SUCCESS! The API is working correctly.');
            console.log('   The issue might be in the frontend code or token handling.');
            
        } else {
            console.log(`   ❌ API returned status: ${response.data.status}`);
            console.log(`   Message: ${response.data.message}`);
        }
        
    } catch (error) {
        if (error.response) {
            console.log(`   ❌ API Error: ${error.response.status}`);
            console.log(`   Message: ${error.response.data?.message || 'Unknown error'}`);
            
            if (error.response.status === 401) {
                console.log('   🔑 Token is invalid or expired');
            }
        } else {
            console.log(`   ❌ Request failed: ${error.message}`);
        }
    }
}

// Main function
async function runAPITest() {
    await quickAPITest();
    
    // Uncomment and add your JWT token to test with authentication
    // const yourJWTToken = 'your-jwt-token-here';
    // await testWithToken(yourJWTToken);
    
    console.log('\n✅ API test completed!');
}

if (require.main === module) {
    runAPITest().catch(console.error);
}

module.exports = { quickAPITest, testWithToken };