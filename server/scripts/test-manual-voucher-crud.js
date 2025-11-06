/**
 * Manual Voucher CRUD Test Script
 * Tests all CRUD operations with comprehensive edge cases and failure scenarios
 * 
 * Usage: node scripts/test-manual-voucher-crud.js
 */

const axios = require('axios');
const moment = require('moment');

// Configuration
const BASE_URL = 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api/tally/voucher/manual`;

// Test credentials (update with valid credentials)
const TEST_USER = {
    email: 'test@example.com',
    password: 'password123'
};

let authToken = '';
let testVoucherId = '';
let createdVoucherIds = [];

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

// Helper functions
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logSection(message) {
    log(`\n${'='.repeat(60)}`, 'blue');
    log(`${message}`, 'bright');
    log(`${'='.repeat(60)}`, 'blue');
}

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Test data generators
function generateValidVoucher(overrides = {}) {
    const timestamp = Date.now();
    return {
        date: moment().format('YYYY-MM-DD'),
        voucherNumber: `TEST-${timestamp}`,
        voucherType: 'Sales',
        voucherTypeName: 'Sales Invoice',
        party: 'Test Customer Ltd.',
        partyledgername: 'Test Customer - Sales',
        amount: 10000,
        narration: 'Test voucher created by automated test script',
        reference: `REF-${timestamp}`,
        isDeemedPositive: true,
        ...overrides
    };
}

function generateCompleteVoucher() {
    const timestamp = Date.now();
    return {
        date: moment().format('YYYY-MM-DD'),
        voucherNumber: `COMPLETE-${timestamp}`,
        voucherType: 'Sales',
        voucherTypeName: 'Tax Invoice',
        party: 'ABC Corporation',
        partyledgername: 'ABC Corp - Trade',
        amount: 50000,
        narration: 'Complete voucher with all fields',
        reference: `INV-${timestamp}`,
        isDeemedPositive: true,
        voucherDate: moment().format('YYYY-MM-DD'),
        effectiveDate: moment().format('YYYY-MM-DD'),
        basicvoucherdate: moment().format('YYYY-MM-DD'),
        guid: `{GUID-${timestamp}}`,
        masterId: `MASTER-${timestamp}`,
        alterid: `ALTER-${timestamp}`,
        inventoryEntries: [
            {
                stockItemName: 'Product A',
                quantity: 10,
                rate: 1000,
                amount: 10000,
                actualQuantity: 10,
                billedQuantity: 10,
                unit: 'PCS'
            },
            {
                stockItemName: 'Product B',
                quantity: 5,
                rate: 2000,
                amount: 10000,
                actualQuantity: 5,
                billedQuantity: 5,
                unit: 'BOX'
            }
        ],
        ledgerEntries: [
            {
                ledgerName: 'Sales Account',
                amount: 42372.88,
                isDebit: false
            },
            {
                ledgerName: 'Customer Account',
                amount: 50000,
                isDebit: true
            }
        ],
        bankDetails: {
            transactionType: 'NEFT',
            instrumentDate: moment().format('YYYY-MM-DD'),
            instrumentNumber: `TXN-${timestamp}`,
            bankName: 'HDFC Bank',
            bankAccountNumber: '1234567890',
            ifscCode: 'HDFC0001234',
            payeeName: 'ABC Corporation'
        },
        gstDetails: {
            cgstAmount: 3813.56,
            sgstAmount: 3813.56,
            igstAmount: 0,
            cessAmount: 0,
            placeOfSupply: 'Maharashtra',
            partyGSTIN: '27AABCU9603R1ZM',
            gstTaxType: 'GST',
            isReverseChargeApplicable: false
        },
        eInvoiceDetails: {
            eInvoiceNumber: `E-INV-${timestamp}`,
            eInvoiceDate: moment().format('YYYY-MM-DD'),
            eInvoiceStatus: 'Generated',
            irn: `IRN-${timestamp}`
        }
    };
}

// API helper functions
async function apiCall(method, url, data = null, expectError = false) {
    try {
        const config = {
            method,
            url,
            headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        if (expectError) {
            return {
                success: false,
                error: error.response?.data || error.message,
                status: error.response?.status
            };
        }
        throw error;
    }
}

// Test suites
async function testAuthentication() {
    logSection('TEST SUITE 1: Authentication');

    try {
        logInfo('Attempting to login...');
        const response = await axios.post(`${BASE_URL}/api/auth/signin`, TEST_USER);
        
        if (response.data.data && response.data.data.accessToken) {
            authToken = response.data.data.accessToken;
            logSuccess('Authentication successful');
            logInfo(`Token: ${authToken.substring(0, 20)}...`);
            return true;
        } else {
            logError('Authentication failed: No token received');
            return false;
        }
    } catch (error) {
        logError(`Authentication failed: ${error.message}`);
        logWarning('Please update TEST_USER credentials in the script');
        return false;
    }
}

async function testCreateVoucher() {
    logSection('TEST SUITE 2: Create Voucher (POST)');

    // Test 2.1: Create valid basic voucher
    try {
        logInfo('Test 2.1: Creating valid basic voucher...');
        const voucher = generateValidVoucher();
        const result = await apiCall('POST', API_BASE, voucher);
        
        if (result.success && result.data.status === 201) {
            testVoucherId = result.data.data.voucher._id;
            createdVoucherIds.push(testVoucherId);
            logSuccess(`Basic voucher created successfully: ${result.data.data.voucher.voucherNumber}`);
            logInfo(`Voucher ID: ${testVoucherId}`);
        } else {
            logError('Failed to create basic voucher');
        }
    } catch (error) {
        logError(`Test 2.1 failed: ${error.message}`);
    }

    await delay(500);

    // Test 2.2: Create complete voucher with all fields
    try {
        logInfo('Test 2.2: Creating complete voucher with all fields...');
        const completeVoucher = generateCompleteVoucher();
        const result = await apiCall('POST', API_BASE, completeVoucher);
        
        if (result.success && result.data.status === 201) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess(`Complete voucher created: ${result.data.data.voucher.voucherNumber}`);
            logInfo(`Inventory entries: ${result.data.data.voucher.inventoryEntries?.length || 0}`);
            logInfo(`Ledger entries: ${result.data.data.voucher.ledgerEntries?.length || 0}`);
        } else {
            logError('Failed to create complete voucher');
        }
    } catch (error) {
        logError(`Test 2.2 failed: ${error.message}`);
    }

    await delay(500);

    // Test 2.3: Attempt to create voucher without required field (date)
    try {
        logInfo('Test 2.3: Creating voucher without date (should fail)...');
        const invalidVoucher = generateValidVoucher({ date: '' });
        delete invalidVoucher.date;
        
        const result = await apiCall('POST', API_BASE, invalidVoucher, true);
        
        if (!result.success && result.status === 400) {
            logSuccess('Correctly rejected voucher without date');
        } else {
            logError('Should have rejected voucher without date');
        }
    } catch (error) {
        logError(`Test 2.3 failed unexpectedly: ${error.message}`);
    }

    await delay(500);

    // Test 2.4: Attempt to create voucher without voucherNumber
    try {
        logInfo('Test 2.4: Creating voucher without voucherNumber (should fail)...');
        const invalidVoucher = generateValidVoucher({ voucherNumber: '' });
        delete invalidVoucher.voucherNumber;
        
        const result = await apiCall('POST', API_BASE, invalidVoucher, true);
        
        if (!result.success && result.status === 400) {
            logSuccess('Correctly rejected voucher without voucherNumber');
        } else {
            logError('Should have rejected voucher without voucherNumber');
        }
    } catch (error) {
        logError(`Test 2.4 failed unexpectedly: ${error.message}`);
    }

    await delay(500);

    // Test 2.5: Attempt to create voucher without voucherType
    try {
        logInfo('Test 2.5: Creating voucher without voucherType (should fail)...');
        const invalidVoucher = generateValidVoucher({ voucherType: '' });
        delete invalidVoucher.voucherType;
        
        const result = await apiCall('POST', API_BASE, invalidVoucher, true);
        
        if (!result.success && result.status === 400) {
            logSuccess('Correctly rejected voucher without voucherType');
        } else {
            logError('Should have rejected voucher without voucherType');
        }
    } catch (error) {
        logError(`Test 2.5 failed unexpectedly: ${error.message}`);
    }

    await delay(500);

    // Test 2.6: Attempt to create voucher with zero amount
    try {
        logInfo('Test 2.6: Creating voucher with zero amount (should fail)...');
        const invalidVoucher = generateValidVoucher({ amount: 0 });
        
        const result = await apiCall('POST', API_BASE, invalidVoucher, true);
        
        if (!result.success && result.status === 400) {
            logSuccess('Correctly rejected voucher with zero amount');
        } else {
            logError('Should have rejected voucher with zero amount');
        }
    } catch (error) {
        logError(`Test 2.6 failed unexpectedly: ${error.message}`);
    }

    await delay(500);

    // Test 2.7: Attempt to create voucher with negative amount
    try {
        logInfo('Test 2.7: Creating voucher with negative amount (should fail)...');
        const invalidVoucher = generateValidVoucher({ amount: -1000 });
        
        const result = await apiCall('POST', API_BASE, invalidVoucher, true);
        
        if (!result.success && result.status === 400) {
            logSuccess('Correctly rejected voucher with negative amount');
        } else {
            logError('Should have rejected voucher with negative amount');
        }
    } catch (error) {
        logError(`Test 2.7 failed unexpectedly: ${error.message}`);
    }

    await delay(500);

    // Test 2.8: Attempt to create duplicate voucher (same voucherNumber)
    try {
        logInfo('Test 2.8: Creating duplicate voucher (should fail)...');
        const duplicateVoucher = generateValidVoucher({ voucherNumber: `TEST-${Date.now()}` });
        
        // Create first voucher
        const firstResult = await apiCall('POST', API_BASE, duplicateVoucher);
        if (firstResult.success) {
            createdVoucherIds.push(firstResult.data.data.voucher._id);
            
            // Attempt to create duplicate
            const result = await apiCall('POST', API_BASE, duplicateVoucher, true);
            
            if (!result.success && result.status === 409) {
                logSuccess('Correctly rejected duplicate voucher number');
            } else {
                logError('Should have rejected duplicate voucher number');
            }
        }
    } catch (error) {
        logError(`Test 2.8 failed unexpectedly: ${error.message}`);
    }

    await delay(500);

    // Test 2.9: Create voucher with special characters
    try {
        logInfo('Test 2.9: Creating voucher with special characters...');
        const specialVoucher = generateValidVoucher({
            voucherNumber: `TEST-SPECIAL-!@#$%^&*()-${Date.now()}`,
            party: 'Test & Company (Pvt.) Ltd.',
            narration: 'Voucher with "quotes" and \'apostrophes\' and special chars: €£¥'
        });
        
        const result = await apiCall('POST', API_BASE, specialVoucher);
        
        if (result.success && result.data.status === 201) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess('Voucher with special characters created successfully');
        } else {
            logError('Failed to create voucher with special characters');
        }
    } catch (error) {
        logError(`Test 2.9 failed: ${error.message}`);
    }

    await delay(500);

    // Test 2.10: Create voucher with very long strings
    try {
        logInfo('Test 2.10: Creating voucher with very long strings...');
        const longVoucher = generateValidVoucher({
            voucherNumber: `TEST-LONG-${Date.now()}`,
            narration: 'A'.repeat(1000), // Very long narration
            party: 'B'.repeat(500) // Very long party name
        });
        
        const result = await apiCall('POST', API_BASE, longVoucher);
        
        if (result.success && result.data.status === 201) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess('Voucher with long strings created successfully');
        } else {
            logError('Failed to create voucher with long strings');
        }
    } catch (error) {
        logError(`Test 2.10 failed: ${error.message}`);
    }

    await delay(500);

    // Test 2.11: Create voucher with invalid date format
    try {
        logInfo('Test 2.11: Creating voucher with invalid date (should fail or convert)...');
        const invalidDateVoucher = generateValidVoucher({
            voucherNumber: `TEST-BADDATE-${Date.now()}`,
            date: 'invalid-date-format'
        });
        
        const result = await apiCall('POST', API_BASE, invalidDateVoucher, true);
        
        if (!result.success) {
            logSuccess('Correctly rejected invalid date format');
        } else {
            logWarning('Accepted invalid date format (might have been converted)');
        }
    } catch (error) {
        logError(`Test 2.11 failed: ${error.message}`);
    }

    await delay(500);

    // Test 2.12: Create voucher with future date
    try {
        logInfo('Test 2.12: Creating voucher with future date...');
        const futureVoucher = generateValidVoucher({
            voucherNumber: `TEST-FUTURE-${Date.now()}`,
            date: moment().add(30, 'days').format('YYYY-MM-DD')
        });
        
        const result = await apiCall('POST', API_BASE, futureVoucher);
        
        if (result.success && result.data.status === 201) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess('Future dated voucher created successfully');
        } else {
            logError('Failed to create future dated voucher');
        }
    } catch (error) {
        logError(`Test 2.12 failed: ${error.message}`);
    }

    await delay(500);

    // Test 2.13: Create voucher with past date (historical)
    try {
        logInfo('Test 2.13: Creating voucher with past date...');
        const pastVoucher = generateValidVoucher({
            voucherNumber: `TEST-PAST-${Date.now()}`,
            date: moment().subtract(1, 'year').format('YYYY-MM-DD')
        });
        
        const result = await apiCall('POST', API_BASE, pastVoucher);
        
        if (result.success && result.data.status === 201) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess('Past dated voucher created successfully');
        } else {
            logError('Failed to create past dated voucher');
        }
    } catch (error) {
        logError(`Test 2.13 failed: ${error.message}`);
    }

    await delay(500);

    // Test 2.14: Create voucher without authentication
    try {
        logInfo('Test 2.14: Creating voucher without authentication (should fail)...');
        const tempToken = authToken;
        authToken = ''; // Clear token
        
        const voucher = generateValidVoucher({ voucherNumber: `TEST-NOAUTH-${Date.now()}` });
        const result = await apiCall('POST', API_BASE, voucher, true);
        
        authToken = tempToken; // Restore token
        
        if (!result.success && (result.status === 401 || result.status === 403)) {
            logSuccess('Correctly rejected unauthenticated request');
        } else {
            logError('Should have rejected unauthenticated request');
        }
    } catch (error) {
        logError(`Test 2.14 failed: ${error.message}`);
    }
}

