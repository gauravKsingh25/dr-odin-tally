// Test data for voucher upload functionality
// This file provides sample data that can be used to test the duplicate detection

export const validVoucherData = [
    {
        date: '01/01/2024',
        voucherNumber: 'VCH001',
        voucherType: 'Sales',
        amount: 5000,
        party: 'ABC Corporation',
        narration: 'Sale of goods to ABC Corp'
    },
    {
        date: '02/01/2024',
        voucherNumber: 'VCH002',
        voucherType: 'Purchase',
        amount: 3000,
        party: 'XYZ Supplies',
        narration: 'Purchase of raw materials'
    },
    {
        date: '03/01/2024',
        voucherNumber: 'VCH003',
        voucherType: 'Receipt',
        amount: 2000,
        party: 'DEF Industries',
        narration: 'Payment received from DEF'
    }
];

export const duplicateVoucherData = [
    {
        date: '01/01/2024',
        voucherNumber: 'VCH001',
        voucherType: 'Sales',
        amount: 5000,
        party: 'ABC Corporation',
        narration: 'Sale of goods to ABC Corp'
    },
    {
        date: '02/01/2024',
        voucherNumber: 'VCH002',
        voucherType: 'Purchase',
        amount: 3000,
        party: 'XYZ Supplies',
        narration: 'Purchase of raw materials'
    },
    {
        date: '03/01/2024',
        voucherNumber: 'VCH001', // Duplicate voucher number
        voucherType: 'Receipt',
        amount: 2000,
        party: 'Different Party',
        narration: 'This should be rejected as duplicate'
    }
];

export const invalidVoucherData = [
    {
        date: '', // Missing date
        voucherNumber: 'VCH004',
        voucherType: 'Sales',
        amount: 1000,
        party: 'Test Party',
        narration: 'Invalid due to missing date'
    },
    {
        date: '04/01/2024',
        voucherNumber: '', // Missing voucher number
        voucherType: 'Purchase',
        amount: 2000,
        party: 'Test Party',
        narration: 'Invalid due to missing voucher number'
    },
    {
        date: '05/01/2024',
        voucherNumber: 'VCH006',
        voucherType: '', // Missing voucher type
        amount: 1500,
        party: 'Test Party',
        narration: 'Invalid due to missing voucher type'
    },
    {
        date: '06/01/2024',
        voucherNumber: 'VCH007',
        voucherType: 'Sales',
        amount: 0, // Invalid amount
        party: 'Test Party',
        narration: 'Invalid due to zero amount'
    }
];

export const mixedVoucherData = [
    // Valid vouchers
    {
        date: '07/01/2024',
        voucherNumber: 'VCH008',
        voucherType: 'Sales',
        amount: 4000,
        party: 'Valid Party 1',
        narration: 'This is a valid voucher'
    },
    {
        date: '08/01/2024',
        voucherNumber: 'VCH009',
        voucherType: 'Purchase',
        amount: 3500,
        party: 'Valid Party 2',
        narration: 'This is also valid'
    },
    // Duplicate voucher (within same dataset)
    {
        date: '09/01/2024',
        voucherNumber: 'VCH008', // Duplicate of first voucher
        voucherType: 'Receipt',
        amount: 2000,
        party: 'Different Party',
        narration: 'This should be rejected as duplicate'
    },
    // Invalid voucher
    {
        date: 'invalid-date',
        voucherNumber: 'VCH010',
        voucherType: 'Sales',
        amount: 1000,
        party: 'Invalid Party',
        narration: 'Invalid due to bad date format'
    }
];

// Function to simulate Excel-like data structure
export const convertToExcelFormat = (data) => {
    return data.map((row, index) => ({
        ...row,
        __rowNum__: index + 2 // Excel rows start from 2 (after header)
    }));
};

// Test scenarios
export const testScenarios = {
    allValid: {
        name: 'All Valid Vouchers',
        data: validVoucherData,
        expectedResults: {
            valid: 3,
            duplicates: 0,
            invalid: 0
        }
    },
    withDuplicates: {
        name: 'Vouchers with Duplicates',
        data: duplicateVoucherData,
        expectedResults: {
            valid: 2,
            duplicates: 1,
            invalid: 0
        }
    },
    withInvalid: {
        name: 'Invalid Vouchers',
        data: invalidVoucherData,
        expectedResults: {
            valid: 0,
            duplicates: 0,
            invalid: 4
        }
    },
    mixed: {
        name: 'Mixed Valid/Invalid/Duplicate',
        data: mixedVoucherData,
        expectedResults: {
            valid: 2,
            duplicates: 1,
            invalid: 1
        }
    }
};

// Helper function to log test results
export const logTestResults = (scenario, actualResults) => {
    console.group(`🧪 Test Results: ${scenario.name}`);
    console.log('Expected:', scenario.expectedResults);
    console.log('Actual:', actualResults);
    
    const passed = 
        actualResults.valid === scenario.expectedResults.valid &&
        actualResults.duplicates === scenario.expectedResults.duplicates &&
        actualResults.invalid === scenario.expectedResults.invalid;
    
    console.log(passed ? '✅ Test PASSED' : '❌ Test FAILED');
    console.groupEnd();
    
    return passed;
};