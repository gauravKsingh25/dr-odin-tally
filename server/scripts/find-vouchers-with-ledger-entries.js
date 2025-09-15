#!/usr/bin/env node

/**
 * Find Vouchers with Ledger Entries
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Finding Vouchers with ALLLEDGERENTRIES.LIST...\n');

try {
    const rawDataPath = path.join(__dirname, 'tally_vouchers_raw.json');
    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
    
    const vouchers = rawData.ENVELOPE.BODY.DATA.COLLECTION.VOUCHER;
    console.log(`📊 Total vouchers: ${vouchers.length}`);
    
    const vouchersWithLedgerEntries = [];
    const vouchersWithCostCenters = [];
    
    vouchers.forEach((voucher, index) => {
        if (voucher.ALLLEDGERENTRIES?.LIST) {
            vouchersWithLedgerEntries.push({
                index,
                voucherNumber: voucher.VOUCHERNUMBER?._ || voucher.VOUCHERNUMBER,
                voucherType: voucher.VOUCHERTYPENAME?._ || voucher.VOUCHERTYPENAME,
                date: voucher.DATE?._ || voucher.DATE
            });
            
            // Check for cost center data
            const entries = Array.isArray(voucher.ALLLEDGERENTRIES.LIST) 
                ? voucher.ALLLEDGERENTRIES.LIST 
                : [voucher.ALLLEDGERENTRIES.LIST];
            
            let hasCostCenters = false;
            entries.forEach(entry => {
                if (entry['CATEGORYALLOCATIONS.LIST']) {
                    const categoryAllocations = Array.isArray(entry['CATEGORYALLOCATIONS.LIST'])
                        ? entry['CATEGORYALLOCATIONS.LIST']
                        : [entry['CATEGORYALLOCATIONS.LIST']];
                    
                    categoryAllocations.forEach(category => {
                        if (category['COSTCENTREALLOCATIONS.LIST']) {
                            hasCostCenters = true;
                        }
                    });
                }
            });
            
            if (hasCostCenters) {
                vouchersWithCostCenters.push({
                    index,
                    voucherNumber: voucher.VOUCHERNUMBER?._ || voucher.VOUCHERNUMBER,
                    voucherType: voucher.VOUCHERTYPENAME?._ || voucher.VOUCHERTYPENAME,
                    date: voucher.DATE?._ || voucher.DATE
                });
            }
        }
    });
    
    console.log(`📊 Vouchers with ALLLEDGERENTRIES.LIST: ${vouchersWithLedgerEntries.length}`);
    console.log(`📊 Vouchers with cost center data: ${vouchersWithCostCenters.length}`);
    
    if (vouchersWithLedgerEntries.length > 0) {
        console.log('\n📋 First 5 vouchers with ledger entries:');
        vouchersWithLedgerEntries.slice(0, 5).forEach((v, i) => {
            console.log(`   ${i + 1}. [${v.index}] ${v.voucherNumber} (${v.voucherType}) - ${v.date}`);
        });
    }
    
    if (vouchersWithCostCenters.length > 0) {
        console.log('\n📋 Vouchers with cost center data:');
        vouchersWithCostCenters.slice(0, 10).forEach((v, i) => {
            console.log(`   ${i + 1}. [${v.index}] ${v.voucherNumber} (${v.voucherType}) - ${v.date}`);
        });
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
}

console.log('\n✅ Search completed');