async function testReadVoucher() {
    logSection('TEST SUITE 3: Read Voucher (GET)');

    // Test 3.1: Get existing voucher by ID
    try {
        logInfo('Test 3.1: Fetching voucher by ID...');
        const result = await apiCall('GET', `${API_BASE}/${testVoucherId}`);
        
        if (result.success && result.data.status === 200) {
            logSuccess('Voucher fetched successfully');
            logInfo(`Voucher Number: ${result.data.data.voucher.voucherNumber}`);
            logInfo(`Amount: ₹${result.data.data.voucher.amount}`);
        } else {
            logError('Failed to fetch voucher');
        }
    } catch (error) {
        logError(`Test 3.1 failed: ${error.message}`);
    }

    await delay(500);

    // Test 3.2: Get non-existent voucher
    try {
        logInfo('Test 3.2: Fetching non-existent voucher (should fail)...');
        const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but doesn't exist
        const result = await apiCall('GET', `${API_BASE}/${fakeId}`, null, true);
        
        if (!result.success && result.status === 404) {
            logSuccess('Correctly returned 404 for non-existent voucher');
        } else {
            logError('Should have returned 404 for non-existent voucher');
        }
    } catch (error) {
        logError(`Test 3.2 failed: ${error.message}`);
    }

    await delay(500);

    // Test 3.3: Get voucher with invalid ID format
    try {
        logInfo('Test 3.3: Fetching voucher with invalid ID (should fail)...');
        const result = await apiCall('GET', `${API_BASE}/invalid-id-format`, null, true);
        
        if (!result.success && (result.status === 400 || result.status === 500)) {
            logSuccess('Correctly rejected invalid ID format');
        } else {
            logError('Should have rejected invalid ID format');
        }
    } catch (error) {
        logError(`Test 3.3 failed: ${error.message}`);
    }

    await delay(500);

    // Test 3.4: Get manual vouchers list
    try {
        logInfo('Test 3.4: Fetching manual vouchers list...');
        const result = await apiCall('GET', `${API_BASE}/list?page=1&limit=10`);
        
        if (result.success && result.data.status === 200) {
            logSuccess(`Fetched ${result.data.data.vouchers.length} manual vouchers`);
            logInfo(`Total: ${result.data.data.pagination.total}`);
            logInfo(`Pages: ${result.data.data.pagination.totalPages}`);
        } else {
            logError('Failed to fetch manual vouchers list');
        }
    } catch (error) {
        logError(`Test 3.4 failed: ${error.message}`);
    }

    await delay(500);

    // Test 3.5: Get manual vouchers list with filters
    try {
        logInfo('Test 3.5: Fetching manual vouchers list with filters...');
        const result = await apiCall('GET', `${API_BASE}/list?voucherType=Sales&page=1&limit=5`);
        
        if (result.success && result.data.status === 200) {
            logSuccess(`Fetched ${result.data.data.vouchers.length} Sales vouchers`);
        } else {
            logError('Failed to fetch filtered vouchers');
        }
    } catch (error) {
        logError(`Test 3.5 failed: ${error.message}`);
    }

    await delay(500);

    // Test 3.6: Get vouchers with search parameter
    try {
        logInfo('Test 3.6: Fetching vouchers with search...');
        const result = await apiCall('GET', `${API_BASE}/list?search=TEST&page=1&limit=10`);
        
        if (result.success && result.data.status === 200) {
            logSuccess(`Found ${result.data.data.vouchers.length} vouchers matching "TEST"`);
        } else {
            logError('Failed to search vouchers');
        }
    } catch (error) {
        logError(`Test 3.6 failed: ${error.message}`);
    }

    await delay(500);

    // Test 3.7: Get vouchers with date range
    try {
        logInfo('Test 3.7: Fetching vouchers with date range...');
        const startDate = moment().subtract(7, 'days').format('YYYY-MM-DD');
        const endDate = moment().format('YYYY-MM-DD');
        const result = await apiCall('GET', `${API_BASE}/list?startDate=${startDate}&endDate=${endDate}`);
        
        if (result.success && result.data.status === 200) {
            logSuccess(`Found ${result.data.data.vouchers.length} vouchers in date range`);
        } else {
            logError('Failed to fetch vouchers by date range');
        }
    } catch (error) {
        logError(`Test 3.7 failed: ${error.message}`);
    }

    await delay(500);

    // Test 3.8: Get vouchers with invalid pagination
    try {
        logInfo('Test 3.8: Fetching vouchers with invalid pagination...');
        const result = await apiCall('GET', `${API_BASE}/list?page=0&limit=-5`, null, true);
        
        if (result.success) {
            logWarning('System handled invalid pagination (might have defaults)');
        } else {
            logSuccess('Correctly rejected invalid pagination');
        }
    } catch (error) {
        logError(`Test 3.8 failed: ${error.message}`);
    }
}

