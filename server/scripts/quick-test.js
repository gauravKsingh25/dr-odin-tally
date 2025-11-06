/**
 * QUICK TEST - Manual Voucher CRUD Operations
 * 
 * This is a simplified version for quick testing.
 * For comprehensive testing, use test-manual-voucher-crud.js
 * 
 * Usage:
 *   node scripts/quick-test.js
 */

const axios = require('axios');

// ==================== CONFIGURATION ====================
const BASE_URL = 'http://localhost:3000';
const API_PATH = '/api/tally/voucher/manual';

// Update with your credentials
const TEST_USER = {
    email: 'admin@example.com',
    password: 'admin123'
};

// ==================== HELPER FUNCTIONS ====================
let authToken = '';

const log = {
    success: (msg) => console.log(`✅ ${msg}`),
    error: (msg) => console.log(`❌ ${msg}`),
    info: (msg) => console.log(`ℹ️  ${msg}`),
    section: (msg) => {
        console.log('\n' + '='.repeat(60));
        console.log(msg);
        console.log('='.repeat(60));
    }
};

async function login() {
    try {
        log.info('Logging in...');
        const response = await axios.post(`${BASE_URL}/api/auth/signin`, TEST_USER);
        authToken = response.data.token || response.data.accessToken;
        log.success('Login successful');
        return true;
    } catch (error) {
        log.error(`Login failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

function getHeaders() {
    return {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
    };
}

// ==================== TEST FUNCTIONS ====================

async function testCreate() {
    log.section('TEST 1: CREATE VOUCHER');
    
    const voucher = {
        date: new Date().toISOString(),
        voucherNumber: `QUICK-${Date.now()}`,
        voucherType: 'Sales',
        amount: 5000,
        party: 'Quick Test Customer',
        narration: 'Quick test voucher'
    };

    try {
        log.info(`Creating voucher: ${voucher.voucherNumber}`);
        const response = await axios.post(
            `${BASE_URL}${API_PATH}`,
            voucher,
            { headers: getHeaders() }
        );
        
        log.success(`Voucher created! ID: ${response.data.voucher._id}`);
        return response.data.voucher._id;
    } catch (error) {
        log.error(`Create failed: ${error.response?.data?.message || error.message}`);
        return null;
    }
}

async function testRead(voucherId) {
    log.section('TEST 2: READ VOUCHER');
    
    try {
        log.info(`Fetching voucher: ${voucherId}`);
        const response = await axios.get(
            `${BASE_URL}${API_PATH}/${voucherId}`,
            { headers: getHeaders() }
        );
        
        log.success('Voucher retrieved successfully');
        log.info(`Voucher Number: ${response.data.voucher.voucherNumber}`);
        log.info(`Amount: ${response.data.voucher.amount}`);
        log.info(`Party: ${response.data.voucher.party || 'N/A'}`);
        return true;
    } catch (error) {
        log.error(`Read failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testList() {
    log.section('TEST 3: LIST VOUCHERS');
    
    try {
        log.info('Fetching manual vouchers list...');
        const response = await axios.get(
            `${BASE_URL}${API_PATH}/list?page=1&limit=5`,
            { headers: getHeaders() }
        );
        
        log.success(`Found ${response.data.total} manual vouchers`);
        log.info(`Showing ${response.data.vouchers.length} vouchers`);
        
        response.data.vouchers.forEach((v, index) => {
            console.log(`  ${index + 1}. ${v.voucherNumber} - ${v.voucherType} - ₹${v.amount}`);
        });
        
        return true;
    } catch (error) {
        log.error(`List failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testUpdate(voucherId) {
    log.section('TEST 4: UPDATE VOUCHER');
    
    const updates = {
        amount: 7500,
        narration: 'Updated by quick test'
    };

    try {
        log.info(`Updating voucher: ${voucherId}`);
        const response = await axios.put(
            `${BASE_URL}${API_PATH}/${voucherId}`,
            updates,
            { headers: getHeaders() }
        );
        
        log.success('Voucher updated successfully');
        log.info(`New amount: ${response.data.voucher.amount}`);
        return true;
    } catch (error) {
        log.error(`Update failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testDelete(voucherId) {
    log.section('TEST 5: DELETE VOUCHER');
    
    try {
        log.info(`Deleting voucher: ${voucherId}`);
        await axios.delete(
            `${BASE_URL}${API_PATH}/${voucherId}`,
            { headers: getHeaders() }
        );
        
        log.success('Voucher deleted successfully');
        
        // Verify deletion
        try {
            await axios.get(
                `${BASE_URL}${API_PATH}/${voucherId}`,
                { headers: getHeaders() }
            );
            log.error('Voucher still exists after deletion!');
            return false;
        } catch (e) {
            log.success('Deletion verified - voucher not found');
            return true;
        }
    } catch (error) {
        log.error(`Delete failed: ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function testValidation() {
    log.section('TEST 6: VALIDATION');
    
    const invalidVoucher = {
        // Missing required fields
        amount: 1000
    };

    try {
        log.info('Testing validation with invalid data...');
        await axios.post(
            `${BASE_URL}${API_PATH}`,
            invalidVoucher,
            { headers: getHeaders() }
        );
        
        log.error('Validation failed - invalid data was accepted!');
        return false;
    } catch (error) {
        if (error.response?.status === 400) {
            log.success('Validation working - invalid data rejected');
            log.info(`Error: ${error.response.data.message}`);
            return true;
        } else {
            log.error(`Unexpected error: ${error.message}`);
            return false;
        }
    }
}

// ==================== MAIN TEST RUNNER ====================

async function runQuickTest() {
    console.log('\n🧪 QUICK TEST - Manual Voucher CRUD\n');
    
    const startTime = Date.now();
    const results = {
        passed: 0,
        failed: 0
    };

    // Login
    if (!await login()) {
        log.error('Cannot proceed without authentication');
        process.exit(1);
    }

    let voucherId = null;

    // Test 1: Create
    voucherId = await testCreate();
    if (voucherId) {
        results.passed++;
    } else {
        results.failed++;
    }

    if (voucherId) {
        // Test 2: Read
        if (await testRead(voucherId)) {
            results.passed++;
        } else {
            results.failed++;
        }

        // Test 3: List
        if (await testList()) {
            results.passed++;
        } else {
            results.failed++;
        }

        // Test 4: Update
        if (await testUpdate(voucherId)) {
            results.passed++;
        } else {
            results.failed++;
        }

        // Test 5: Delete
        if (await testDelete(voucherId)) {
            results.passed++;
        } else {
            results.failed++;
        }
    } else {
        log.error('Skipping remaining tests - voucher creation failed');
        results.failed += 4;
    }

    // Test 6: Validation
    if (await testValidation()) {
        results.passed++;
    } else {
        results.failed++;
    }

    // Summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    log.section('TEST SUMMARY');
    console.log(`✅ Passed: ${results.passed}`);
    console.log(`❌ Failed: ${results.failed}`);
    console.log(`⏱️  Duration: ${duration}s`);
    
    if (results.failed === 0) {
        log.success('\n🎉 ALL TESTS PASSED!\n');
    } else {
        log.error(`\n⚠️  ${results.failed} TESTS FAILED\n`);
        process.exit(1);
    }
}

// Run tests
runQuickTest().catch(error => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
});
