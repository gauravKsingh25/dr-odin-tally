// Quick test to verify duplicate detection is working
// Run this with node to test the upload functionality

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000'; // Adjust if your server runs on different port
const AUTH_TOKEN = 'your-auth-token-here'; // You'll need to get this from login

// Test data
const testVouchers = [
    {
        date: '2024-01-01',
        voucherNumber: 'TEST001',
        voucherType: 'Sales',
        amount: 5000,
        party: 'Test Company',
        narration: 'First test voucher'
    }
];

const duplicateVouchers = [
    {
        date: '2024-01-02',
        voucherNumber: 'TEST001', // Same voucher number
        voucherType: 'Purchase',
        amount: 3000,
        party: 'Different Company',
        narration: 'This should be rejected as duplicate'
    }
];

async function testDuplicateDetection() {
    try {
        console.log('🧪 Testing Voucher Duplicate Detection\n');

        // Test 1: Upload initial voucher
        console.log('Step 1: Uploading initial voucher...');
        const firstUpload = await axios.post(`${BASE_URL}/api/tally/upload/vouchers`, {
            voucherData: JSON.stringify(testVouchers),
            fileName: 'test-first-upload.xlsx'
        }, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('First upload result:', {
            status: firstUpload.data.status,
            uploaded: firstUpload.data.data?.uploadStats?.uploaded,
            duplicates: firstUpload.data.data?.uploadStats?.duplicates,
            errors: firstUpload.data.data?.uploadStats?.errors
        });

        // Test 2: Try to upload duplicate voucher
        console.log('\nStep 2: Attempting to upload duplicate voucher...');
        const duplicateUpload = await axios.post(`${BASE_URL}/api/tally/upload/vouchers`, {
            voucherData: JSON.stringify(duplicateVouchers),
            fileName: 'test-duplicate-upload.xlsx'
        }, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Duplicate upload result:', {
            status: duplicateUpload.data.status,
            uploaded: duplicateUpload.data.data?.uploadStats?.uploaded,
            duplicates: duplicateUpload.data.data?.uploadStats?.duplicates,
            dbDuplicates: duplicateUpload.data.data?.uploadStats?.dbDuplicates,
            errors: duplicateUpload.data.data?.uploadStats?.errors
        });

        // Test 3: Verify using verification endpoint
        console.log('\nStep 3: Verifying voucher numbers...');
        const verification = await axios.post(`${BASE_URL}/api/tally/verify/vouchers`, {
            voucherNumbers: ['TEST001']
        }, {
            headers: {
                'Authorization': `Bearer ${AUTH_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Verification result:', verification.data);

        // Success criteria
        const test1Success = firstUpload.data.data?.uploadStats?.uploaded > 0;
        const test2Success = duplicateUpload.data.data?.uploadStats?.duplicates > 0 && duplicateUpload.data.data?.uploadStats?.uploaded === 0;
        const test3Success = verification.data.data?.duplicates > 0;

        console.log('\n📊 Test Results:');
        console.log(`✅ Test 1 (Initial Upload): ${test1Success ? 'PASSED' : 'FAILED'}`);
        console.log(`✅ Test 2 (Duplicate Rejection): ${test2Success ? 'PASSED' : 'FAILED'}`);
        console.log(`✅ Test 3 (Verification): ${test3Success ? 'PASSED' : 'FAILED'}`);

        const allTestsPassed = test1Success && test2Success && test3Success;
        console.log(`\n🎯 Overall Result: ${allTestsPassed ? 'ALL TESTS PASSED ✅' : 'SOME TESTS FAILED ❌'}`);

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        console.log('\n💡 Make sure:');
        console.log('1. Server is running on the correct port');
        console.log('2. You have a valid auth token');
        console.log('3. Database is connected');
    }
}

// Instructions for running the test
console.log('📝 Instructions:');
console.log('1. Update BASE_URL if your server runs on different port');
console.log('2. Get auth token by logging in through the app');
console.log('3. Update AUTH_TOKEN variable above');
console.log('4. Run: node testDuplicateUpload.js\n');

if (process.argv.includes('--run')) {
    testDuplicateDetection();
} else {
    console.log('Add --run flag to execute the test');
}