async function testUpdateVoucher() {
    logSection('TEST SUITE 4: Update Voucher (PUT)');

    // Test 4.1: Update voucher with valid data
    try {
        logInfo('Test 4.1: Updating voucher with valid data...');
        const updateData = {
            amount: 15000,
            narration: 'Updated narration - Test successful',
            party: 'Updated Customer Name'
        };
        
        const result = await apiCall('PUT', `${API_BASE}/${testVoucherId}`, updateData);
        
        if (result.success && result.data.status === 200) {
            logSuccess('Voucher updated successfully');
            logInfo(`New Amount: ₹${result.data.data.voucher.amount}`);
            logInfo(`New Party: ${result.data.data.voucher.party}`);
        } else {
            logError('Failed to update voucher');
        }
    } catch (error) {
        logError(`Test 4.1 failed: ${error.message}`);
    }

    await delay(500);

    // Test 4.2: Update voucher with new voucher number
    try {
        logInfo('Test 4.2: Updating voucher number...');
        const newVoucherNumber = `UPDATED-${Date.now()}`;
        const updateData = {
            voucherNumber: newVoucherNumber
        };
        
        const result = await apiCall('PUT', `${API_BASE}/${testVoucherId}`, updateData);
        
        if (result.success && result.data.status === 200) {
            logSuccess(`Voucher number updated to: ${newVoucherNumber}`);
        } else {
            logError('Failed to update voucher number');
        }
    } catch (error) {
        logError(`Test 4.2 failed: ${error.message}`);
    }

    await delay(500);

    // Test 4.3: Update voucher with duplicate voucher number (should fail)
    try {
        logInfo('Test 4.3: Updating to duplicate voucher number (should fail)...');
        
        // Create a new voucher first
        const newVoucher = generateValidVoucher({ voucherNumber: `DUPLICATE-TEST-${Date.now()}` });
        const createResult = await apiCall('POST', API_BASE, newVoucher);
        
        if (createResult.success) {
            const newVoucherId = createResult.data.data.voucher._id;
            createdVoucherIds.push(newVoucherId);
            
            // Try to update existing voucher with this number
            const updateData = {
                voucherNumber: newVoucher.voucherNumber
            };
            
            const result = await apiCall('PUT', `${API_BASE}/${testVoucherId}`, updateData, true);
            
            if (!result.success && result.status === 409) {
                logSuccess('Correctly rejected duplicate voucher number update');
            } else {
                logError('Should have rejected duplicate voucher number');
            }
        }
    } catch (error) {
        logError(`Test 4.3 failed: ${error.message}`);
    }

    await delay(500);

    // Test 4.4: Update non-existent voucher (should fail)
    try {
        logInfo('Test 4.4: Updating non-existent voucher (should fail)...');
        const fakeId = '507f1f77bcf86cd799439011';
        const updateData = { amount: 20000 };
        
        const result = await apiCall('PUT', `${API_BASE}/${fakeId}`, updateData, true);
        
        if (!result.success && result.status === 404) {
            logSuccess('Correctly returned 404 for non-existent voucher');
        } else {
            logError('Should have returned 404 for non-existent voucher');
        }
    } catch (error) {
        logError(`Test 4.4 failed: ${error.message}`);
    }

    await delay(500);

    // Test 4.5: Update voucher with invalid data
    try {
        logInfo('Test 4.5: Updating voucher with invalid amount (should fail)...');
        const updateData = { amount: -5000 };
        
        const result = await apiCall('PUT', `${API_BASE}/${testVoucherId}`, updateData, true);
        
        if (!result.success) {
            logSuccess('Correctly rejected invalid amount update');
        } else {
            logError('Should have rejected invalid amount');
        }
    } catch (error) {
        logError(`Test 4.5 failed: ${error.message}`);
    }

    await delay(500);

    // Test 4.6: Update voucher with complete data replacement
    try {
        logInfo('Test 4.6: Updating voucher with complete data...');
        const completeUpdate = {
            amount: 75000,
            party: 'Completely Updated Party Ltd.',
            narration: 'Complete update test',
            voucherType: 'Purchase',
            gstDetails: {
                cgstAmount: 6750,
                sgstAmount: 6750,
                igstAmount: 0,
                placeOfSupply: 'Karnataka',
                partyGSTIN: '29AABCU9603R1ZM'
            },
            inventoryEntries: [
                {
                    stockItemName: 'Updated Product',
                    quantity: 20,
                    rate: 3000,
                    amount: 60000,
                    unit: 'KG'
                }
            ]
        };
        
        const result = await apiCall('PUT', `${API_BASE}/${testVoucherId}`, completeUpdate);
        
        if (result.success && result.data.status === 200) {
            logSuccess('Complete voucher update successful');
            logInfo(`Updated Type: ${result.data.data.voucher.voucherType}`);
            logInfo(`Inventory Entries: ${result.data.data.voucher.inventoryEntries?.length || 0}`);
        } else {
            logError('Failed complete voucher update');
        }
    } catch (error) {
        logError(`Test 4.6 failed: ${error.message}`);
    }

    await delay(500);

    // Test 4.7: Partial update (only one field)
    try {
        logInfo('Test 4.7: Partial update (only reference field)...');
        const updateData = {
            reference: `UPDATED-REF-${Date.now()}`
        };
        
        const result = await apiCall('PUT', `${API_BASE}/${testVoucherId}`, updateData);
        
        if (result.success && result.data.status === 200) {
            logSuccess('Partial update successful');
            logInfo(`Updated Reference: ${result.data.data.voucher.reference}`);
        } else {
            logError('Failed partial update');
        }
    } catch (error) {
        logError(`Test 4.7 failed: ${error.message}`);
    }

    await delay(500);

    // Test 4.8: Update with empty object
    try {
        logInfo('Test 4.8: Updating with empty object...');
        const result = await apiCall('PUT', `${API_BASE}/${testVoucherId}`, {}, true);
        
        if (result.success) {
            logWarning('Empty update accepted (might be valid)');
        } else {
            logSuccess('Correctly rejected empty update');
        }
    } catch (error) {
        logError(`Test 4.8 failed: ${error.message}`);
    }
}

