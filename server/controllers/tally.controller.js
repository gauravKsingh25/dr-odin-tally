// Export all controller functions explicitly for reliability
// ...existing code...
const tallyModel = require("../models/tally.model");
const TallyLedger = require("../models/tallyLedger.model");
const TallyVoucher = require("../models/tallyVoucher.model");
const TallyStockItem = require("../models/tallyStockItem.model");
const TallyCompany = require("../models/tallyCompany.model");
const TallyGroup = require("../models/tallyGroup.model");
const TallyCostCenter = require("../models/tallyCostCenter.model");
const TallyCurrency = require("../models/tallyCurrency.model");
const monthModel = require("../models/month.model");
const RateDiffModel = require("../models/rateDifference.model");
const ChqBounceModel = require("../models/chequeBounce.model");
const TallyService = require("../services/tallyService");
const { default: mongoose } = require("mongoose");

const date = new Date();
const tallyService = new TallyService();

// Helper function to parse Tally dates (YYYYMMDD format)
function parseTallyDate(dateStr) {
    if (!dateStr) return null;
    
    // Handle different date formats from Tally
    if (typeof dateStr === 'string') {
        // Format: "20250401" (YYYYMMDD)
        if (dateStr.match(/^\d{8}$/)) {
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            return new Date(`${year}-${month}-${day}`);
        }
        // Format: "2025-04-01" or other ISO formats
        if (dateStr.includes('-') || dateStr.includes('/')) {
            const parsed = new Date(dateStr);
            return isNaN(parsed.getTime()) ? null : parsed;
        }
    }
    
    // If it's already a Date object
    if (dateStr instanceof Date) {
        return isNaN(dateStr.getTime()) ? null : dateStr;
    }
    
    return null;
}


