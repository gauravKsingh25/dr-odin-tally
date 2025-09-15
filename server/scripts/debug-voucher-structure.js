#!/usr/bin/env node

/**
 * Debug Script: Analyze Voucher Structure for Cost Centers
 * 
 * This script helps understand the exact structure of voucher data
 * to identify where cost center information is stored.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Debugging Voucher Structure for Cost Centers...\n');

// Helpers
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
    // Read raw voucher data
    const rawDataPath = path.join(__dirname, 'tally_vouchers_raw.json');
    const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
    
    console.log('📁 Raw data loaded successfully');
    
    // Walk vouchers and report cost centres and dates
    const found = [];
    const visit = (obj, path = '') => {
        if (!obj) return;
        if (Array.isArray(obj)) {
            obj.forEach((it, i) => visit(it, `${path}[${i}]`));
            return;
        }
        if (typeof obj !== 'object') return;

        if (obj.VOUCHER) {
            const vs = Array.isArray(obj.VOUCHER) ? obj.VOUCHER : [obj.VOUCHER];
            vs.forEach((v, i) => {
                const cc = extractCostCentersFromVoucher(v);
                if (cc.length > 0) {
                    const d = parseTallyDate(v.DATE ?? v.VOUCHERDATE ?? v.BASICVOUCHERDATE ?? '');
                    found.push({
                        path: `${path}.VOUCHER[${i}]`,
                        voucherNumber: safeString(v.VOUCHERNUMBER ?? ''),
                        voucherType: safeString(v.VOUCHERTYPENAME ?? ''),
                        dateRaw: d.raw,
                        dateParsed: d.parsed ? d.parsed.toISOString().slice(0, 10) : 'Invalid',
                        costCenters: cc,
                    });
                }
            });
        }

        Object.keys(obj).forEach((k) => visit(obj[k], `${path}.${k}`));
    };

    console.log('🔍 Scanning vouchers for cost center data...');
    visit(rawData, 'ROOT');

    if (found.length === 0) {
        console.log('❌ No vouchers with cost centre allocations found.');
    } else {
        console.log(`✅ Found ${found.length} voucher(s) with cost centre allocations.`);
        found.slice(0, 5).forEach((f, idx) => {
            console.log(`\n#${idx + 1} ${f.voucherNumber} (${f.voucherType}) @ ${f.dateParsed} [${f.dateRaw}]`);
            console.log(`   Path: ${f.path}`);
            f.costCenters.forEach((c) => {
                console.log(`   - ${c.ledgerName} :: ${c.category ? c.category + ' / ' : ''}${c.costCentre} => ${c.amount}`);
            });
        });
    }
    
} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack trace:', error.stack);
}

console.log('\n✅ Debug completed');