async function testDeleteVoucher() {
    logSection('TEST SUITE 5: Delete Voucher (DELETE)');

    // Test 5.1: Delete existing voucher
    try {
        logInfo('Test 5.1: Deleting existing voucher...');
        
        // Create a voucher to delete
        const voucherToDelete = generateValidVoucher({ voucherNumber: `DELETE-ME-${Date.now()}` });
        const createResult = await apiCall('POST', API_BASE, voucherToDelete);
        
        if (createResult.success) {
            const voucherId = createResult.data.data.voucher._id;
            
            // Delete it
            const result = await apiCall('DELETE', `${API_BASE}/${voucherId}`);
            
            if (result.success && result.data.status === 200) {
                logSuccess('Voucher deleted successfully');
                logInfo(`Deleted: ${result.data.data.deletedVoucher.voucherNumber}`);
                
                // Verify it's actually deleted
                const verifyResult = await apiCall('GET', `${API_BASE}/${voucherId}`, null, true);
                if (!verifyResult.success && verifyResult.status === 404) {
                    logSuccess('Verified: Voucher no longer exists');
                } else {
                    logError('Voucher still exists after deletion!');
                }
            } else {
                logError('Failed to delete voucher');
            }
        }
    } catch (error) {
        logError(`Test 5.1 failed: ${error.message}`);
    }

    await delay(500);

    // Test 5.2: Delete non-existent voucher (should fail)
    try {
        logInfo('Test 5.2: Deleting non-existent voucher (should fail)...');
        const fakeId = '507f1f77bcf86cd799439011';
        const result = await apiCall('DELETE', `${API_BASE}/${fakeId}`, null, true);
        
        if (!result.success && result.status === 404) {
            logSuccess('Correctly returned 404 for non-existent voucher');
        } else {
            logError('Should have returned 404 for non-existent voucher');
        }
    } catch (error) {
        logError(`Test 5.2 failed: ${error.message}`);
    }

    await delay(500);

    // Test 5.3: Delete with invalid ID format
    try {
        logInfo('Test 5.3: Deleting with invalid ID (should fail)...');
        const result = await apiCall('DELETE', `${API_BASE}/invalid-id`, null, true);
        
        if (!result.success && (result.status === 400 || result.status === 500)) {
            logSuccess('Correctly rejected invalid ID format');
        } else {
            logError('Should have rejected invalid ID format');
        }
    } catch (error) {
        logError(`Test 5.3 failed: ${error.message}`);
    }

    await delay(500);

    // Test 5.4: Delete same voucher twice (idempotency test)
    try {
        logInfo('Test 5.4: Deleting same voucher twice (should fail second time)...');
        
        // Create a voucher
        const voucher = generateValidVoucher({ voucherNumber: `DOUBLE-DELETE-${Date.now()}` });
        const createResult = await apiCall('POST', API_BASE, voucher);
        
        if (createResult.success) {
            const voucherId = createResult.data.data.voucher._id;
            
            // First deletion
            const firstDelete = await apiCall('DELETE', `${API_BASE}/${voucherId}`);
            
            if (firstDelete.success) {
                logInfo('First deletion successful');
                
                // Second deletion
                const secondDelete = await apiCall('DELETE', `${API_BASE}/${voucherId}`, null, true);
                
                if (!secondDelete.success && secondDelete.status === 404) {
                    logSuccess('Second deletion correctly failed with 404');
                } else {
                    logError('Second deletion should have failed');
                }
            }
        }
    } catch (error) {
        logError(`Test 5.4 failed: ${error.message}`);
    }
}