exports.CreateTallyReport = async (req, res) => {
    const data = req.body;
    const companyId = mongoose.Types.ObjectId(mongoose.Types.ObjectId(req.userid));
    var tallyData = [];

    try {
        if (data.length > 0) {

            for (var i = 0; i < data.length; i++) {

                if (data[i].product.length > 0) {
                    for (let j = 0; j < data[i].product.length; j++) {

                        // pcs
                        let pcs_split = 0; productPcs = 0;
                        pcs_split = data[i].totalPcs[j].split(" ");
                        productPcs = pcs_split[0];

                        //netAmount
                        let nAmt_split = 0; let netAmount = 0;
                        nAmt_split = data[i].tax[0].split(" ");
                        netAmount = nAmt_split[0];

                        //tax
                        let tax_split = 0; let tax = 0;
                        tax_split = data[i].tax[1].split(" ");
                        tax = tax_split[0];

                        //date  
                        let dateformat;
                        let rawDate = data[i]?.date?.[0];
                        if (rawDate && !isNaN(Date.parse(rawDate))) {
                            dateformat = new Date(rawDate);
                            dateformat.setDate(dateformat.getDate() + 1);
                        } else {
                            dateformat = null; // or skip this record, or set to new Date()
                        }

                        const tallyObj = {
                            date: dateformat,
                            company: data[i]?.company[0],
                            product: data[i]?.product[j],
                            employee: data[i]?.employee[0],
                            invoice: data[i]?.invoice[0],
                            totalPcs: data[i]?.totalPcs[j],
                            productPcs: productPcs,
                            productPrice: data[i]?.productPrize[j],
                            totalAmount: data[i]?.netAmount[0],
                            tax: tax,
                            netAmount: netAmount,
                            companyid: companyId,
                            monthId: data[i]?.monthId[0],
                            year: date.getFullYear()
                        }


                        let check = {
                            $and: [
                                { date: dateformat },
                                { invoice: data[i].invoice[0] },
                                { company: data[i].company[0] },
                                { employee: data[i].employee[0] },
                                { product: data[i]?.product[j] },
                                { companyid: companyId },
                                { monthId: data[i].monthId[0] },
                                { year: date.getFullYear() }
                            ]
                        };

                        var tally_resp = await tallyModel.updateOne(check, { $set: tallyObj }, { upsert: true });
                        if (tally_resp) { tallyData.push(tally_resp); }
                    }
                    if (data.length - 1 == i) {
                        res.status(200).json({ status: 201, message: "Successfully Uploaded", response: tallyData });
                    }
                } else { return res.status(200).json({ status: 401, message: "Upload Correct File" }) }
            }
        }
        else {
            return res.status(200).json({ status: 401, message: "Not Uploaded", response: tallyData });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};


// ------------ Rate Difference --------------------
exports.RateDifference = async (req, res) => {
    let rateDiff = [];
    const data = req.body;
    const companyId = mongoose.Types.ObjectId(req.userid);

    try {
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].vchNo[0].length > 0) {
                    // igst
                    let igst_split = 0; let igst = 0;
                    igst_split = data[i].igst[0].split(" ");
                    igst = igst_split[0];

                    // igst_purchase
                    let igstP_split = 0; let igstP = 0;
                    igstP_split = data[i].igstPurchase[0].split(" ");
                    igstP = igstP_split[0];

                    // date
                    let dateformat;
                    let rawDate = data[i]?.date?.[0];
                    if (rawDate && !isNaN(Date.parse(rawDate))) {
                        dateformat = new Date(rawDate);
                        dateformat.setDate(dateformat.getDate() + 1);
                    } else {
                        dateformat = null;
                    }


                    const obj = {
                        date: dateformat,
                        vendor: data[i].vendor[0],
                        employee: data[i].employee[0],
                        vchNo: data[i].vchNo[0],
                        totalAmt: data[i].totalAmt[0],
                        igstPurchase: igstP,
                        igst: igst,
                        companyid: companyId,
                        monthId: data[i].monthId[0],
                        year: date.getFullYear()
                    }

                    const check = {
                        $and: [
                            { date: dateformat },
                            { vendor: data[i].vendor },
                            { employee: data[i].employee },
                            { vchNo: data[i].vchNo },
                            { monthId: data[i].monthId },
                            { companyid: companyId },
                            { year: date.getFullYear() }
                        ]
                    }

                    const rateDiff_resp = await RateDiffModel.updateOne(check, { $set: obj }, { upsert: true });
                    if (rateDiff_resp) { rateDiff.push(rateDiff_resp); }

                    if (data.length - 1 == i) {
                        return res.status(200).json({ status: 200, message: "Successfully Uploaded", response: rateDiff });
                    }
                } else {
                    return res.status(200).json({ status: 401, message: "Upload Correct File" });
                }
            }
        } else {
            return res.status(200).json({ status: 401, message: "Not Uploaded" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};


// -------------- Cheque Bounce ------------------
exports.ChequeBounce = async (req, res) => {
    let cqBounce = [];
    const data = req.body;
    const companyId = mongoose.Types.ObjectId(req.userid);

    try {
        for (var i = 0; i < data.length; i++) {

            let dateformat;
            let rawDate = data[i]?.date;
            if (rawDate && !isNaN(Date.parse(rawDate))) {
                dateformat = new Date(rawDate);
                dateformat.setDate(dateformat.getDate() + 1);
            } else {
                dateformat = null;
            }

            if (data[i].vchNo) {
                const obj = {
                    date: dateformat,
                    seller: data[i].seller,
                    vchNo: data[i].vchNo,
                    vchType: data[i].vchType,
                    debit: data[i].debit,
                    credit: data[i].credit,
                    companyid: companyId,
                    monthId: data[i].monthId,
                    year: date.getFullYear()
                }

                let check = {
                    $and: [
                        { date: dateformat },
                        { seller: data[i].seller },
                        { vchNo: data[i].vchNo },
                        { vchType: data[i].vchType },
                        { companyid: companyId }
                    ]
                }

                const cqBounce_resp = await ChqBounceModel.updateOne(check, { $set: obj }, { upsert: true });
                if (cqBounce_resp) { cqBounce.push(cqBounce_resp); }

                if (data.length - 1 == i) {
                    return res.status(200).json({ status: 200, message: "Successfully Upload", response: cqBounce });
                }
            } else {
                res.status(200).json({ status: 401, message: "Upload Correct File" });
            }
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
}

// ============= NEW TALLY INTEGRATION CONTROLLERS =============

// Progress state for background voucher fetch
const voucherFetchState = {
    isRunning: false,
    startedAt: null,
    completedAt: null,
    batchCount: 0,
    batchTotal: 0,
    percent: 0,
    totals: { vouchers: 0, products: 0, vendors: 0, executives: 0 },
    lastBatch: null,
    errors: []
};

function resetVoucherFetchState() {
    voucherFetchState.isRunning = false;
    voucherFetchState.startedAt = null;
    voucherFetchState.completedAt = null;
    voucherFetchState.batchCount = 0;
    voucherFetchState.batchTotal = 0;
    voucherFetchState.percent = 0;
    voucherFetchState.totals = { vouchers: 0, products: 0, vendors: 0, executives: 0 };
    voucherFetchState.lastBatch = null;
    voucherFetchState.errors = [];
}

exports.getVoucherFetchStatus = (req, res) => {
    res.status(200).json({
        status: 200,
        data: {
            ...voucherFetchState
        }
    });
};

async function runVoucherFetch(companyId) {
    const VendorTransaction = require('../models/vendorTransaction.model');
    const SalesExecutive = require('../models/salesExecutive.model');

    voucherFetchState.isRunning = true;
    voucherFetchState.startedAt = new Date();
    voucherFetchState.completedAt = null;
    voucherFetchState.batchCount = 0;
    voucherFetchState.percent = 0;
    voucherFetchState.totals = { vouchers: 0, products: 0, vendors: 0, executives: 0 };
    voucherFetchState.errors = [];

    try {
        console.log('🔄 Starting voucher fetch process...');
        console.log(`📊 Company ID: ${companyId}`);

        // Clear existing voucher collections first
        console.log('🗑️ Clearing existing voucher data...');
        await Promise.all([
            TallyVoucher.deleteMany({ companyId }),
            tallyModel.deleteMany({ companyId }),
            VendorTransaction.deleteMany({ companyId }),
            SalesExecutive.deleteMany({ companyId })
        ]);
        console.log('✅ Existing voucher data cleared successfully');

        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 30);
        const toDate = new Date();
        const batchDays = 7;
        let start = new Date(fromDate);
        let end = new Date(toDate);

        // compute total batches first
        voucherFetchState.batchTotal = Math.ceil(((end - start) / (1000 * 60 * 60 * 24) + 1) / batchDays);

        while (start <= end && voucherFetchState.isRunning) {
            voucherFetchState.batchCount++;
            let batchStart = new Date(start);
            let batchEnd = new Date(start);
            batchEnd.setDate(batchEnd.getDate() + batchDays - 1);
            if (batchEnd > end) batchEnd = new Date(end);

            const batchFrom = batchStart.toISOString().split('T')[0].replace(/-/g, '');
            const batchTo = batchEnd.toISOString().split('T')[0].replace(/-/g, '');

            let voucherData;
            try {
                voucherData = await tallyService.fetchVouchers(batchFrom, batchTo);
            } catch (err) {
                const msg = `Voucher batch ${batchFrom}-${batchTo} error: ${err.message}`;
                console.error(msg);
                voucherFetchState.errors.push(msg);
                start.setDate(start.getDate() + batchDays);
                voucherFetchState.percent = Math.round((voucherFetchState.batchCount / Math.max(1, voucherFetchState.batchTotal)) * 100);
                voucherFetchState.lastBatch = { range: `${batchFrom}-${batchTo}`, count: 0 };
                continue;
            }

            const normalizedVouchers = tallyService.normalizeVouchers(voucherData);
            const batchVoucherCount = normalizedVouchers.length;

            // Log batch progress
            voucherFetchState.percent = Math.round((voucherFetchState.batchCount / Math.max(1, voucherFetchState.batchTotal)) * 100);
            voucherFetchState.lastBatch = { range: `${batchFrom}-${batchTo}`, count: batchVoucherCount };
            console.log(`Voucher batch ${voucherFetchState.batchCount}/${voucherFetchState.batchTotal} (${batchFrom}-${batchTo}): ${batchVoucherCount} vouchers. Progress: ${voucherFetchState.percent}%`);

            for (const voucher of normalizedVouchers) {
                try {
                    // Parse date using helper function
                    let parsedDate = parseTallyDate(voucher.date);

                    // Skip voucher if critical data is missing
                    if (!voucher.voucherNumber) {
                        console.warn(`Skipping voucher with missing voucher number:`, voucher);
                        continue;
                    }

                    const query = voucher.guid && voucher.guid.trim() !== ''
                        ? { guid: voucher.guid }
                        : {
                            voucherNumber: voucher.voucherNumber,
                            ...(parsedDate && { date: parsedDate }),
                            companyId,
                            guid: { $in: [null, ''] }
                        };
                    await TallyVoucher.updateOne(
                        query,
                        {
                            $set: {
                                ...voucher,
                                ...(voucher.raw || {}),
                                companyId,
                                date: parsedDate,
                                year: parsedDate ? parsedDate.getFullYear() : null,
                                lastUpdated: new Date()
                            }
                        },
                        { upsert: true }
                    );
                    voucherFetchState.totals.vouchers++;

                    // --- Product sales extraction (existing tallyModel) ---
                    let inventory = voucher.raw?.INVENTORYENTRIES?.LIST || voucher.raw?.['INVENTORYENTRIES.LIST'] || [];
                    if (!Array.isArray(inventory)) inventory = [inventory];
                    for (const item of inventory) {
                        const productObj = {
                            ...item,
                            date: parsedDate,
                            company: voucher.party,
                            product: item.STOCKITEMNAME || item.STOCKITEM || '',
                            employee: '',
                            invoice: voucher.voucherNumber,
                            totalPcs: item.BILLEDQTY || item.ACTUALQTY || '',
                            productPcs: item.BILLEDQTY || item.ACTUALQTY || '',
                            productPrice: item.AMOUNT || 0,
                            totalAmount: item.AMOUNT || 0,
                            tax: '',
                            netAmount: item.AMOUNT || 0,
                            companyid: companyId,
                            monthId: null,
                            year: parsedDate ? parsedDate.getFullYear() : date.getFullYear()
                        };
                        await tallyModel.updateOne(
                            {
                                ...(productObj.date && { date: productObj.date }),
                                invoice: productObj.invoice,
                                company: productObj.company,
                                product: productObj.product,
                                companyid: companyId,
                                year: productObj.year
                            },
                            { $set: productObj },
                            { upsert: true }
                        );
                        voucherFetchState.totals.products++;
                    }

                    // --- Vendor transaction extraction ---
                    if ((voucher.voucherType && voucher.voucherType.toLowerCase().includes('purchase')) || (voucher.party)) {
                        const vendorObj = {
                            ...voucher,
                            date: parsedDate,
                            voucherNumber: voucher.voucherNumber,
                            voucherType: voucher.voucherType,
                            vendorName: voucher.party,
                            amount: voucher.amount,
                            narration: voucher.narration,
                            companyId,
                            year: parsedDate ? parsedDate.getFullYear() : date.getFullYear(),
                            lastUpdated: new Date()
                        };
                        await VendorTransaction.updateOne(
                            {
                                ...(vendorObj.date && { date: vendorObj.date }),
                                voucherNumber: vendorObj.voucherNumber,
                                vendorName: vendorObj.vendorName,
                                companyId,
                                year: vendorObj.year
                            },
                            { $set: vendorObj },
                            { upsert: true }
                        );
                        voucherFetchState.totals.vendors++;
                    }

                    // --- Sales executive extraction ---
                    let execName = '';
                    if (voucher.narration && voucher.narration.toLowerCase().includes('sales by')) {
                        const match = voucher.narration.match(/sales by[:\-]?\s*([a-zA-Z .]+)/i);
                        if (match && match[1]) execName = match[1].trim();
                    }
                    let costCenter = '';
                    if (voucher.raw?.COSTCENTRENAME) costCenter = String(voucher.raw.COSTCENTRENAME);
                    else if (voucher.raw?.COSTCENTRE && voucher.raw.COSTCENTRE.NAME) costCenter = String(voucher.raw.COSTCENTRE.NAME);
                    if (!execName && costCenter) execName = costCenter;
                    if (execName) {
                        const execObj = {
                            ...voucher,
                            date: parsedDate,
                            voucherNumber: voucher.voucherNumber,
                            voucherType: voucher.voucherType,
                            party: voucher.party,
                            executive: execName,
                            amount: voucher.amount,
                            narration: voucher.narration,
                            companyId,
                            year: parsedDate ? parsedDate.getFullYear() : date.getFullYear(),
                            lastUpdated: new Date()
                        };
                        await SalesExecutive.updateOne(
                            {
                                ...(execObj.date && { date: execObj.date }),
                                voucherNumber: execObj.voucherNumber,
                                executive: execObj.executive,
                                companyId,
                                year: execObj.year
                            },
                            { $set: execObj },
                            { upsert: true }
                        );
                        voucherFetchState.totals.executives++;
                    }
                } catch (voucherError) {
                    console.error(`Error processing voucher ${voucher.voucherNumber}:`, voucherError.message);
                    voucherFetchState.errors.push(`Voucher ${voucher.voucherNumber} error: ${voucherError.message}`);
                }
            }

            start.setDate(start.getDate() + batchDays);
        }

        voucherFetchState.isRunning = false;
        voucherFetchState.completedAt = new Date();
        console.log('Tally voucher fetch completed:', {
            vouchers: voucherFetchState.totals.vouchers,
            products: voucherFetchState.totals.products,
            vendors: voucherFetchState.totals.vendors,
            executives: voucherFetchState.totals.executives,
            errors: voucherFetchState.errors.length
        });
    } catch (error) {
        console.error('Voucher fetch error:', error);
        voucherFetchState.isRunning = false;
        voucherFetchState.completedAt = new Date();
        voucherFetchState.errors.push(error.message);
    }
}

// Sync all data from Tally
exports.syncTallyData = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        
        console.log('🔄 Starting full Tally data sync...');
        console.log(`📊 Company ID: ${companyId}`);
        
        // Clear existing Tally collections first (excluding vouchers)
        console.log('🗑️ Clearing existing Tally data (excluding vouchers)...');
        const clearResults = await Promise.all([
            TallyCompany.deleteMany({ companyId }),
            TallyLedger.deleteMany({ companyId }),
            TallyStockItem.deleteMany({ companyId }),
            TallyGroup.deleteMany({ companyId }),
            TallyCostCenter.deleteMany({ companyId }),
            TallyCurrency.deleteMany({ companyId })
        ]);
        console.log('✅ Existing Tally data cleared successfully');
        console.log(`🗑️ Cleared: ${clearResults[0].deletedCount} companies, ${clearResults[1].deletedCount} ledgers, ${clearResults[2].deletedCount} stock items, ${clearResults[3].deletedCount} groups, ${clearResults[4].deletedCount} cost centers, ${clearResults[5].deletedCount} currencies`);
        
        const result = {
            companies: 0,
            ledgers: 0,
            vouchers: 0,
            stockItems: 0,
            groups: 0,
            costCenters: 0,
            currencies: 0,
            errors: [],
            clearedCount: clearResults.reduce((sum, res) => sum + res.deletedCount, 0)
        };

        // Sync Company Info (parse and store all fields)
        try {
            console.log('📊 Fetching company information...');
            const companyData = await tallyService.fetchCompanyInfo();
            const normalizedCompany = tallyService.normalizeCompanyInfo(companyData);
            if (normalizedCompany && normalizedCompany.length > 0) {
                for (const company of normalizedCompany) {
                    const raw = company.rawData || {};
                    const query = company.guid && company.guid.trim() !== '' 
                        ? { guid: company.guid }
                        : { name: company.name, companyId, guid: { $in: [null, ''] } };
                    await TallyCompany.updateOne(
                        query,
                        { 
                            $set: { 
                                ...company,
                                ...raw,
                                companyId, 
                                year: date.getFullYear(),
                                lastSyncedAt: new Date()
                            } 
                        },
                        { upsert: true }
                    );
                }
                result.companies = normalizedCompany.length;
                console.log(`✅ Synced ${result.companies} companies`);
            }
        } catch (error) {
            result.errors.push(`Company sync error: ${error.message}`);
            console.error(`❌ Company sync error: ${error.message}`);
        }

        // Sync Ledgers (parse and store all fields)
        try {
            console.log('📊 Fetching ledgers...');
            const ledgerData = await tallyService.fetchLedgers();
            const normalizedLedgers = tallyService.normalizeLedgers(ledgerData);
            
            // Debug: Log sample ledger data to check balance processing
            if (normalizedLedgers.length > 0) {
                const sampleLedger = normalizedLedgers[0];
                console.log('🔍 Sample ledger data:');
                console.log(`   Name: ${sampleLedger.name}`);
                console.log(`   Opening Balance: ${sampleLedger.openingBalance}`);
                console.log(`   Closing Balance: ${sampleLedger.closingBalance}`);
                console.log(`   Raw Data Keys: ${Object.keys(sampleLedger.rawData || {}).slice(0, 10).join(', ')}`);
            }
            
            for (const ledger of normalizedLedgers) {
                const raw = ledger.rawData || {};
                const query = ledger.guid && ledger.guid.trim() !== '' 
                    ? { guid: ledger.guid }
                    : { name: ledger.name, companyId, guid: { $in: [null, ''] } };
                
                // Ensure balance data is properly processed (don't let raw data overwrite processed values)
                const ledgerToStore = {
                    ...raw, // Raw data first
                    ...ledger, // Processed data second (this will override raw with processed values)
                    companyId, 
                    year: date.getFullYear(),
                    lastUpdated: new Date()
                };
                
                // Debug: Log balance data for first few ledgers
                if (result.ledgers < 3) {
                    console.log(`🔍 Ledger ${result.ledgers + 1}: ${ledger.name}`);
                    console.log(`   Opening: ${ledger.openingBalance}, Closing: ${ledger.closingBalance}`);
                }
                
                await TallyLedger.updateOne(
                    query,
                    { $set: ledgerToStore },
                    { upsert: true }
                );
                result.ledgers++;
            }
            console.log(`✅ Synced ${result.ledgers} ledgers`);
        } catch (error) {
            result.errors.push(`Ledgers sync error: ${error.message}`);
            console.error(`❌ Ledgers sync error: ${error.message}`);
        }

        // Sync Groups (parse and store all fields)
        try {
            console.log('📊 Fetching groups...');
            const groupsData = await tallyService.fetchGroups();
            const normalizedGroups = tallyService.normalizeGroups(groupsData);
            for (const group of normalizedGroups) {
                const raw = group.rawData || {};
                const query = group.guid && group.guid.trim() !== '' 
                    ? { guid: group.guid }
                    : { name: group.name, companyId, guid: { $in: [null, ''] } };
                await TallyGroup.updateOne(
                    query,
                    { 
                        $set: { 
                            ...group,
                            ...raw,
                            companyId, 
                            year: date.getFullYear(),
                            lastUpdated: new Date()
                        } 
                    },
                    { upsert: true }
                );
            }
            result.groups = normalizedGroups.length;
            console.log(`✅ Synced ${result.groups} groups`);
        } catch (error) {
            result.errors.push(`Groups sync error: ${error.message}`);
            console.error(`❌ Groups sync error: ${error.message}`);
        }

        // Sync Currencies (parse and store all fields)
        try {
            console.log('📊 Fetching currencies...');
            const currenciesData = await tallyService.fetchCurrencies();
            const normalizedCurrencies = tallyService.normalizeCurrencies(currenciesData);
            for (const currency of normalizedCurrencies) {
                const raw = currency.rawData || {};
                const query = currency.guid && currency.guid.trim() !== '' 
                    ? { guid: currency.guid }
                    : { name: currency.name, companyId, guid: { $in: [null, ''] } };
                await TallyCurrency.updateOne(
                    query,
                    { 
                        $set: { 
                            ...currency,
                            ...raw,
                            companyId, 
                            year: date.getFullYear(),
                            lastUpdated: new Date()
                        } 
                    },
                    { upsert: true }
                );
            }
            result.currencies = normalizedCurrencies.length;
            console.log(`✅ Synced ${result.currencies} currencies`);
        } catch (error) {
            result.errors.push(`Currencies sync error: ${error.message}`);
            console.error(`❌ Currencies sync error: ${error.message}`);
        }

        // Sync Cost Centers (parse and store all fields)
        try {
            console.log('📊 Fetching cost centers...');
            const costCentersData = await tallyService.fetchCostCenters();
            const normalizedCostCenters = tallyService.normalizeCostCenters(costCentersData);
            for (const costCenter of normalizedCostCenters) {
                const raw = costCenter.rawData || {};
                const query = costCenter.guid && costCenter.guid.trim() !== '' 
                    ? { guid: costCenter.guid }
                    : { name: costCenter.name, companyId, guid: { $in: [null, ''] } };
                await TallyCostCenter.updateOne(
                    query,
                    { 
                        $set: { 
                            ...costCenter,
                            ...raw,
                            companyId, 
                            year: date.getFullYear(),
                            lastUpdated: new Date()
                        } 
                    },
                    { upsert: true }
                );
            }
            result.costCenters = normalizedCostCenters.length;
            console.log(`✅ Synced ${result.costCenters} cost centers`);
        } catch (error) {
            result.errors.push(`Cost Centers sync error: ${error.message}`);
            console.error(`❌ Cost Centers sync error: ${error.message}`);
        }

        // Sync Stock Items (parse and store all fields)
        try {
            console.log('📊 Fetching stock items...');
            const stockData = await tallyService.fetchStockItems();
            const normalizedStockItems = tallyService.normalizeStockItems(stockData);
            for (const item of normalizedStockItems) {
                const raw = item.rawData || {};
                const query = item.guid && item.guid.trim() !== '' 
                    ? { guid: item.guid }
                    : { name: item.name, companyId, guid: { $in: [null, ''] } };
                await TallyStockItem.updateOne(
                    query,
                    { 
                        $set: { 
                            ...item,
                            ...raw,
                            companyId, 
                            year: date.getFullYear(),
                            lastUpdated: new Date()
                        } 
                    },
                    { upsert: true }
                );
            }
            result.stockItems = normalizedStockItems.length;
            console.log(`✅ Synced ${result.stockItems} stock items`);
        } catch (error) {
            result.errors.push(`Stock items sync error: ${error.message}`);
            console.error(`❌ Stock items sync error: ${error.message}`);
        }

        console.log('✅ Full Tally sync completed successfully!');
        console.log(`📊 Final Results: ${result.companies} companies, ${result.ledgers} ledgers, ${result.stockItems} stock items, ${result.groups} groups, ${result.costCenters} cost centers, ${result.currencies} currencies`);
        console.log(`🗑️ Cleared ${result.clearedCount} old records`);
        console.log(`❌ Errors: ${result.errors.length}`);
        
        res.status(200).json({
            status: 200,
            message: "Tally data sync completed",
            result
        });

    } catch (error) {
        console.error('Tally sync error:', error);
        res.status(500).json({
            status: 500,
            message: "Failed to sync Tally data",
            error: error.message
        });
    }
};

// Fetch vouchers only, now non-blocking with progress polling
exports.fetchTallyVouchers = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);

        if (voucherFetchState.isRunning) {
            return res.status(200).json({
                status: 200,
                message: 'Voucher fetch already running',
                data: { ...voucherFetchState }
            });
        }

        // Reset and start in background
        resetVoucherFetchState();
        voucherFetchState.isRunning = true;
        setImmediate(() => runVoucherFetch(companyId));

        return res.status(202).json({
            status: 202,
            message: 'Voucher fetch started',
            data: { startedAt: voucherFetchState.startedAt, isRunning: true }
        });
    } catch (error) {
        console.error('Voucher fetch start error:', error);
        return res.status(500).json({
            status: 500,
            message: 'Failed to start voucher fetch',
            error: error.message
        });
    }
};

