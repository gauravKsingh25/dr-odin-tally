#!/usr/bin/env node

/**
 * Simple Test: Cost Center Extraction
 */

const fs = require('fs');
const path = require('path');
const TallyService = require('../services/tallyService');

console.log('🧪 Simple Cost Center Extraction Test...\n');

try {
    const tallyService = new TallyService();
    
    // Read raw data
    const rawDataPath = path.join(__dirname, 'tally_vouchers_raw.json');
    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
    
    // Get the first few vouchers
    const vouchers = rawData.ENVELOPE.BODY.DATA.COLLECTION.VOUCHER.slice(0, 5);
    
    console.log(`📊 Testing with ${vouchers.length} vouchers`);
    
    vouchers.forEach((voucher, index) => {
        console.log(`\n📋 Voucher ${index + 1}:`);
        console.log(`   Number: ${voucher.VOUCHERNUMBER?._ || voucher.VOUCHERNUMBER}`);
        console.log(`   Type: ${voucher.VOUCHERTYPENAME?._ || voucher.VOUCHERTYPENAME}`);
        
        // Check if it has ALLLEDGERENTRIES
        if (voucher.ALLLEDGERENTRIES?.LIST) {
            console.log(`   ✅ Has ALLLEDGERENTRIES.LIST`);
            
            const entries = Array.isArray(voucher.ALLLEDGERENTRIES.LIST) 
                ? voucher.ALLLEDGERENTRIES.LIST 
                : [voucher.ALLLEDGERENTRIES.LIST];
            
            console.log(`   📊 ${entries.length} ledger entries`);
            
            entries.forEach((entry, entryIndex) => {
                if (entry['CATEGORYALLOCATIONS.LIST']) {
                    console.log(`     ✅ Entry ${entryIndex + 1} has CATEGORYALLOCATIONS.LIST`);
                    
                    const categoryAllocations = Array.isArray(entry['CATEGORYALLOCATIONS.LIST'])
                        ? entry['CATEGORYALLOCATIONS.LIST']
                        : [entry['CATEGORYALLOCATIONS.LIST']];
                    
                    categoryAllocations.forEach(category => {
                        if (category['COSTCENTREALLOCATIONS.LIST']) {
                            console.log(`       ✅ Has COSTCENTREALLOCATIONS.LIST`);
                            console.log(`       📊 Cost Center: ${category['COSTCENTREALLOCATIONS.LIST'].NAME._}`);
                            console.log(`       💰 Amount: ${category['COSTCENTREALLOCATIONS.LIST'].AMOUNT._}`);
                        }
                    });
                }
            });
        } else {
            console.log(`   ❌ No ALLLEDGERENTRIES.LIST`);
        }
    });
    
    // Now test the TallyService extraction
    console.log('\n🔄 Testing TallyService extraction...');
    const normalizedVouchers = tallyService.normalizeVouchers(rawData);
    
    const vouchersWithCostCenters = normalizedVouchers.filter(v => 
        v.costCentreAllocations && v.costCentreAllocations.length > 0
    );
    
    console.log(`📊 Found ${vouchersWithCostCenters.length} vouchers with cost centers`);
    
    if (vouchersWithCostCenters.length > 0) {
        console.log('\n✅ SUCCESS! Cost center extraction is working');
        vouchersWithCostCenters.slice(0, 3).forEach((voucher, index) => {
            console.log(`\n${index + 1}. ${voucher.voucherNumber} (${voucher.voucherType})`);
            voucher.costCentreAllocations.forEach(cc => {
                console.log(`   - ${cc.costCentre}: ${cc.amount}`);
            });
        });
    } else {
        console.log('\n❌ No cost centers extracted');
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
}

console.log('\n✅ Test completed');
