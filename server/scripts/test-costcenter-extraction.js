#!/usr/bin/env node

/**
 * Test Script: Verify Cost Center Extraction from Vouchers
 * 
 * This script tests the updated TallyService to ensure cost center data
 * is properly extracted from voucher data.
 */

const fs = require('fs');
const path = require('path');
// Standalone test independent of service code

console.log('🧪 Testing Cost Center Extraction from Vouchers...\n');

// Helpers (same logic as in debug script)
const safeString = (value) => {
    if (value == null) return '';
    if (typeof value === 'object' && value._ != null) return String(value._);
    return String(value);
};

const parseTallyDate = (dateLike) => {
    const raw = safeString(dateLike).trim();
    if (!raw) return { raw: '', parsed: null };
    if (/^\d{8}$/.test(raw)) {
        const yyyy = raw.slice(0, 4);
        const mm = raw.slice(4, 6);
        const dd = raw.slice(6, 8);
        const iso = `${yyyy}-${mm}-${dd}T00:00:00.000Z`;
        const d = new Date(iso);
        return { raw, parsed: isNaN(d.getTime()) ? null : d };
    }
    const d = new Date(raw);
    return { raw, parsed: isNaN(d.getTime()) ? null : d };
};

const ensureArray = (maybeList) => (Array.isArray(maybeList) ? maybeList : [maybeList]);

const extractCostCentersFromEntry = (entry) => {
    const results = [];
    const entryLedgerName = safeString(entry?.LEDGERNAME ?? '');

    const ccDirect = entry?.['COSTCENTREALLOCATIONS.LIST'];
    if (ccDirect) {
        ensureArray(ccDirect).forEach((cc) => {
            if (cc?.NAME && cc?.AMOUNT) {
                results.push({
                    ledgerName: entryLedgerName,
                    category: '',
                    costCentre: safeString(cc.NAME._ || cc.NAME),
                    amount: Number(String(cc.AMOUNT._ || cc.AMOUNT).replace(/,/g, '')) || 0,
                });
            }
        });
    }

    const categoryList = entry?.['CATEGORYALLOCATIONS.LIST'];
    if (categoryList) {
        ensureArray(categoryList).forEach((cat) => {
            const nested = cat?.['COSTCENTREALLOCATIONS.LIST'];
            if (nested) {
                ensureArray(nested).forEach((cc) => {
                    if (cc?.NAME && cc?.AMOUNT) {
                        results.push({
                            ledgerName: entryLedgerName,
                            category: safeString(cat.CATEGORY?._ || cat.CATEGORY || ''),
                            costCentre: safeString(cc.NAME._ || cc.NAME),
                            amount: Number(String(cc.AMOUNT._ || cc.AMOUNT).replace(/,/g, '')) || 0,
                        });
                    }
                });
            }
        });
    }

    return results;
};

const extractCostCentersFromVoucher = (voucher) => {
    const listA = voucher?.['ALLLEDGERENTRIES.LIST'] || voucher?.ALLLEDGERENTRIES?.LIST || null;
    const listB = voucher?.['LEDGERENTRIES.LIST'] || voucher?.LEDGERENTRIES?.LIST || null;
    const results = [];
    if (listA) ensureArray(listA).forEach((e) => results.push(...extractCostCentersFromEntry(e)));
    if (listB) ensureArray(listB).forEach((e) => results.push(...extractCostCentersFromEntry(e)));
    return results;
};