// Get Dashboard Data
exports.getTallyDashboard = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        const currentYear = date.getFullYear();

        // Get summary counts
        const totalLedgers = await TallyLedger.countDocuments({ companyId, year: currentYear });
        const totalVouchers = await TallyVoucher.countDocuments({ companyId, year: currentYear });
        const totalStockItems = await TallyStockItem.countDocuments({ companyId, year: currentYear });

        // Get recent vouchers
        const recentVouchers = await TallyVoucher.find({ companyId, year: currentYear })
            .sort({ date: -1 })
            .limit(5)
            .select('date voucherType voucherNumber party amount');

        res.status(200).json({
            status: 200,
            data: {
                summary: {
                    totalLedgers,
                    totalVouchers,
                    totalStockItems
                },
                recentVouchers
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            status: 500,
            message: "Failed to fetch dashboard data",
            error: error.message
        });
    }
};
// Get Ledgers
exports.getTallyLedgers = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        const currentYear = date.getFullYear();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const group = req.query.group || '';
        const balance = req.query.balance || '';

        const query = { 
            companyId, 
            year: currentYear,
            // Filter only Sundry Debtors
            parent: { $regex: 'Sundry Debtors', $options: 'i' }
        };
        
        // Search filter
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        // Group filter (keeping for compatibility, but will be overridden by Sundry Debtors filter)
        if (group) {
            query.parent = { $regex: 'Sundry Debtors', $options: 'i' };
        }
        
        // Balance filter
        if (balance) {
            switch (balance) {
                case 'positive':
                    query.closingBalance = { $gt: 0 };
                    break;
                case 'negative':
                    query.closingBalance = { $lt: 0 };
                    break;
                case 'zero':
                    query.closingBalance = 0;
                    break;
                default:
                    break;
            }
        }

        const ledgers = await TallyLedger.find(query)
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await TallyLedger.countDocuments(query);

        res.status(200).json({
            status: 200,
            data: {
                ledgers,
                total,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    total,
                    limit
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to fetch ledgers",
            error: error.message
        });
    }
};