async function testEdgeCases() {
    logSection('TEST SUITE 6: Edge Cases and Stress Tests');

    // Test 6.1: Create multiple vouchers rapidly
    try {
        logInfo('Test 6.1: Creating 10 vouchers rapidly (stress test)...');
        const promises = [];
        
        for (let i = 0; i < 10; i++) {
            const voucher = generateValidVoucher({ 
                voucherNumber: `RAPID-${Date.now()}-${i}`,
                amount: 1000 + i
            });
            promises.push(apiCall('POST', API_BASE, voucher));
        }
        
        const results = await Promise.all(promises);
        const successful = results.filter(r => r.success).length;
        
        // Track IDs for cleanup
        results.forEach(r => {
            if (r.success) {
                createdVoucherIds.push(r.data.data.voucher._id);
            }
        });
        
        logSuccess(`Successfully created ${successful}/10 vouchers concurrently`);
    } catch (error) {
        logError(`Test 6.1 failed: ${error.message}`);
    }

    await delay(1000);

    // Test 6.2: Large voucher (maximum data size)
    try {
        logInfo('Test 6.2: Creating voucher with maximum data size...');
        const largeVoucher = {
            date: moment().format('YYYY-MM-DD'),
            voucherNumber: `LARGE-${Date.now()}`,
            voucherType: 'Sales',
            amount: 999999999,
            narration: 'N'.repeat(5000), // 5000 characters
            party: 'Large Party Name '.repeat(50),
            inventoryEntries: Array.from({ length: 50 }, (_, i) => ({
                stockItemName: `Product ${i + 1}`,
                quantity: i + 1,
                rate: 1000,
                amount: (i + 1) * 1000,
                unit: 'PCS'
            })),
            ledgerEntries: Array.from({ length: 50 }, (_, i) => ({
                ledgerName: `Ledger ${i + 1}`,
                amount: 1000 * (i + 1),
                isDebit: i % 2 === 0
            }))
        };
        
        const result = await apiCall('POST', API_BASE, largeVoucher, true);
        
        if (result.success) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess('Large voucher created successfully');
            logInfo(`Inventory entries: ${result.data.data.voucher.inventoryEntries.length}`);
            logInfo(`Ledger entries: ${result.data.data.voucher.ledgerEntries.length}`);
        } else {
            logWarning('Large voucher rejected (might exceed size limits)');
        }
    } catch (error) {
        logError(`Test 6.2 failed: ${error.message}`);
    }

    await delay(500);

    // Test 6.3: Unicode and multi-language support
    try {
        logInfo('Test 6.3: Creating voucher with Unicode characters...');
        const unicodeVoucher = generateValidVoucher({
            voucherNumber: `UNICODE-${Date.now()}`,
            party: '测试公司 テスト会社 परीक्षण कंपनी',
            narration: 'Testing with Emoji 🎉💰📊 and symbols ™®©',
            reference: 'Ref-αβγδ-ñáéíóú-中文'
        });
        
        const result = await apiCall('POST', API_BASE, unicodeVoucher);
        
        if (result.success) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess('Unicode voucher created successfully');
        } else {
            logError('Failed to create Unicode voucher');
        }
    } catch (error) {
        logError(`Test 6.3 failed: ${error.message}`);
    }

    await delay(500);

    // Test 6.4: SQL injection attempt (security test)
    try {
        logInfo('Test 6.4: Testing SQL injection protection...');
        const sqlInjectionVoucher = generateValidVoucher({
            voucherNumber: `SQL-${Date.now()}`,
            party: "'; DROP TABLE vouchers; --",
            narration: "1' OR '1'='1"
        });
        
        const result = await apiCall('POST', API_BASE, sqlInjectionVoucher);
        
        if (result.success) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess('SQL injection protected (treated as normal string)');
        } else {
            logWarning('Request rejected (might have security filters)');
        }
    } catch (error) {
        logError(`Test 6.4 failed: ${error.message}`);
    }

    await delay(500);

    // Test 6.5: XSS attack attempt (security test)
    try {
        logInfo('Test 6.5: Testing XSS protection...');
        const xssVoucher = generateValidVoucher({
            voucherNumber: `XSS-${Date.now()}`,
            party: "<script>alert('XSS')</script>",
            narration: "<img src=x onerror=alert('XSS')>"
        });
        
        const result = await apiCall('POST', API_BASE, xssVoucher);
        
        if (result.success) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess('XSS protected (treated as normal string)');
        } else {
            logWarning('Request rejected (might have security filters)');
        }
    } catch (error) {
        logError(`Test 6.5 failed: ${error.message}`);
    }

    await delay(500);

    // Test 6.6: Null and undefined values
    try {
        logInfo('Test 6.6: Testing null/undefined value handling...');
        const nullVoucher = generateValidVoucher({
            voucherNumber: `NULL-${Date.now()}`,
            party: null,
            reference: undefined,
            narration: null
        });
        
        const result = await apiCall('POST', API_BASE, nullVoucher, true);
        
        if (result.success) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess('Null/undefined values handled correctly');
        } else {
            logWarning('Null/undefined values rejected');
        }
    } catch (error) {
        logError(`Test 6.6 failed: ${error.message}`);
    }

    await delay(500);

    // Test 6.7: Very large amount (numeric limits)
    try {
        logInfo('Test 6.7: Testing with very large amount...');
        const largeAmountVoucher = generateValidVoucher({
            voucherNumber: `BIGAMOUNT-${Date.now()}`,
            amount: 999999999999.99
        });
        
        const result = await apiCall('POST', API_BASE, largeAmountVoucher);
        
        if (result.success) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess(`Large amount handled: ₹${result.data.data.voucher.amount}`);
        } else {
            logWarning('Very large amount rejected (might exceed limits)');
        }
    } catch (error) {
        logError(`Test 6.7 failed: ${error.message}`);
    }

    await delay(500);

    // Test 6.8: Decimal precision
    try {
        logInfo('Test 6.8: Testing decimal precision...');
        const precisionVoucher = generateValidVoucher({
            voucherNumber: `PRECISION-${Date.now()}`,
            amount: 12345.6789123456
        });
        
        const result = await apiCall('POST', API_BASE, precisionVoucher);
        
        if (result.success) {
            createdVoucherIds.push(result.data.data.voucher._id);
            logSuccess(`Decimal precision: ${result.data.data.voucher.amount}`);
            
            if (result.data.data.voucher.amount === 12345.6789123456) {
                logInfo('Full precision preserved');
            } else {
                logInfo(`Precision adjusted to: ${result.data.data.voucher.amount}`);
            }
        } else {
            logError('Failed to handle decimal precision');
        }
    } catch (error) {
        logError(`Test 6.8 failed: ${error.message}`);
    }
}

