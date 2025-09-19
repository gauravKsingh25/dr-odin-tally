#!/usr/bin/env node

/**
 * Fetch Sales vouchers for a specific party (customer) and output full JSON.
 * Hardcoded Tally URL per request: http://192.168.0.183:9000/
 * Default party: ODIN HEALTHCARE PVT LTD (can override via --party="Name")
 */

const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');
const path = require('path');

const TALLY_URL = 'http://192.168.0.183:9000/';

const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true, explicitRoot: true });

const argParty = (() => {
    const arg = process.argv.find(a => a.startsWith('--party='));
    return arg ? arg.split('=').slice(1).join('=').trim() : 'ODIN HEALTHCARE PVT LTD';
})();

const safeString = (value) => {
    if (value == null) return '';
    if (typeof value === 'object' && value._ != null) return String(value._);
    return String(value);
};

const deepStringify = (value, maxLen = 500) => {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
        if (value._ != null) return String(value._);
        if (value['TEXT']) {
            const t = value['TEXT'];
            if (typeof t === 'string') return t;
            if (Array.isArray(t)) return t.filter(Boolean).join(' ').trim();
        }
        if (value['TEXT.LIST']) {
            const list = value['TEXT.LIST'];
            if (Array.isArray(list)) return list.map(deepStringify).filter(Boolean).join(' ').trim();
            return deepStringify(list);
        }
        if (value['NARRATION']) return deepStringify(value['NARRATION']);
        if (value['NARRATION.LIST']) return deepStringify(value['NARRATION.LIST']);
        const parts = [];
        const visit = (v) => {
            if (v == null) return;
            if (typeof v === 'string') { if (v.trim()) parts.push(v.trim()); return; }
            if (typeof v === 'number' || typeof v === 'boolean') { parts.push(String(v)); return; }
            if (Array.isArray(v)) { v.forEach(visit); return; }
            if (typeof v === 'object') {
                if (v['TEXT']) visit(v['TEXT']);
                if (v['TEXT.LIST']) visit(v['TEXT.LIST']);
                if (v['NAME.LIST']) visit(v['NAME.LIST']);
                Object.keys(v).forEach((k) => {
                    if (/AMOUNT|RATE|QTY|BALANCE|ID|GUID|MASTERID|ALTERID/i.test(k)) return;
                    visit(v[k]);
                });
            }
        };
        visit(value);
        const joined = Array.from(new Set(parts)).join(' ').trim();
        return joined.length > maxLen ? joined.slice(0, maxLen) : joined;
    }
    return '';
};

const safeNumber = (value) => {
    if (value == null) return 0;
    if (typeof value === 'object' && value._ != null) value = value._;
    let s = String(value).trim();
    s = s.replace(/,/g, '');
    let sign = 1;
    const hasCr = /\bCR\b/i.test(s);
    const hasDr = /\bDR\b/i.test(s);
    if (hasCr) sign = -1; else if (hasDr) sign = 1;
    s = s.replace(/\bDR\b|\bCR\b/gi, '').trim();
    if (/^\(.*\)$/.test(s)) { sign *= -1; s = s.slice(1, -1).trim(); }
    s = s.replace(/[^0-9.-]/g, '');
    if (s === '' || s === '-' || s === '.') return 0;
    const n = parseFloat(s);
    return Number.isFinite(n) ? n * sign : 0;
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

const extractNarration = (voucher) => {
    let raw = voucher?.NARRATION ?? voucher?.REMARKS ?? voucher?.['NARRATION.LIST'] ?? '';
    let str = typeof raw === 'string' ? raw : deepStringify(raw);
    if (!str && voucher?.['LANGUAGENAME.LIST']) {
        str = deepStringify(voucher['LANGUAGENAME.LIST']);
    }
    if (/^\s*\[?object\s*,?\s*object\]?\s*$/i.test(str) || /^\s*String\s*$/i.test(str)) {
        str = '';
    }
    return str || '';
};

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
                    amount: safeNumber(cc.AMOUNT._ || cc.AMOUNT),
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
                            amount: safeNumber(cc.AMOUNT._ || cc.AMOUNT),
                        });
                    }
                });
            }
        });
    }
    return results;
};

const extractLedgerEntries = (voucher) => {
    const list = voucher?.['LEDGERENTRIES.LIST'] || voucher?.LEDGERENTRIES?.LIST || null;
    if (!list) return [];
    const entries = Array.isArray(list) ? list : [list];
    return entries.map((e) => ({
        ledgerName: safeString(e.LEDGERNAME ?? ''),
        amount: safeNumber(e.AMOUNT ?? 0),
        isDebit: safeNumber(e.AMOUNT ?? 0) >= 0,
    }));
};