// Get ledgers related to an employee (match name/id across key fields)
exports.getLedgersByEmployee = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        const name = (req.query.name || '').trim();
        const empId = (req.query.empId || '').trim();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;

        if (!name) {
            return res.status(400).json({ status: 400, message: 'name query is required' });
        }

        const nameRegex = new RegExp(name, 'i');
        const idRegex = empId ? new RegExp(empId, 'i') : null;

        const query = {
            companyId,
            $or: [
                { name: nameRegex },
                { aliasName: nameRegex },
                { reservedName: nameRegex },
                { parent: nameRegex },
                { contactPerson: nameRegex },
                { addressList: nameRegex },
                { 'bankDetails.accountNumber': nameRegex },
                { 'bankDetails.bankName': nameRegex },
                { costCentreAllocations: { $elemMatch: { costCentre: nameRegex } } },
                ...(idRegex ? [
                    { name: idRegex },
                    { aliasName: idRegex },
                    { reservedName: idRegex },
                    { parent: idRegex },
                    { contactPerson: idRegex },
                    { addressList: idRegex },
                ] : []),
            ],
        };

        const ledgers = await TallyLedger.find(query)
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('name aliasName reservedName parent openingBalance closingBalance languageName languageId isGroup guid masterId alterid ledgerPhone ledgerFax email website incometaxnumber salestaxnumber gstregistrationtype gstin gstdutyhead addressList bankDetails contactPerson creditPeriod creditLimit interestRate priceLevel billWiseDetails categoryData costCentreAllocations lastUpdated');

        const total = await TallyLedger.countDocuments(query);

        res.status(200).json({
            status: 200,
            data: {
                ledgers,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    total,
                    limit,
                },
            },
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Failed to fetch related ledgers', error: error.message });
    }
};