try {
    // Read sample voucher data from the raw file
    const rawDataPath = path.join(__dirname, 'tally_vouchers_raw.json');
    
    if (!fs.existsSync(rawDataPath)) {
        console.log('❌ Raw voucher data file not found');
        console.log('📝 Please ensure tally_vouchers_raw.json exists in the scripts directory');
        process.exit(1);
    }

    console.log('📁 Reading raw voucher data...');
    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
    
    console.log('🔄 Processing vouchers (standalone parser)...');
    const normalizedVouchers = [];
    const collect = (data) => {
        if (Array.isArray(data)) return data.forEach(collect);
        if (!data || typeof data !== 'object') return;
        if (data.VOUCHER) {
            const vs = Array.isArray(data.VOUCHER) ? data.VOUCHER : [data.VOUCHER];
            vs.forEach((v) => {
                const d = parseTallyDate(v.DATE ?? v.VOUCHERDATE ?? v.BASICVOUCHERDATE ?? '');
                const costCentreAllocations = extractCostCentersFromVoucher(v);
                normalizedVouchers.push({
                    date: d.raw,
                    parsedDate: d.parsed ? d.parsed.toISOString().slice(0, 10) : 'Invalid',
                    voucherNumber: safeString(v.VOUCHERNUMBER ?? ''),
                    voucherType: safeString(v.VOUCHERTYPENAME ?? ''),
                    party: safeString(v.PARTYLEDGERNAME ?? v.PARTY ?? ''),
                    narration: safeString(v.NARRATION ?? v.REMARKS ?? ''),
                    costCentreAllocations,
                });
            });
        }
        Object.keys(data).forEach((k) => collect(data[k]));
    };
    collect(rawData);
    
    console.log(`📊 Processed ${normalizedVouchers.length} vouchers`);
    
    // Find vouchers with cost center data
    const vouchersWithCostCenters = normalizedVouchers.filter(voucher => 
        voucher.costCentreAllocations && voucher.costCentreAllocations.length > 0
    );
    
    console.log(`📊 Found ${vouchersWithCostCenters.length} vouchers with cost center allocations`);
    
    if (vouchersWithCostCenters.length > 0) {
        console.log('\n✅ SUCCESS: Cost center extraction is working!');
        console.log('\n📋 Sample vouchers with cost center data:');
        
        vouchersWithCostCenters.slice(0, 5).forEach((voucher, index) => {
            console.log(`\n${index + 1}. Voucher: ${voucher.voucherNumber} (${voucher.voucherType})`);
            console.log(`   Date: ${voucher.parsedDate} [${voucher.date}]`);
            console.log(`   Cost Center Allocations:`);
            voucher.costCentreAllocations.forEach(cc => {
                console.log(`     - ${cc.costCentre}: ${cc.amount}`);
            });
        });
        
        // Calculate statistics
        const totalCostCenterAllocations = vouchersWithCostCenters.reduce((sum, voucher) => 
            sum + voucher.costCentreAllocations.length, 0);
        
        console.log(`\n📈 Statistics:`);
        console.log(`   - Total vouchers: ${normalizedVouchers.length}`);
        console.log(`   - Vouchers with cost centers: ${vouchersWithCostCenters.length}`);
        console.log(`   - Percentage: ${((vouchersWithCostCenters.length / normalizedVouchers.length) * 100).toFixed(2)}%`);
        console.log(`   - Total cost center allocations: ${totalCostCenterAllocations}`);
        
    } else {
        console.log('\n❌ ISSUE: No vouchers found with cost center data');
        console.log('\n🔍 Debugging information:');
        
        // Check if any vouchers have the raw cost center data
        let rawVouchersWithCostCenters = 0;
        const findRawCostCenters = (data) => {
            if (Array.isArray(data)) {
                data.forEach(item => findRawCostCenters(item));
            } else if (data && typeof data === 'object') {
                if (data.VOUCHER) {
                    const vouchers = Array.isArray(data.VOUCHER) ? data.VOUCHER : [data.VOUCHER];
                    vouchers.forEach(voucher => {
                        if (voucher.ALLLEDGERENTRIES?.LIST) {
                            const entries = Array.isArray(voucher.ALLLEDGERENTRIES.LIST) 
                                ? voucher.ALLLEDGERENTRIES.LIST 
                                : [voucher.ALLLEDGERENTRIES.LIST];
                            
                            if (entries.some(entry => entry['COSTCENTREALLOCATIONS.LIST'])) {
                                rawVouchersWithCostCenters++;
                            }
                        }
                    });
                }
                Object.keys(data).forEach(key => findRawCostCenters(data[key]));
            }
        };
        
        findRawCostCenters(rawData);
        
        console.log(`   - Raw vouchers with cost center data: ${rawVouchersWithCostCenters}`);
        console.log(`   - Normalized vouchers with cost center data: ${vouchersWithCostCenters.length}`);
        
        if (rawVouchersWithCostCenters > 0 && vouchersWithCostCenters.length === 0) {
            console.log('\n🔧 The issue is in the extraction logic. Let me check the data structure...');
            
            // Find a sample voucher with cost center data
            const findSampleVoucher = (data) => {
                if (Array.isArray(data)) {
                    for (const item of data) {
                        const result = findSampleVoucher(item);
                        if (result) return result;
                    }
                } else if (data && typeof data === 'object') {
                    if (data.VOUCHER) {
                        const vouchers = Array.isArray(data.VOUCHER) ? data.VOUCHER : [data.VOUCHER];
                        for (const voucher of vouchers) {
                            if (voucher.ALLLEDGERENTRIES?.LIST) {
                                const entries = Array.isArray(voucher.ALLLEDGERENTRIES.LIST) 
                                    ? voucher.ALLLEDGERENTRIES.LIST 
                                    : [voucher.ALLLEDGERENTRIES.LIST];
                                
                                const entryWithCostCenter = entries.find(entry => entry['COSTCENTREALLOCATIONS.LIST']);
                                if (entryWithCostCenter) {
                                    return {
                                        voucherNumber: voucher.VOUCHERNUMBER?._ || voucher.VOUCHERNUMBER,
                                        voucherType: voucher.VOUCHERTYPENAME?._ || voucher.VOUCHERTYPENAME,
                                        costCenterData: entryWithCostCenter['COSTCENTREALLOCATIONS.LIST']
                                    };
                                }
                            }
                        }
                    }
                    for (const key of Object.keys(data)) {
                        const result = findSampleVoucher(data[key]);
                        if (result) return result;
                    }
                }
                return null;
            };
            
            const sampleVoucher = findSampleVoucher(rawData);
            if (sampleVoucher) {
                console.log(`\n📋 Sample voucher with cost center data:`);
                console.log(`   Voucher: ${sampleVoucher.voucherNumber} (${sampleVoucher.voucherType})`);
                console.log(`   Cost Center Data Structure:`, JSON.stringify(sampleVoucher.costCenterData, null, 2));
            }
        }
    }
    
    console.log('\n✅ Test completed');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}
