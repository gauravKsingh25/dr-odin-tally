#!/usr/bin/env node

/**
 * Fix Script: Add Cost Center Extraction to Tally Service
 * 
 * This script updates the TallyService to properly extract cost center data
 * from voucher ledger entries.
 */

const fs = require('fs');
const path = require('path');

console.log('🛠️  Fixing Cost Center Extraction in Tally Service...\n');

try {
    // Read the current TallyService
    const servicePath = path.join(__dirname, '../services/tallyService.js');
    let serviceCode = fs.readFileSync(servicePath, 'utf8');

    // Check if cost center extraction already exists
    if (serviceCode.includes('COSTCENTREALLOCATIONS') && serviceCode.includes('costCentreAllocations')) {
        console.log('✅ Cost center extraction already exists in TallyService');
        console.log('📝 The service should already be extracting cost center data');
        process.exit(0);
    }

    // Find the normalizeVouchers method
    const methodStart = serviceCode.indexOf('normalizeVouchers(parsed) {');
    if (methodStart === -1) {
        console.error('❌ Could not find normalizeVouchers method');
        process.exit(1);
    }

    // Find the end of the method (look for the closing brace)
    let braceCount = 0;
    let methodEnd = methodStart;
    let inMethod = false;

    for (let i = methodStart; i < serviceCode.length; i++) {
        if (serviceCode[i] === '{') {
            braceCount++;
            inMethod = true;
        } else if (serviceCode[i] === '}') {
            braceCount--;
            if (inMethod && braceCount === 0) {
                methodEnd = i + 1;
                break;
            }
        }
    }

    // Extract the method content
    const methodContent = serviceCode.substring(methodStart, methodEnd);

    // Find where to insert the cost center extraction (before the return statement)
    const returnIndex = methodContent.lastIndexOf('return {');
    if (returnIndex === -1) {
        console.error('❌ Could not find return statement in normalizeVouchers method');
        process.exit(1);
    }

    // Create the cost center extraction code
    const costCenterExtractionCode = `
            // Extract cost center allocations from ledger entries
            let costCentreAllocations = [];
            if (voucher.ALLLEDGERENTRIES?.LIST) {
                const entries = Array.isArray(voucher.ALLLEDGERENTRIES.LIST) 
                    ? voucher.ALLLEDGERENTRIES.LIST 
                    : [voucher.ALLLEDGERENTRIES.LIST];
                
                entries.forEach(entry => {
                    if (entry['COSTCENTREALLOCATIONS.LIST']) {
                        const ccAllocations = Array.isArray(entry['COSTCENTREALLOCATIONS.LIST'])
                            ? entry['COSTCENTREALLOCATIONS.LIST']
                            : [entry['COSTCENTREALLOCATIONS.LIST']];
                        
                        ccAllocations.forEach(cc => {
                            if (cc.NAME && cc.AMOUNT) {
                                costCentreAllocations.push({
                                    costCentre: this.safeString(cc.NAME._ || cc.NAME),
                                    amount: this.safeNumber(cc.AMOUNT._ || cc.AMOUNT),
                                    percentage: 0 // Calculate if needed
                                });
                            }
                        });
                    }
                });
            }
`;

    // Insert the cost center extraction code before the return statement
    const newMethodContent = methodContent.substring(0, returnIndex) + 
                            costCenterExtractionCode + 
                            methodContent.substring(returnIndex);

    // Add costCentreAllocations to the return object
    const updatedMethodContent = newMethodContent.replace(
        'ledgerEntries,',
        'ledgerEntries,\n                costCentreAllocations,'
    );

    // Replace the method in the service code
    const newServiceCode = serviceCode.substring(0, methodStart) + 
                          updatedMethodContent + 
                          serviceCode.substring(methodEnd);

    // Write the updated service code
    fs.writeFileSync(servicePath, newServiceCode);

    console.log('✅ Successfully updated TallyService to extract cost center data');
    console.log('📝 Changes made:');
    console.log('   - Added cost center extraction logic to normalizeVouchers()');
    console.log('   - Added costCentreAllocations to voucher return object');
    console.log('\n🔄 Next steps:');
    console.log('   1. Restart your server');
    console.log('   2. Re-sync vouchers from Tally');
    console.log('   3. Verify cost center data is now present in database');

} catch (error) {
    console.error('❌ Error fixing cost center extraction:', error.message);
    process.exit(1);
}