// Get Vouchers
exports.getTallyVouchers = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        const currentYear = date.getFullYear();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const voucherType = req.query.voucherType || '';
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;

        const query = { companyId, year: currentYear };
        
        if (voucherType) {
            query.voucherType = voucherType;
        }
        
        if (fromDate && toDate) {
            query.date = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }

        const vouchers = await TallyVoucher.find(query)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await TallyVoucher.countDocuments(query);

        res.status(200).json({
            status: 200,
            data: {
                vouchers,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    total,
                    limit
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to fetch vouchers",
            error: error.message
        });
    }
};

// Get vouchers related to an employee name (search across key fields)
exports.getVouchersByEmployee = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        const name = (req.query.name || '').trim();
        const empId = (req.query.empId || '').trim();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;

        if (!name) {
            return res.status(400).json({ status: 400, message: 'name query is required' });
        }

        const nameRegex = new RegExp(name, 'i');
        const idRegex = empId ? new RegExp(empId, 'i') : null;

        const query = {
            companyId,
            $or: [
                { party: nameRegex },
                { partyledgername: nameRegex },
                { narration: nameRegex },
                { reference: nameRegex },
                { voucherNumber: nameRegex },
                { ledgerEntries: { $elemMatch: { ledgerName: nameRegex } } },
                { 'ledgerEntries.billAllocations': { $elemMatch: { billName: nameRegex } } },
                { costCentreAllocations: { $elemMatch: { costCentre: nameRegex } } },
                ...(idRegex ? [
                    { party: idRegex },
                    { narration: idRegex },
                    { reference: idRegex },
                    { voucherNumber: idRegex },
                    { ledgerEntries: { $elemMatch: { ledgerName: idRegex } } },
                    { 'ledgerEntries.billAllocations': { $elemMatch: { billName: idRegex } } },
                    { costCentreAllocations: { $elemMatch: { costCentre: idRegex } } },
                ] : []),
            ],
        };

        const vouchers = await TallyVoucher.find(query)
            .sort({ date: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('date voucherNumber voucherType party amount narration reference ledgerEntries costCentreAllocations gstDetails bankDetails');

        const total = await TallyVoucher.countDocuments(query);

        res.status(200).json({
            status: 200,
            data: {
                vouchers,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    total,
                    limit,
                },
            },
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Failed to fetch related vouchers', error: error.message });
    }
};

// Get Stock Items
exports.getTallyStockItems = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        const currentYear = date.getFullYear();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const search = req.query.search || '';
        const category = req.query.category || '';
        const stock = req.query.stock || '';

        const query = { companyId, year: currentYear };
        
        // Search filter
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        
        // Category filter
        if (category) {
            query.$or = [
                { category: { $regex: category, $options: 'i' } },
                { stockGroup: { $regex: category, $options: 'i' } },
                { parent: { $regex: category, $options: 'i' } }
            ];
        }
        
        // Stock status filter
        if (stock) {
            switch (stock) {
                case 'in-stock':
                    query.closingQty = { $gt: 0 };
                    break;
                case 'low-stock':
                    query.$and = [
                        { closingQty: { $gt: 0 } },
                        { closingQty: { $lte: 10 } }  // Assuming low stock is <= 10 units
                    ];
                    break;
                case 'out-of-stock':
                    query.closingQty = { $lte: 0 };
                    break;
                default:
                    break;
            }
        }

        const stockItems = await TallyStockItem.find(query)
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await TallyStockItem.countDocuments(query);

        res.status(200).json({
            status: 200,
            data: {
                stockItems,
                total,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    total,
                    limit
                }
            }
        });

    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to fetch stock items",
            error: error.message
        });
    }
};