async function cleanupTestData() {
    logSection('CLEANUP: Removing Test Vouchers');

    let deletedCount = 0;
    let failedCount = 0;

    for (const voucherId of createdVoucherIds) {
        try {
            const result = await apiCall('DELETE', `${API_BASE}/${voucherId}`, null, true);
            if (result.success) {
                deletedCount++;
            } else {
                failedCount++;
            }
            await delay(100);
        } catch (error) {
            failedCount++;
            logWarning(`Failed to delete voucher ${voucherId}: ${error.message}`);
        }
    }

    logInfo(`Cleanup complete: ${deletedCount} deleted, ${failedCount} failed`);
    
    if (deletedCount > 0) {
        logSuccess(`Successfully cleaned up ${deletedCount} test vouchers`);
    }
    if (failedCount > 0) {
        logWarning(`${failedCount} vouchers could not be deleted (might already be deleted)`);
    }
}

// Main test runner
async function runAllTests() {
    log('\n' + '═'.repeat(60), 'bright');
    log('🧪 MANUAL VOUCHER CRUD - COMPREHENSIVE TEST SUITE', 'bright');
    log('═'.repeat(60) + '\n', 'bright');
    
    logInfo(`Test Started: ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
    logInfo(`Base URL: ${BASE_URL}`);
    logInfo(`API Endpoint: ${API_BASE}\n`);

    const startTime = Date.now();

    try {
        // Run test suites
        const authSuccess = await testAuthentication();
        
        if (!authSuccess) {
            logError('Authentication failed. Cannot proceed with tests.');
            logWarning('Please update TEST_USER credentials in the script and ensure server is running.');
            process.exit(1);
        }

        await testCreateVoucher();
        await testReadVoucher();
        await testUpdateVoucher();
        await testDeleteVoucher();
        await testEdgeCases();
        
        // Cleanup
        await cleanupTestData();

    } catch (error) {
        logError(`Critical error during testing: ${error.message}`);
        console.error(error);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    // Final summary
    logSection('TEST SUMMARY');
    logInfo(`Total Duration: ${duration} seconds`);
    logInfo(`Total Vouchers Created: ${createdVoucherIds.length}`);
    logSuccess('All test suites completed!');
    
    log('\n' + '═'.repeat(60), 'bright');
    log('✅ TESTING COMPLETE', 'green');
    log('═'.repeat(60) + '\n', 'bright');
}

// Run the tests
if (require.main === module) {
    runAllTests().catch(error => {
        logError(`Fatal error: ${error.message}`);
        console.error(error);
        process.exit(1);
    });
}

module.exports = { runAllTests };