const extractCostCentersFromVoucher = (voucher) => {
    const listA = voucher?.['ALLLEDGERENTRIES.LIST'] || voucher?.ALLLEDGERENTRIES?.LIST || null;
    const listB = voucher?.['LEDGERENTRIES.LIST'] || voucher?.LEDGERENTRIES?.LIST || null;
    const results = [];
    if (listA) ensureArray(listA).forEach((e) => results.push(...extractCostCentersFromEntry(e)));
    if (listB) ensureArray(listB).forEach((e) => results.push(...extractCostCentersFromEntry(e)));
    return results;
};

const getVouchersPayload = (partyName, fromDate = null, toDate = null) => {
    const formatYmd = (d) => {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}${mm}${dd}`;
    };
    let from = fromDate;
    let to = toDate;
    if (!from || !to) {
        const defaultFrom = new Date('2022-01-01T00:00:00.000Z');
        const defaultTo = new Date();
        from = formatYmd(defaultFrom);
        to = formatYmd(defaultTo);
    }
    const escapedParty = partyName.replace(/&/g, '&amp;');
    return `
<ENVELOPE>
    <HEADER>
        <VERSION>1</VERSION>
        <TALLYREQUEST>Export</TALLYREQUEST>
        <TYPE>Collection</TYPE>
        <ID>Sales Vouchers For Party</ID>
    </HEADER>
    <BODY>
        <DESC>
            <STATICVARIABLES>
                <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
            </STATICVARIABLES>
            <TDL>
                <TDLMESSAGE>
                    <COLLECTION NAME="Sales Vouchers For Party" ISMODIFY="No">
                        <TYPE>Voucher</TYPE>
                        <FILTER>IsSales</FILTER>
                        <FILTER>IsParty</FILTER>
                        <FILTER>
                            <DATERANGE>
                                <FROM>${from}</FROM>
                                <TO>${to}</TO>
                            </DATERANGE>
                        </FILTER>
                        <NATIVEMETHOD>DATE</NATIVEMETHOD>
                        <NATIVEMETHOD>VOUCHERTYPENAME</NATIVEMETHOD>
                        <NATIVEMETHOD>VOUCHERNUMBER</NATIVEMETHOD>
                        <NATIVEMETHOD>REFERENCE</NATIVEMETHOD>
                        <NATIVEMETHOD>REFERENCEDATE</NATIVEMETHOD>
                        <NATIVEMETHOD>NARRATION</NATIVEMETHOD>
                        <NATIVEMETHOD>GUID</NATIVEMETHOD>
                        <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                        <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                        <NATIVEMETHOD>VOUCHERKEY</NATIVEMETHOD>
                        <NATIVEMETHOD>AMOUNT</NATIVEMETHOD>
                        <NATIVEMETHOD>PARTYLEDGERNAME</NATIVEMETHOD>
                        <NATIVEMETHOD>LEDGERENTRIES.LIST</NATIVEMETHOD>
                        <NATIVEMETHOD>ALLLEDGERENTRIES.LIST</NATIVEMETHOD>
                        <NATIVEMETHOD>CATEGORYALLOCATIONS.LIST</NATIVEMETHOD>
                        <NATIVEMETHOD>COSTCENTREALLOCATIONS.LIST</NATIVEMETHOD>
                    </COLLECTION>
                    <SYSTEM TYPE="Formulae" NAME="IsSales">$VoucherTypeName = "Sales"</SYSTEM>
                    <SYSTEM TYPE="Formulae" NAME="IsParty">$PartyLedgerName = "${escapedParty}"</SYSTEM>
                </TDLMESSAGE>
            </TDL>
        </DESC>
    </BODY>
</ENVELOPE>`;
};

const sendRequest = async (xmlPayload) => {
    const response = await axios.post(TALLY_URL, xmlPayload, {
        headers: { 'Content-Type': 'application/xml' },
        timeout: 120000,
    });
    return parser.parseStringPromise(response.data);
};

const findCollection = (parsed) => {
    const envelope = parsed?.ENVELOPE ?? parsed;
    const body = envelope?.BODY ?? envelope?.Body ?? envelope?.body;
    if (!body) return null;
    const data = body?.DATA ?? body?.Data ?? body?.data ?? null;
    if (!data) return null;
    const collection = Array.isArray(data)
        ? (data[0]?.COLLECTION ?? data[0]?.Collection)
        : (data.COLLECTION ?? data.Collection);
    return collection ?? null;
};

const normalizeVouchers = (parsed) => {
    const collection = findCollection(parsed);
    if (!collection) return [];
    let vouchers = collection.VOUCHER ?? collection.Voucher ?? null;
    if (!vouchers && Array.isArray(collection)) vouchers = collection;
    if (!vouchers) return [];
    if (!Array.isArray(vouchers)) vouchers = [vouchers];

    return vouchers.map((voucher) => {
        const rawDate = voucher.DATE ?? voucher.VOUCHERDATE ?? voucher.BASICVOUCHERDATE ?? '';
        const d = parseTallyDate(rawDate);
        let amount = safeNumber(voucher.AMOUNT);
        if (amount === 0) {
            const list = voucher?.['LEDGERENTRIES.LIST'] || voucher?.LEDGERENTRIES?.LIST || null;
            if (list) {
                const entries = Array.isArray(list) ? list : [list];
                amount = entries.reduce((acc, e) => acc + safeNumber(e.AMOUNT ?? e.CLOSINGBALANCE ?? 0), 0);
            }
        }

        const costCentreAllocations = extractCostCentersFromVoucher(voucher);
        const ledgerEntries = extractLedgerEntries(voucher);
        const narration = extractNarration(voucher);
        const partyRaw = voucher.PARTYLEDGERNAME ?? voucher.PARTY ?? '';
        const party = typeof partyRaw === 'string' ? partyRaw : deepStringify(partyRaw);

        return {
            voucherNumber: safeString(voucher.VOUCHERNUMBER ?? voucher.VOUCHERKEY ?? ''),
            voucherType: safeString(voucher.VOUCHERTYPENAME ?? voucher.VOUCHERTYPE ?? ''),
            date: d.raw,
            parsedDate: d.parsed ? d.parsed.toISOString().slice(0, 10) : 'Invalid',
            party: party,
            narration: narration,
            amount,
            guid: safeString(voucher.GUID ?? ''),
            masterId: safeString(voucher.MASTERID ?? ''),
            voucherKey: safeString(voucher.VOUCHERKEY ?? ''),
            ledgerEntries,
            costCentreAllocations,
        };
    });
};

(async () => {
    try {
        const useOffline = process.argv.includes('--offline');
        const partyName = argParty;
        console.log(`🚀 Fetching Sales vouchers for party "${partyName}" ${useOffline ? '(offline fallback)' : 'from Tally'}...`);
        const xmlPayload = getVouchersPayload(partyName);
        let parsed = null;
        if (useOffline) {
            const fallbackPath = path.join(__dirname, 'tally_vouchers_raw.json');
            if (!fs.existsSync(fallbackPath)) throw new Error('Fallback file tally_vouchers_raw.json not found');
            parsed = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
            console.log('📦 Loaded local raw vouchers. Parsing...');
        } else {
            try {
                parsed = await sendRequest(xmlPayload);
                console.log('📦 Response received from Tally. Parsing...');
            } catch (netErr) {
                console.warn('⚠️  Tally request failed:', netErr.message);
                const fallbackPath = path.join(__dirname, 'tally_vouchers_raw.json');
                if (fs.existsSync(fallbackPath)) {
                    console.log('🔁 Using local fallback file tally_vouchers_raw.json');
                    parsed = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
                } else {
                    throw netErr;
                }
            }
        }

        // Normalize and then filter by party (case-insensitive) in case server-side filter missed variants
        const all = normalizeVouchers(parsed);
        const vouchers = all.filter(v => v.voucherType.toLowerCase() === 'sales' && v.party.toLowerCase().includes(partyName.toLowerCase()));
        const vouchersWithCC = vouchers.filter(v => v.costCentreAllocations && v.costCentreAllocations.length > 0);
        const out = {
            metadata: {
                generatedAt: new Date().toISOString(),
                tallyUrl: TALLY_URL,
                description: `Sales vouchers for party ${partyName} with narration and cost centres` ,
                party: partyName,
                summary: {
                    totalVouchers: vouchers.length,
                    vouchersWithCostCenters: vouchersWithCC.length,
                    vouchersWithoutCostCenters: vouchers.length - vouchersWithCC.length,
                    dateRange: {
                        earliest: vouchers.reduce((min, v) => (!min || v.date < min ? v.date : min), null),
                        latest: vouchers.reduce((max, v) => (!max || v.date > max ? v.date : max), null),
                    },
                    voucherTypes: Array.from(new Set(vouchers.map(v => v.voucherType).filter(Boolean))).sort(),
                    uniqueCostCenters: Array.from(new Set(vouchers.flatMap(v => v.costCentreAllocations.map(cc => cc.costCentre)).filter(Boolean))).sort(),
                },
            },
            vouchers,
        };

        const sanitized = partyName.toLowerCase().replace(/[^a-z0-9]+/gi, '-');
        const outPath = path.join(__dirname, `sales-vouchers-${sanitized}.json`);
        fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
        console.log(`✅ JSON written to ${outPath}`);

        console.log('\n— Preview —');
        console.log(JSON.stringify({
            party: partyName,
            total: vouchers.length,
            withCostCenters: vouchersWithCC.length,
            sample: vouchers.slice(0, 3)
        }, null, 2));

        process.exit(0);
    } catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
})();