// Test Tally connection
exports.testTallyConnection = async (req, res) => {
    try {
        const connectionResult = await tallyService.testConnection();
        
        res.status(200).json({
            status: 200,
            message: connectionResult.success ? "Tally connection successful" : "Tally connection failed",
            data: connectionResult
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: "Failed to test Tally connection",
            error: error.message
        });
    }
};

// Test ledger data processing
exports.testLedgerProcessing = async (req, res) => {
    try {
        console.log('🧪 Testing ledger data processing...');
        
        // Fetch a small sample of ledger data
        const ledgerData = await tallyService.fetchLedgers();
        const normalizedLedgers = tallyService.normalizeLedgers(ledgerData);
        
        // Test first 5 ledgers
        const testLedgers = normalizedLedgers.slice(0, 5);
        
        const testResults = testLedgers.map(ledger => ({
            name: ledger.name,
            openingBalance: ledger.openingBalance,
            closingBalance: ledger.closingBalance,
            rawOpeningBalance: ledger.rawData?.OPENINGBALANCE,
            rawClosingBalance: ledger.rawData?.CLOSINGBALANCE,
            hasValidBalances: ledger.openingBalance !== 0 || ledger.closingBalance !== 0
        }));
        
        console.log('🧪 Test Results:', testResults);
        
        res.status(200).json({
            status: 200,
            message: "Ledger processing test completed",
            data: {
                totalLedgers: normalizedLedgers.length,
                testResults,
                sampleRawData: testLedgers[0]?.rawData || {}
            }
        });
    } catch (error) {
        console.error('🧪 Test error:', error);
        res.status(500).json({
            status: 500,
            message: "Failed to test ledger processing",
            error: error.message
        });
    }
};

// Comprehensive Sync Methods for Enhanced Data Extraction
exports.syncComprehensiveData = async (req, res) => {
    try {
        const companyId = req.userid;
        const results = {
            companies: 0,
            ledgers: 0,
            groups: 0,
            stockItems: 0,
            vouchers: 0,
            costCenters: 0,
            currencies: 0,
            errors: []
        };

        console.log('Starting comprehensive Tally data sync...');

        // 1. Sync Companies
        try {
            const companiesData = await tallyService.fetchCompanyInfo();
            const normalizedCompanies = tallyService.normalizeCompanyInfo(companiesData);
            
            for (const company of normalizedCompanies) {
                await TallyCompany.findOneAndUpdate(
                    { name: company.name, companyId },
                    { ...company, companyId, year: new Date().getFullYear() },
                    { upsert: true, new: true }
                );
                results.companies++;
            }
            console.log(`Synced ${results.companies} companies`);
        } catch (error) {
            results.errors.push(`Companies sync error: ${error.message}`);
        }

        // 2. Sync Groups
        try {
            const groupsData = await tallyService.fetchGroups();
            const normalizedGroups = tallyService.normalizeGroups(groupsData);
            
            for (const group of normalizedGroups) {
                await TallyGroup.findOneAndUpdate(
                    { name: group.name, companyId },
                    { ...group, companyId, year: new Date().getFullYear() },
                    { upsert: true, new: true }
                );
                results.groups++;
            }
            console.log(`Synced ${results.groups} groups`);
        } catch (error) {
            results.errors.push(`Groups sync error: ${error.message}`);
        }

        // 3. Sync Currencies
        try {
            const currenciesData = await tallyService.fetchCurrencies();
            const normalizedCurrencies = tallyService.normalizeCurrencies(currenciesData);
            
            for (const currency of normalizedCurrencies) {
                await TallyCurrency.findOneAndUpdate(
                    { name: currency.name, companyId },
                    { ...currency, companyId, year: new Date().getFullYear() },
                    { upsert: true, new: true }
                );
                results.currencies++;
            }
            console.log(`Synced ${results.currencies} currencies`);
        } catch (error) {
            results.errors.push(`Currencies sync error: ${error.message}`);
        }

        // 4. Sync Cost Centers
        try {
            const costCentersData = await tallyService.fetchCostCenters();
            const normalizedCostCenters = tallyService.normalizeCostCenters(costCentersData);
            
            for (const costCenter of normalizedCostCenters) {
                await TallyCostCenter.findOneAndUpdate(
                    { name: costCenter.name, companyId },
                    { ...costCenter, companyId, year: new Date().getFullYear() },
                    { upsert: true, new: true }
                );
                results.costCenters++;
            }
            console.log(`Synced ${results.costCenters} cost centers`);
        } catch (error) {
            results.errors.push(`Cost Centers sync error: ${error.message}`);
        }

        // 5. Sync Ledgers (Enhanced)
        try {
            const ledgersData = await tallyService.fetchLedgers();
            const normalizedLedgers = tallyService.normalizeLedgers(ledgersData);
            
            for (const ledger of normalizedLedgers) {
                await TallyLedger.findOneAndUpdate(
                    { name: ledger.name, companyId },
                    { ...ledger, companyId, year: new Date().getFullYear() },
                    { upsert: true, new: true }
                );
                results.ledgers++;
            }
            console.log(`Synced ${results.ledgers} ledgers`);
        } catch (error) {
            results.errors.push(`Ledgers sync error: ${error.message}`);
        }

        // 6. Sync Stock Items (Enhanced)
        try {
            const stockItemsData = await tallyService.fetchStockItems();
            const normalizedStockItems = tallyService.normalizeStockItems(stockItemsData);
            
            for (const stockItem of normalizedStockItems) {
                await TallyStockItem.findOneAndUpdate(
                    { name: stockItem.name, companyId },
                    { ...stockItem, companyId, year: new Date().getFullYear() },
                    { upsert: true, new: true }
                );
                results.stockItems++;
            }
            console.log(`Synced ${results.stockItems} stock items`);
        } catch (error) {
            results.errors.push(`Stock Items sync error: ${error.message}`);
        }

        // 7. Sync Vouchers (Enhanced)
        try {
            const vouchersData = await tallyService.fetchVouchers();
            const normalizedVouchers = tallyService.normalizeVouchers(vouchersData);
            
            for (const voucher of normalizedVouchers) {
                await TallyVoucher.findOneAndUpdate(
                    { 
                        voucherNumber: voucher.voucherNumber, 
                        date: voucher.date,
                        voucherType: voucher.voucherType,
                        companyId 
                    },
                    { ...voucher, companyId, year: new Date().getFullYear() },
                    { upsert: true, new: true }
                );
                results.vouchers++;
            }
            console.log(`Synced ${results.vouchers} vouchers`);
        } catch (error) {
            results.errors.push(`Vouchers sync error: ${error.message}`);
        }

        res.status(200).json({
            status: 200,
            message: "Comprehensive Tally data sync completed",
            data: {
                syncResults: results,
                syncedAt: new Date(),
                totalSynced: results.companies + results.ledgers + results.groups + 
                           results.stockItems + results.vouchers + results.costCenters + results.currencies
            }
        });

    } catch (error) {
        console.error('Comprehensive sync error:', error);
        res.status(500).json({
            status: 500,
            message: "Failed to sync comprehensive Tally data",
            error: error.message
        });
    }
};

// Get comprehensive dashboard data
exports.getComprehensiveDashboard = async (req, res) => {
    try {
        const companyId = req.userid;
        const { fromDate, toDate, groupBy = 'month' } = req.query;

        // Build date filter
        let dateFilter = { companyId };
        if (fromDate && toDate) {
            dateFilter.lastUpdated = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }

        // Get comprehensive counts
        const [
            companiesCount,
            ledgersCount,
            groupsCount,
            stockItemsCount,
            vouchersCount,
            costCentersCount,
            currenciesCount
        ] = await Promise.all([
            TallyCompany.countDocuments({ companyId }),
            TallyLedger.countDocuments({ companyId }),
            TallyGroup.countDocuments({ companyId }),
            TallyStockItem.countDocuments({ companyId }),
            TallyVoucher.countDocuments({ companyId }),
            TallyCostCenter.countDocuments({ companyId }),
            TallyCurrency.countDocuments({ companyId })
        ]);

        // Get recent activities
        const recentLedgers = await TallyLedger.find({ companyId })
            .sort({ lastUpdated: -1 })
            .limit(10)
            .select('name parent openingBalance closingBalance lastUpdated');

        const recentVouchers = await TallyVoucher.find({ companyId })
            .sort({ date: -1 })
            .limit(10)
            .select('date voucherType voucherNumber party amount lastUpdated');

        const recentStockItems = await TallyStockItem.find({ companyId })
            .sort({ lastUpdated: -1 })
            .limit(10)
            .select('name closingValue closingQty baseUnits lastUpdated');

        // Get financial summary (debit, credit, net and absolute)
        const financialSummary = await TallyLedger.aggregate([
            { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
            {
                $group: {
                    _id: null,
                    // Opening balances
                    openingDebitTotal: {
                        $sum: { $cond: [{ $gt: ['$openingBalance', 0] }, '$openingBalance', 0] }
                    },
                    openingCreditTotal: {
                        $sum: { $cond: [{ $lt: ['$openingBalance', 0] }, '$openingBalance', 0] }
                    },
                    openingNetTotal: { $sum: '$openingBalance' },
                    openingAbsoluteTotal: { $sum: { $abs: '$openingBalance' } },
                    // Closing balances
                    closingDebitTotal: {
                        $sum: { $cond: [{ $gt: ['$closingBalance', 0] }, '$closingBalance', 0] }
                    },
                    closingCreditTotal: {
                        $sum: { $cond: [{ $lt: ['$closingBalance', 0] }, '$closingBalance', 0] }
                    },
                    closingNetTotal: { $sum: '$closingBalance' },
                    closingAbsoluteTotal: { $sum: { $abs: '$closingBalance' } },
                    // Meta
                    totalLedgers: { $sum: 1 }
                }
            }
        ]);

        // Get voucher summary by type
        const voucherSummary = await TallyVoucher.aggregate([
            { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
            {
                $group: {
                    _id: '$voucherType',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Get stock summary
        const stockSummary = await TallyStockItem.aggregate([
            { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
            {
                $group: {
                    _id: '$stockGroup',
                    itemCount: { $sum: 1 },
                    totalValue: { $sum: '$closingValue' },
                    totalQty: { $sum: '$closingQty' }
                }
            },
            { $sort: { totalValue: -1 } }
        ]);

        // Get group hierarchy summary
        const groupSummary = await TallyGroup.aggregate([
            { $match: { companyId: mongoose.Types.ObjectId(companyId) } },
            {
                $group: {
                    _id: '$nature',
                    count: { $sum: 1 },
                    totalOpeningBalance: { $sum: '$openingBalance' },
                    totalClosingBalance: { $sum: '$closingBalance' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Normalize financial summary shape to include legacy fields expected by UI
        const fsRaw = financialSummary[0] || {
            openingDebitTotal: 0,
            openingCreditTotal: 0,
            openingNetTotal: 0,
            openingAbsoluteTotal: 0,
            closingDebitTotal: 0,
            closingCreditTotal: 0,
            closingNetTotal: 0,
            closingAbsoluteTotal: 0,
            totalLedgers: 0
        };
        const fs = {
            ...fsRaw,
            // Legacy keys used by frontend cards
            totalOpeningBalance: fsRaw.openingAbsoluteTotal || Math.abs(fsRaw.openingNetTotal || 0),
            totalClosingBalance: fsRaw.closingNetTotal || 0,
            // Extra helpers
            totalOpeningAbsolute: fsRaw.openingAbsoluteTotal || Math.abs(fsRaw.openingNetTotal || 0),
            totalClosingAbsolute: fsRaw.closingAbsoluteTotal || Math.abs(fsRaw.closingNetTotal || 0)
        };

        res.status(200).json({
            status: 200,
            data: {
                summary: {
                    companies: companiesCount,
                    ledgers: ledgersCount,
                    groups: groupsCount,
                    stockItems: stockItemsCount,
                    vouchers: vouchersCount,
                    costCenters: costCentersCount,
                    currencies: currenciesCount,
                    lastSync: new Date()
                },
                financialSummary: fs,
                voucherSummary,
                stockSummary,
                groupSummary,
                recentActivities: {
                    ledgers: recentLedgers,
                    vouchers: recentVouchers,
                    stockItems: recentStockItems
                }
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            status: 500,
            message: "Failed to fetch comprehensive dashboard data",
            error: error.message
        });
    }
};

