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

// Progress state for background voucher fetch with checkpoint support
const voucherFetchState = {
    isRunning: false,
    startedAt: null,
    completedAt: null,
    batchCount: 0,
    batchTotal: 0,
    percent: 0,
    totals: { vouchers: 0, products: 0, vendors: 0, executives: 0 },
    lastBatch: null,
    errors: [],
    checkpoint: null, // Store last successful date for resumption
    dateRange: null   // Store overall date range being processed
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
    voucherFetchState.checkpoint = null;
    voucherFetchState.dateRange = null;
}

exports.getVoucherFetchStatus = (req, res) => {
    res.status(200).json({
        status: 200,
        data: {
            ...voucherFetchState
        }
    });
};

// Helper function to process voucher records in bulk for better performance
async function processVoucherRecords(vouchers, companyId, voucherFetchState) {
    const VendorTransaction = require('../models/vendorTransaction.model');
    const SalesExecutive = require('../models/salesExecutive.model');
    
    if (!vouchers.length) return;
    
    try {
        const bulkVouchers = [];
        const bulkProducts = [];
        const bulkVendors = [];
        const bulkExecutives = [];

        // Prepare bulk operations for all vouchers
        for (const voucher of vouchers) {
            // Parse date using helper function
            let parsedDate = parseTallyDate(voucher.date);

            // Skip voucher if critical data is missing
            if (!voucher.voucherNumber) {
                console.warn(`Skipping voucher with missing voucher number:`, voucher);
                continue;
            }

            // Improved deduplication: Use compound unique key for better duplicate detection
            const query = voucher.guid && voucher.guid.trim() !== ''
                ? { guid: voucher.guid.trim(), companyId }
                : {
                    voucherNumber: voucher.voucherNumber,
                    voucherType: voucher.voucherType || '',
                    ...(parsedDate && { date: parsedDate }),
                    companyId
                };
            
            // Prepare voucher bulk operation
            bulkVouchers.push({
                updateOne: {
                    filter: query,
                    update: {
                        $set: {
                            ...voucher,
                            ...(voucher.raw || {}),
                            companyId,
                            date: parsedDate,
                            year: parsedDate ? parsedDate.getFullYear() : null,
                            lastUpdated: new Date()
                        }
                    },
                    upsert: true
                }
            });

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
                
                bulkProducts.push({
                    updateOne: {
                        filter: {
                            ...(productObj.date && { date: productObj.date }),
                            invoice: productObj.invoice,
                            company: productObj.company,
                            product: productObj.product,
                            companyid: companyId,
                            year: productObj.year
                        },
                        update: { $set: productObj },
                        upsert: true
                    }
                });
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
                
                bulkVendors.push({
                    updateOne: {
                        filter: {
                            ...(vendorObj.date && { date: vendorObj.date }),
                            voucherNumber: vendorObj.voucherNumber,
                            vendorName: vendorObj.vendorName,
                            companyId,
                            year: vendorObj.year
                        },
                        update: { $set: vendorObj },
                        upsert: true
                    }
                });
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
                
                bulkExecutives.push({
                    updateOne: {
                        filter: {
                            ...(execObj.date && { date: execObj.date }),
                            voucherNumber: execObj.voucherNumber,
                            executive: execObj.executive,
                            companyId,
                            year: execObj.year
                        },
                        update: { $set: execObj },
                        upsert: true
                    }
                });
            }
        }

        // Execute bulk operations with error handling
        const bulkResults = await Promise.allSettled([
            bulkVouchers.length > 0 ? TallyVoucher.bulkWrite(bulkVouchers, { ordered: false }) : Promise.resolve({ upsertedCount: 0 }),
            bulkProducts.length > 0 ? tallyModel.bulkWrite(bulkProducts, { ordered: false }) : Promise.resolve({ upsertedCount: 0 }),
            bulkVendors.length > 0 ? VendorTransaction.bulkWrite(bulkVendors, { ordered: false }) : Promise.resolve({ upsertedCount: 0 }),
            bulkExecutives.length > 0 ? SalesExecutive.bulkWrite(bulkExecutives, { ordered: false }) : Promise.resolve({ upsertedCount: 0 })
        ]);

        // Update counters based on actual upserts
        bulkResults.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                const upsertedCount = result.value.upsertedCount || 0;
                switch (index) {
                    case 0: voucherFetchState.totals.vouchers += upsertedCount; break;
                    case 1: voucherFetchState.totals.products += upsertedCount; break;
                    case 2: voucherFetchState.totals.vendors += upsertedCount; break;
                    case 3: voucherFetchState.totals.executives += upsertedCount; break;
                }
            } else {
                console.error(`Bulk operation ${index} failed:`, result.reason);
                voucherFetchState.errors.push(`Bulk operation failed: ${result.reason.message}`);
            }
        });

    } catch (error) {
        console.error('Error processing voucher records:', error);
        voucherFetchState.errors.push(`Error processing vouchers: ${error.message}`);
    }
}

// Helper function to process a single voucher record
async function processVoucherRecord(voucher, companyId, voucherFetchState) {
    const VendorTransaction = require('../models/vendorTransaction.model');
    const SalesExecutive = require('../models/salesExecutive.model');
    
    try {
        // Parse date using helper function
        let parsedDate = parseTallyDate(voucher.date);

        // Skip voucher if critical data is missing
        if (!voucher.voucherNumber) {
            console.warn(`Skipping voucher with missing voucher number:`, voucher);
            return;
        }

        // Improved deduplication: Use compound unique key for better duplicate detection
        const query = voucher.guid && voucher.guid.trim() !== ''
            ? { guid: voucher.guid.trim(), companyId }
            : {
                voucherNumber: voucher.voucherNumber,
                voucherType: voucher.voucherType || '',
                ...(parsedDate && { date: parsedDate }),
                companyId
            };
        
        const updateResult = await TallyVoucher.updateOne(
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
        
        // Only count actually inserted vouchers, not updates
        if (updateResult.upsertedCount > 0) {
            voucherFetchState.totals.vouchers++;
        }

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
            const productUpdateResult = await tallyModel.updateOne(
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
            
            // Only count actually inserted products, not updates
            if (productUpdateResult.upsertedCount > 0) {
                voucherFetchState.totals.products++;
            }
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
            const vendorUpdateResult = await VendorTransaction.updateOne(
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
            
            // Only count actually inserted vendors, not updates
            if (vendorUpdateResult.upsertedCount > 0) {
                voucherFetchState.totals.vendors++;
            }
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
            const execUpdateResult = await SalesExecutive.updateOne(
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
            
            // Only count actually inserted executives, not updates
            if (execUpdateResult.upsertedCount > 0) {
                voucherFetchState.totals.executives++;
            }
        }
    } catch (voucherError) {
        console.error(`Error processing voucher ${voucher.voucherNumber}:`, voucherError.message);
        voucherFetchState.errors.push(`Voucher ${voucher.voucherNumber} error: ${voucherError.message}`);
    }
}

async function runVoucherFetch(companyId, customFromDate = null, customToDate = null) {
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
        console.log('🔄 Starting optimized voucher fetch process...');
        console.log(`📊 Company ID: ${companyId}`);

        // Incremental clearing: Clear in smaller batches to avoid memory issues
        console.log('🗑️ Clearing existing voucher data incrementally...');
        const clearBatchSize = 1000;
        
        // Clear TallyVoucher in batches using findAndDelete approach
        let totalCleared = 0;
        while (true) {
            // Find documents to delete in batches
            const docsToDelete = await TallyVoucher.find({ companyId }).limit(clearBatchSize).select('_id');
            if (docsToDelete.length === 0) break;
            
            const idsToDelete = docsToDelete.map(doc => doc._id);
            const result = await TallyVoucher.deleteMany({ _id: { $in: idsToDelete } });
            
            totalCleared += result.deletedCount;
            console.log(`Cleared ${totalCleared} voucher records so far...`);
            
            // Small delay to prevent overwhelming the database
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Clear other collections normally (they're typically smaller)
        console.log('🗑️ Clearing related collections...');
        await Promise.all([
            tallyModel.deleteMany({ companyId }),
            VendorTransaction.deleteMany({ companyId }),
            SalesExecutive.deleteMany({ companyId })
        ]);
        console.log('✅ Existing voucher data cleared successfully');

        // HEALTH CHECK: Test Tally connectivity with yesterday's data first
        console.log('🔍 Testing Tally connectivity before starting batch process...');
        try {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const testFrom = yesterday.toISOString().split('T')[0].replace(/-/g, '');
            const testTo = yesterday.toISOString().split('T')[0].replace(/-/g, '');
            
            const testData = await tallyService.fetchVouchersUltraMinimal(testFrom, testTo);
            const testNormalized = tallyService.normalizeVouchers(testData);
            console.log(`✅ Health check passed: ${testNormalized.length} vouchers found for ${testFrom}`);
        } catch (healthErr) {
            console.error(`❌ Health check FAILED: ${healthErr.message}`);
            voucherFetchState.errors.push(`Health check failed: ${healthErr.message}`);
            throw new Error(`Tally connectivity test failed. Cannot proceed with voucher fetch: ${healthErr.message}`);
        }

        // Use custom date range if provided, otherwise default to last 1 YEAR ONLY (not 6 months)
        let fromDate, toDate;
        if (customFromDate && customToDate) {
            fromDate = new Date(customFromDate);
            toDate = new Date(customToDate);
            console.log(`📅 Using custom date range: ${fromDate.toDateString()} to ${toDate.toDateString()}`);
        } else {
            // Fetch vouchers from ONLY last 1 year to drastically reduce load
            fromDate = new Date();
            fromDate.setFullYear(fromDate.getFullYear() - 1); // Only last 1 year
            toDate = new Date();
            console.log(`📅 Using default date range (LAST 1 YEAR ONLY): ${fromDate.toDateString()} to ${toDate.toDateString()}`);
        }
        
        const batchDays = 1; // SINGLE DAY batches only - maximum reliability
        let start = new Date(fromDate);
        let end = new Date(toDate);

        // Store date range for checkpoint persistence
        voucherFetchState.dateRange = {
            from: fromDate.toISOString(),
            to: toDate.toISOString(),
            batchDays
        };

        // compute total batches first
        voucherFetchState.batchTotal = Math.ceil(((end - start) / (1000 * 60 * 60 * 24) + 1) / batchDays);
        
        console.log(`📅 Fetching vouchers from ${fromDate.toDateString()} to ${toDate.toDateString()}`);
        console.log(`📊 Total batches planned: ${voucherFetchState.batchTotal} (${batchDays} day per batch - SINGLE DAY ONLY)`);
        console.log(`⚠️  ULTRA-CONSERVATIVE MODE: 10s delays, 5min+ timeouts, ultra-minimal payloads`);

        // Rate limiting variables - MUCH longer delays to give Tally maximum recovery time
        const requestDelay = 10000;  // Increased from 5s to 10s delay between requests
        const batchDelay = 20000;    // Increased from 10s to 20s delay between batches for maximum Tally recovery
        let consecutiveErrors = 0;
        const maxConsecutiveErrors = 1; // Reduced to 1 - stop immediately on any error and recover

        while (start <= end && voucherFetchState.isRunning) {
            voucherFetchState.batchCount++;
            let batchStart = new Date(start);
            let batchEnd = new Date(start);
            batchEnd.setDate(batchEnd.getDate() + batchDays - 1);
            if (batchEnd > end) batchEnd = new Date(end);

            const batchFrom = batchStart.toISOString().split('T')[0].replace(/-/g, '');
            const batchTo = batchEnd.toISOString().split('T')[0].replace(/-/g, '');

            // Adaptive delay based on consecutive errors
            if (consecutiveErrors > 0) {
                const backoffDelay = Math.min(requestDelay * Math.pow(2, consecutiveErrors), 30000); // Max 30s
                console.log(`⏳ Applying backoff delay: ${backoffDelay/1000}s due to ${consecutiveErrors} consecutive errors`);
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
            } else {
                // Regular delay between requests
                console.log(`⏳ Rate limiting delay: ${requestDelay/1000}s`);
                await new Promise(resolve => setTimeout(resolve, requestDelay));
            }

            let voucherData;
            try {
                console.log(`🔄 Fetching batch ${voucherFetchState.batchCount}/${voucherFetchState.batchTotal} (${batchFrom}-${batchTo})...`);
                
                // START with ultra-minimal payload to prevent crashes
                let voucherData;
                try {
                    console.log(`🟡 Trying ultra-minimal payload first for maximum reliability...`);
                    voucherData = await tallyService.fetchVouchersUltraMinimal(batchFrom, batchTo);
                } catch (ultraErr) {
                    console.log(`⚠️ Ultra-minimal failed, this indicates serious Tally issues: ${ultraErr.message}`);
                    throw ultraErr; // If even ultra-minimal fails, there's a bigger problem
                }
                
                consecutiveErrors = 0; // Reset error counter on success
            } catch (err) {
                consecutiveErrors++;
                const msg = `Voucher batch ${batchFrom}-${batchTo} error: ${err.message}`;
                console.error(msg);
                voucherFetchState.errors.push(msg);
                
                // Circuit breaker: Stop if too many consecutive errors - IMMEDIATE PAUSE
                if (consecutiveErrors >= maxConsecutiveErrors) {
                    console.error(`❌ Circuit breaker triggered: ${consecutiveErrors} consecutive errors. Pausing for LONG recovery...`);
                    await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minute recovery pause
                    consecutiveErrors = 0; // Reset after recovery pause
                }
                
                // Skip sub-batches for single-day batches - they're already minimal
                start.setDate(start.getDate() + batchDays);
                voucherFetchState.percent = Math.round((voucherFetchState.batchCount / Math.max(1, voucherFetchState.batchTotal)) * 100);
                voucherFetchState.lastBatch = { range: `${batchFrom}-${batchTo}`, count: 0, error: err.message };
                continue;
            }

            const normalizedVouchers = tallyService.normalizeVouchers(voucherData);
            const batchVoucherCount = normalizedVouchers.length;

            // Log batch progress
            voucherFetchState.percent = Math.round((voucherFetchState.batchCount / Math.max(1, voucherFetchState.batchTotal)) * 100);
            voucherFetchState.lastBatch = { range: `${batchFrom}-${batchTo}`, count: batchVoucherCount };
            console.log(`✅ Voucher batch ${voucherFetchState.batchCount}/${voucherFetchState.batchTotal} (${batchFrom}-${batchTo}): ${batchVoucherCount} vouchers. Progress: ${voucherFetchState.percent}%`);

            // Process vouchers with bulk operations for better performance
            const dbBatchSize = 50; // Process 50 vouchers at a time to reduce memory usage
            for (let i = 0; i < normalizedVouchers.length; i += dbBatchSize) {
                const voucherBatch = normalizedVouchers.slice(i, i + dbBatchSize);
                
                // Use bulk processing for better performance
                await processVoucherRecords(voucherBatch, companyId, voucherFetchState);
                
                // Small delay between micro-batches to prevent database overload
                if (i + dbBatchSize < normalizedVouchers.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            // Save checkpoint after successful batch processing
            voucherFetchState.checkpoint = {
                lastProcessedDate: batchEnd.toISOString(),
                batchCount: voucherFetchState.batchCount,
                totals: { ...voucherFetchState.totals }
            };

            // Delay between successful batches to give Tally time to recover
            console.log(`⏳ Batch completed. Waiting ${batchDelay/1000}s before next batch...`);
            await new Promise(resolve => setTimeout(resolve, batchDelay));

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

/* REMOVED: Basic sync functionality - no longer needed, use syncComprehensiveData instead
// Enhanced sync with comprehensive error handling and validation
exports.syncTallyData = async (req, res) => {
    // This method has been removed. Use syncComprehensiveData instead.
    res.status(410).json({
        status: 410,
        message: "Basic sync functionality has been removed. Please use comprehensive sync instead.",
        error: "This endpoint is no longer available"
    });
};
*/

// Fetch vouchers only, now non-blocking with progress polling
exports.fetchTallyVouchers = async (req, res) => {
            
            const normalizedCompany = tallyService.normalizeCompanyInfo(companyData);
            if (!normalizedCompany || normalizedCompany.length === 0) {
                result.warnings.push('No company information found in Tally data');
            } else {
                for (const company of normalizedCompany) {
                    // Validate required company fields
                    if (!company.name || company.name.trim() === '') {
                        result.warnings.push('Skipping company with empty name');
                        continue;
                    }
                    
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
                    result.companies++;
                }
                console.log(`✅ Synced ${result.companies} companies`);
            }
        /*} catch (error) {
            const errorMsg = `Company sync error: ${error.message}`;
            result.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);*/
        }

        /*// Sync Ledgers with enhanced error handling
        try {
            console.log('📊 Fetching ledgers...');
            const ledgerData = await tallyService.fetchLedgers();
            
            if (!ledgerData) {
                throw new Error('No ledger data received from Tally');
            }
            
            const normalizedLedgers = tallyService.normalizeLedgers(ledgerData);
            
            if (!normalizedLedgers || normalizedLedgers.length === 0) {
                result.warnings.push('No ledgers found in Tally data');
            } else {
                // Debug: Log sample ledger data to check balance processing
                if (normalizedLedgers.length > 0) {
                    const sampleLedger = normalizedLedgers[0];
                    console.log('🔍 Sample ledger data:');
                    console.log(`   Name: ${sampleLedger.name}`);
                    console.log(`   Opening Balance: ${sampleLedger.openingBalance}`);
                    console.log(`   Closing Balance: ${sampleLedger.closingBalance}`);
                    console.log(`   Raw Data Keys: ${Object.keys(sampleLedger.rawData || {}).slice(0, 10).join(', ')}`);
                }
                
                let processedLedgers = 0;
                let skippedLedgers = 0;
                
                for (const ledger of normalizedLedgers) {
                    try {
                        // Validate ledger data
                        if (!ledger.name || ledger.name.trim() === '') {
                            result.warnings.push('Skipping ledger with empty name');
                            skippedLedgers++;
                            continue;
                        }
                        
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
                        
                        await TallyLedger.updateOne(
                            query,
                            { $set: ledgerToStore },
                            { upsert: true }
                        );
                        processedLedgers++;
                        
                        // Log progress for large datasets
                        if (processedLedgers % 100 === 0) {
                            console.log(`📊 Processed ${processedLedgers}/${normalizedLedgers.length} ledgers...`);
                        }
                    } catch (ledgerError) {
                        console.error(`❌ Error processing ledger "${ledger.name}":`, ledgerError.message);
                        result.errors.push(`Ledger "${ledger.name}" error: ${ledgerError.message}`);
                        skippedLedgers++;
                    }
                }
                
                result.ledgers = processedLedgers;
                console.log(`✅ Synced ${processedLedgers} ledgers (${skippedLedgers} skipped)`);
            }
        } catch (error) {
            const errorMsg = `Ledgers sync error: ${error.message}`;
            result.errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
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

        // Sync Stock Items (Enhanced with comprehensive logging)
        try {
            console.log('� Fetching stock items...');
            const stockData = await tallyService.fetchStockItems();
            const normalizedStockItems = tallyService.normalizeStockItems(stockData);
            
            console.log(`📦 Processing ${normalizedStockItems.length} stock items...`);
            
            // Log sample stock item for debugging
            if (normalizedStockItems.length > 0) {
                const sampleItem = normalizedStockItems[0];
                console.log('🔍 Sample stock item data:');
                console.log(`   Name: ${sampleItem.name}`);
                console.log(`   Closing Qty: ${sampleItem.closingQty}`);
                console.log(`   Closing Value: ${sampleItem.closingValue}`);
                console.log(`   Closing Rate: ${sampleItem.closingRate}`);
                console.log(`   Stock Status: ${sampleItem.stockStatus}`);
                console.log(`   Base Units: ${sampleItem.baseUnits}`);
                console.log(`   Stock Group: ${sampleItem.stockGroup}`);
                console.log(`   HSN Code: ${sampleItem.hsnCode || 'N/A'}`);
            }
            
            let processedItems = 0;
            let skippedItems = 0;
            
            for (const item of normalizedStockItems) {
                try {
                    // Skip items with empty names
                    if (!item.name || item.name.trim() === '') {
                        console.warn(`⚠️ Skipping stock item with empty name`);
                        skippedItems++;
                        continue;
                    }
                    
                    const raw = item.rawData || {};
                    const query = item.guid && item.guid.trim() !== '' 
                        ? { guid: item.guid }
                        : { name: item.name, companyId, guid: { $in: [null, ''] } };
                    
                    // Ensure all required fields are properly set
                    const stockItemToStore = {
                        ...raw, // Raw data first
                        ...item, // Processed data (this will override raw with processed values)
                        companyId, 
                        year: date.getFullYear(),
                        lastUpdated: new Date()
                    };
                    
                    // Remove rawData from the main document to avoid duplication
                    const { rawData, ...itemWithoutRaw } = stockItemToStore;
                    itemWithoutRaw.rawData = raw;
                    
                    await TallyStockItem.updateOne(
                        query,
                        { $set: itemWithoutRaw },
                        { upsert: true }
                    );
                    
                    processedItems++;
                    
                    // Log progress every 50 items
                    if (processedItems % 50 === 0) {
                        console.log(`📦 Processed ${processedItems}/${normalizedStockItems.length} stock items...`);
                    }
                } catch (itemError) {
                    console.error(`❌ Error processing stock item "${item.name}":`, itemError.message);
                    result.errors.push(`Stock item "${item.name}" error: ${itemError.message}`);
                    skippedItems++;
                }
            }
            
            result.stockItems = processedItems;
            console.log(`✅ Synced ${processedItems} stock items (${skippedItems} skipped)`);
            
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
};*/

// Fetch vouchers only, now non-blocking with progress polling
exports.fetchTallyVouchers = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        
        // Allow custom date range from request body
        let customFromDate = req.body?.fromDate;
        let customToDate = req.body?.toDate;

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
        
        // Pass custom date range to the background function
        setImmediate(() => runVoucherFetch(companyId, customFromDate, customToDate));

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

// Test Tally connection and fetch a small sample
exports.testTallyConnection = async (req, res) => {
    try {
        const tallyService = new (require('../services/tallyService'))();
        
        // Test with just yesterday's data
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const today = new Date();
        
        const from = yesterday.toISOString().split('T')[0].replace(/-/g, '');
        const to = today.toISOString().split('T')[0].replace(/-/g, '');
        
        console.log(`🧪 Testing Tally connection with minimal data: ${from}-${to}`);
        
        const testData = await tallyService.fetchVouchersMinimal(from, to);
        const normalized = tallyService.normalizeVouchers(testData);
        
        res.status(200).json({
            status: 200,
            message: 'Tally connection test successful',
            data: {
                dateRange: `${from}-${to}`,
                voucherCount: normalized.length,
                sampleVouchers: normalized.slice(0, 3) // Show first 3 for testing
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            message: 'Tally connection test failed',
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

// Get Stock Items with enhanced filtering and data
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
        
        // Search filter - search across multiple fields
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { aliasName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { stockItemCode: { $regex: search, $options: 'i' } },
                { hsnCode: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Category filter - search across category-related fields
        if (category) {
            query.$or = [
                { category: { $regex: category, $options: 'i' } },
                { stockGroup: { $regex: category, $options: 'i' } },
                { parent: { $regex: category, $options: 'i' } }
            ];
        }
        
        // Stock status filter with enhanced logic
        if (stock) {
            switch (stock) {
                case 'in-stock':
                    query.closingQty = { $gt: 0 };
                    break;
                case 'low-stock':
                    // Low stock: between 0 and reorder level (or 10 if no reorder level)
                    query.$and = [
                        { closingQty: { $gt: 0 } },
                        { 
                            $or: [
                                { closingQty: { $lte: 10 } }, // Default low stock threshold
                                { $and: [
                                    { reorderLevel: { $gt: 0 } },
                                    { closingQty: { $lte: '$reorderLevel' } }
                                ]}
                            ]
                        }
                    ];
                    break;
                case 'critical-stock':
                    // Critical stock: between 0 and minimum level (or 5 if no minimum)
                    query.$and = [
                        { closingQty: { $gt: 0 } },
                        { 
                            $or: [
                                { closingQty: { $lte: 5 } }, // Default critical threshold
                                { $and: [
                                    { minimumLevel: { $gt: 0 } },
                                    { closingQty: { $lte: '$minimumLevel' } }
                                ]}
                            ]
                        }
                    ];
                    break;
                case 'out-of-stock':
                    query.closingQty = { $lte: 0 };
                    break;
                case 'overstock':
                    // Overstock: above maximum level
                    query.$and = [
                        { maximumLevel: { $gt: 0 } },
                        { closingQty: { $gt: '$maximumLevel' } }
                    ];
                    break;
                default:
                    break;
            }
        }

        // Aggregation pipeline for enhanced data with calculated fields
        const pipeline = [
            { $match: query },
            {
                $addFields: {
                    // Calculate actual rates if not present
                    actualClosingRate: {
                        $cond: {
                            if: { $gt: ['$closingRate', 0] },
                            then: '$closingRate',
                            else: {
                                $cond: {
                                    if: { $gt: ['$closingQty', 0] },
                                    then: { $divide: ['$closingValue', '$closingQty'] },
                                    else: 0
                                }
                            }
                        }
                    },
                    // Calculate stock turnover (simplified)
                    stockTurnover: {
                        $cond: {
                            if: { $gt: ['$openingQty', 0] },
                            then: { $divide: ['$closingQty', '$openingQty'] },
                            else: 1
                        }
                    },
                    // Calculate value change percentage
                    valueChangePercent: {
                        $cond: {
                            if: { $gt: ['$openingValue', 0] },
                            then: { 
                                $multiply: [
                                    { $divide: [
                                        { $subtract: ['$closingValue', '$openingValue'] },
                                        '$openingValue'
                                    ]},
                                    100
                                ]
                            },
                            else: 0
                        }
                    },
                    // Determine stock status based on levels
                    calculatedStockStatus: {
                        $cond: {
                            if: { $lte: ['$closingQty', 0] },
                            then: 'Out of Stock',
                            else: {
                                $cond: {
                                    if: { $and: [
                                        { $gt: ['$maximumLevel', 0] },
                                        { $gt: ['$closingQty', '$maximumLevel'] }
                                    ]},
                                    then: 'Overstock',
                                    else: {
                                        $cond: {
                                            if: { $and: [
                                                { $gt: ['$minimumLevel', 0] },
                                                { $lte: ['$closingQty', '$minimumLevel'] }
                                            ]},
                                            then: 'Critical Stock',
                                            else: {
                                                $cond: {
                                                    if: { $and: [
                                                        { $gt: ['$reorderLevel', 0] },
                                                        { $lte: ['$closingQty', '$reorderLevel'] }
                                                    ]},
                                                    then: 'Low Stock',
                                                    else: 'In Stock'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $sort: { name: 1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
        ];

        const stockItems = await TallyStockItem.aggregate(pipeline);
        
        // Get total count for pagination
        const totalPipeline = [
            { $match: query },
            { $count: "total" }
        ];
        const totalResult = await TallyStockItem.aggregate(totalPipeline);
        const total = totalResult.length > 0 ? totalResult[0].total : 0;

        // Get summary statistics
        const summaryPipeline = [
            { $match: { companyId, year: currentYear } },
            {
                $group: {
                    _id: null,
                    totalItems: { $sum: 1 },
                    totalValue: { $sum: '$closingValue' },
                    totalQuantity: { $sum: '$closingQty' },
                    inStockCount: { 
                        $sum: { $cond: [{ $gt: ['$closingQty', 0] }, 1, 0] }
                    },
                    outOfStockCount: { 
                        $sum: { $cond: [{ $lte: ['$closingQty', 0] }, 1, 0] }
                    },
                    lowStockCount: { 
                        $sum: { 
                            $cond: [
                                { $and: [
                                    { $gt: ['$closingQty', 0] },
                                    { $lte: ['$closingQty', 10] }
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            }
        ];
        
        const summaryResult = await TallyStockItem.aggregate(summaryPipeline);
        const summary = summaryResult.length > 0 ? summaryResult[0] : {
            totalItems: 0,
            totalValue: 0,
            totalQuantity: 0,
            inStockCount: 0,
            outOfStockCount: 0,
            lowStockCount: 0
        };

        res.status(200).json({
            status: 200,
            data: {
                stockItems,
                total,
                summary,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    total,
                    limit
                }
            }
        });

    } catch (error) {
        console.error('Stock items fetch error:', error);
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
        const syncStartTime = Date.now();
        
        const results = {
            companies: 0,
            ledgers: 0,
            groups: 0,
            stockItems: 0,
            vouchers: 0,
            costCenters: 0,
            currencies: 0,
            errors: [],
            clearedCount: 0
        };

        console.log('🔄 Starting comprehensive Tally data sync...');
        console.log(`📊 Company ID: ${companyId}`);
        console.log(`🕒 Started at: ${new Date().toISOString()}`);

        // ===== CLEAR EXISTING DATA FIRST =====
        console.log('🗑️ Clearing existing comprehensive sync data...');
        try {
            const clearResults = await Promise.all([
                TallyCompany.deleteMany({ companyId }),
                TallyLedger.deleteMany({ companyId }),
                TallyGroup.deleteMany({ companyId }),
                TallyStockItem.deleteMany({ companyId }),
                TallyVoucher.deleteMany({ companyId }),
                TallyCostCenter.deleteMany({ companyId }),
                TallyCurrency.deleteMany({ companyId })
            ]);
            
            const totalCleared = clearResults.reduce((sum, result) => sum + result.deletedCount, 0);
            results.clearedCount = totalCleared;
            
            console.log('✅ Existing comprehensive data cleared successfully');
            console.log(`🗑️ Cleared: ${clearResults[0].deletedCount} companies, ${clearResults[1].deletedCount} ledgers, ${clearResults[2].deletedCount} groups, ${clearResults[3].deletedCount} stock items, ${clearResults[4].deletedCount} vouchers, ${clearResults[5].deletedCount} cost centers, ${clearResults[6].deletedCount} currencies`);
            console.log(`📊 Total records cleared: ${totalCleared}`);
        } catch (clearError) {
            console.error('⚠️ Warning: Failed to clear existing data:', clearError.message);
            results.errors.push(`Data clearing error: ${clearError.message}`);
        }

        // ===== START COMPREHENSIVE SYNC =====

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

        const syncDuration = Date.now() - syncStartTime;
        console.log(`⏱️ Comprehensive sync completed in ${(syncDuration / 1000).toFixed(2)}s`);
        console.log('📊 Final Results:', results);

        res.status(200).json({
            status: 200,
            message: "Comprehensive Tally data sync completed successfully",
            data: {
                syncResults: results,
                syncedAt: new Date(),
                syncDuration: `${(syncDuration / 1000).toFixed(2)}s`,
                totalCleared: results.clearedCount,
                totalSynced: results.companies + results.ledgers + results.groups + 
                           results.stockItems + results.vouchers + results.costCenters + results.currencies,
                summary: `Cleared ${results.clearedCount} existing records, synced ${results.companies + results.ledgers + results.groups + results.stockItems + results.vouchers + results.costCenters + results.currencies} new records`
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

// ============= VOUCHER EXCEL UPLOAD CONTROLLER =============

// Ensure database indexes are configured (run once on startup)
let indexesEnsured = false;
async function ensureVoucherIndexes() {
    if (indexesEnsured) return;
    
    try {
        console.log('🔧 Ensuring voucher database indexes...');
        const existingIndexes = await TallyVoucher.collection.getIndexes();
        const requiredIndexName = 'voucherNumber_1_companyId_1';
        
        if (!existingIndexes[requiredIndexName] || !existingIndexes[requiredIndexName].unique) {
            console.log('⚠️  Creating unique index for voucher duplicate prevention...');
            await TallyVoucher.collection.createIndex(
                { voucherNumber: 1, companyId: 1 }, 
                { unique: true, name: requiredIndexName, background: true }
            );
            console.log('✅ Unique index created successfully');
        }
        indexesEnsured = true;
    } catch (error) {
        console.error('❌ Failed to ensure indexes:', error);
        // Don't fail the upload, but log the warning
    }
}

exports.uploadVoucherExcel = async (req, res) => {
    try {
        // Ensure database indexes are configured
        await ensureVoucherIndexes();
        
        const companyId = mongoose.Types.ObjectId(req.userid);
        const voucherData = JSON.parse(req.body.voucherData || '[]');
        const fileName = req.body.fileName || 'voucher-upload.xlsx';
        
        console.log(`📤 Starting voucher Excel upload for company: ${companyId}`);
        console.log(`📊 Processing ${voucherData.length} vouchers from file: ${fileName}`);
        
        if (!voucherData || voucherData.length === 0) {
            return res.status(400).json({
                status: 400,
                message: "No voucher data provided"
            });
        }

        // Track upload statistics with enhanced details
        const uploadStats = {
            total: voucherData.length,
            uploaded: 0,
            duplicates: 0,
            dbDuplicates: 0, // Duplicates found in database
            fileDuplicates: 0, // Duplicates within the uploaded file
            errors: 0,
            errorDetails: [],
            duplicateDetails: []
        };

        // Step 1: Check for duplicates within the uploaded file
        const seenVouchers = new Map();
        const uniqueVouchers = [];
        
        for (const voucher of voucherData) {
            const voucherNumber = String(voucher.voucherNumber || '').trim();
            
            if (!voucherNumber) {
                uploadStats.errors++;
                uploadStats.errorDetails.push(`Empty voucher number at row ${voucherData.indexOf(voucher) + 1}`);
                continue;
            }
            
            // Create a unique key based on voucher number (primary key)
            const uniqueKey = `${voucherNumber.toLowerCase()}`;
            
            if (seenVouchers.has(uniqueKey)) {
                uploadStats.fileDuplicates++;
                uploadStats.duplicateDetails.push(`Duplicate voucher number within file: ${voucherNumber} (rows ${seenVouchers.get(uniqueKey)} and ${voucherData.indexOf(voucher) + 1})`);
                continue;
            }
            
            seenVouchers.set(uniqueKey, voucherData.indexOf(voucher) + 1);
            uniqueVouchers.push(voucher);
        }
        
        console.log(`📋 File validation: ${uniqueVouchers.length} unique vouchers, ${uploadStats.fileDuplicates} duplicates within file`);

        // Step 2: Check for existing vouchers in database (Enhanced check)
        const voucherNumbers = uniqueVouchers.map(v => String(v.voucherNumber || '').trim());
        console.log(`🔍 Checking ${voucherNumbers.length} voucher numbers against database...`);
        
        const existingVouchers = await TallyVoucher.find({
            voucherNumber: { $in: voucherNumbers },
            companyId: companyId
        }).select('voucherNumber date voucherType party amount createdAt');

        // Create a map of existing vouchers for quick lookup
        const existingVoucherMap = new Map();
        existingVouchers.forEach(existing => {
            const key = `${existing.voucherNumber.toLowerCase()}`;
            existingVoucherMap.set(key, existing);
        });

        console.log(`� Found ${existingVouchers.length} existing vouchers in database:`);
        existingVouchers.forEach(existing => {
            console.log(`   - ${existing.voucherNumber} (Date: ${existing.date?.toDateString()}, Amount: ${existing.amount})`);
        });

        // STRICT MODE: If any vouchers already exist, provide clear feedback
        if (existingVouchers.length > 0) {
            const existingNumbers = existingVouchers.map(v => v.voucherNumber).join(', ');
            console.log(`🛑 DUPLICATE DETECTION: ${existingVouchers.length} vouchers already exist in database`);
            
            // Still process non-duplicates, but give clear feedback about what was rejected
            uploadStats.dbDuplicates = existingVouchers.length;
        }

        // Step 3: Process only new vouchers
        const bulkOps = [];
        const newVouchers = [];
        
        for (const voucher of uniqueVouchers) {
            try {
                const voucherNumber = String(voucher.voucherNumber || '').trim();
                const uniqueKey = `${voucherNumber.toLowerCase()}`;
                
                // Check if voucher already exists in database
                if (existingVoucherMap.has(uniqueKey)) {
                    const existing = existingVoucherMap.get(uniqueKey);
                    uploadStats.dbDuplicates++;
                    uploadStats.duplicateDetails.push(`Voucher already exists in database: ${voucherNumber} (Existing: Date: ${existing.date?.toDateString()}, Type: ${existing.voucherType}, Amount: ${existing.amount})`);
                    console.log(`🚫 Skipping duplicate voucher: ${voucherNumber} (already exists in database)`);
                    continue;
                }

                // Parse and validate date
                const voucherDate = new Date(voucher.date);
                if (isNaN(voucherDate.getTime())) {
                    uploadStats.errors++;
                    uploadStats.errorDetails.push(`Invalid date for voucher: ${voucherNumber} - ${voucher.date}`);
                    continue;
                }

                // Validate required fields
                if (!voucher.voucherType || String(voucher.voucherType).trim() === '') {
                    uploadStats.errors++;
                    uploadStats.errorDetails.push(`Missing voucher type for voucher: ${voucherNumber}`);
                    continue;
                }

                if (voucher.amount === undefined || voucher.amount === null || isNaN(parseFloat(voucher.amount))) {
                    uploadStats.errors++;
                    uploadStats.errorDetails.push(`Invalid or missing amount for voucher: ${voucherNumber} - ${voucher.amount}`);
                    continue;
                }

                // Prepare voucher document with enhanced validation
                const voucherDoc = {
                    date: voucherDate,
                    voucherNumber: voucherNumber,
                    voucherType: String(voucher.voucherType || '').trim(),
                    voucherTypeName: String(voucher.voucherTypeName || '').trim(),
                    party: String(voucher.party || '').trim(),
                    partyledgername: String(voucher.partyledgername || '').trim(),
                    amount: parseFloat(voucher.amount || 0),
                    narration: String(voucher.narration || '').trim(),
                    reference: String(voucher.reference || '').trim(),
                    isDeemedPositive: Boolean(voucher.isDeemedPositive),
                    companyId: companyId,
                    year: voucherDate.getFullYear(),
                    lastUpdated: new Date(),
                    // Store upload metadata
                    uploadSource: 'excel',
                    uploadFileName: fileName,
                    uploadDate: new Date(),
                    uploadBatch: new Date().getTime() // Unique batch identifier
                };

                // Strict filter using voucher number as primary key
                const filter = {
                    voucherNumber: voucherDoc.voucherNumber,
                    companyId: companyId
                };

                // Add to bulk operations - insert only (no upsert to prevent accidental updates)
                bulkOps.push({
                    insertOne: {
                        document: voucherDoc
                    }
                });
                
                newVouchers.push(voucherDoc);

            } catch (voucherError) {
                uploadStats.errors++;
                uploadStats.errorDetails.push(`Error processing voucher ${voucher.voucherNumber || 'unknown'}: ${voucherError.message}`);
                console.error(`❌ Error processing voucher ${voucher.voucherNumber || 'unknown'}:`, voucherError.message);
            }
        }

        // Step 4: Execute bulk operations with strict duplicate prevention
        let actualInsertedCount = 0;
        if (bulkOps.length > 0) {
            console.log(`💾 Executing bulk insert operations for ${bulkOps.length} new vouchers...`);
            
            try {
                // Use insertMany instead of bulkWrite for stricter control
                const documentsToInsert = bulkOps.map(op => op.insertOne.document);
                
                // Double-check for any remaining duplicates before inserting
                console.log(`🔒 Final duplicate check before insertion...`);
                const finalCheck = await TallyVoucher.find({
                    voucherNumber: { $in: documentsToInsert.map(doc => doc.voucherNumber) },
                    companyId: companyId
                }).select('voucherNumber');
                
                if (finalCheck.length > 0) {
                    console.log(`⚠️  Found ${finalCheck.length} last-minute duplicates, filtering them out...`);
                    const lastMinuteDuplicates = new Set(finalCheck.map(v => v.voucherNumber.toLowerCase()));
                    
                    const finalDocuments = documentsToInsert.filter(doc => {
                        const isNotDuplicate = !lastMinuteDuplicates.has(doc.voucherNumber.toLowerCase());
                        if (!isNotDuplicate) {
                            uploadStats.dbDuplicates++;
                            uploadStats.duplicateDetails.push(`Last-minute duplicate detected: ${doc.voucherNumber}`);
                        }
                        return isNotDuplicate;
                    });
                    
                    if (finalDocuments.length > 0) {
                        const result = await TallyVoucher.insertMany(finalDocuments, { 
                            ordered: false,
                            writeConcern: { w: 'majority', wtimeout: 30000 }
                        });
                        actualInsertedCount = result.length;
                    }
                } else {
                    // No last-minute duplicates, proceed with insertion
                    const result = await TallyVoucher.insertMany(documentsToInsert, { 
                        ordered: false,
                        writeConcern: { w: 'majority', wtimeout: 30000 }
                    });
                    actualInsertedCount = result.length;
                }
                
                uploadStats.uploaded = actualInsertedCount;
                console.log(`✅ Successfully inserted ${actualInsertedCount} vouchers`);
                
            } catch (bulkError) {
                console.error('❌ Bulk insert error:', bulkError);
                
                // Handle duplicate key errors specifically
                if (bulkError.code === 11000 || (bulkError.writeErrors && bulkError.writeErrors.some(e => e.code === 11000))) {
                    console.log('🚫 Duplicate key errors detected during insertion');
                    const duplicateErrors = bulkError.writeErrors ? bulkError.writeErrors.filter(e => e.code === 11000) : [];
                    
                    uploadStats.dbDuplicates += duplicateErrors.length;
                    uploadStats.uploaded = (bulkError.result && bulkError.result.insertedCount) || 0;
                    
                    duplicateErrors.forEach(error => {
                        const voucherNum = error.op?.voucherNumber || 'unknown';
                        uploadStats.duplicateDetails.push(`Database rejected duplicate: ${voucherNum}`);
                    });
                } else {
                    uploadStats.errors += bulkOps.length;
                    uploadStats.errorDetails.push(`Bulk insert operation failed: ${bulkError.message}`);
                }
            }
        }

        // Calculate final statistics
        uploadStats.duplicates = uploadStats.dbDuplicates + uploadStats.fileDuplicates;
        
        console.log(`✅ Voucher upload completed:`);
        console.log(`   - Total processed: ${uploadStats.total}`);
        console.log(`   - Successfully uploaded: ${uploadStats.uploaded}`);
        console.log(`   - File duplicates: ${uploadStats.fileDuplicates}`);
        console.log(`   - Database duplicates: ${uploadStats.dbDuplicates}`);
        console.log(`   - Total duplicates rejected: ${uploadStats.duplicates}`);
        console.log(`   - Errors: ${uploadStats.errors}`);

        // Return enhanced response with detailed statistics
        res.status(201).json({
            status: 201,
            message: "Voucher upload completed successfully",
            data: {
                uploadStats: {
                    ...uploadStats,
                    // Limit error details to prevent large responses
                    errorDetails: uploadStats.errorDetails.slice(0, 10),
                    duplicateDetails: uploadStats.duplicateDetails.slice(0, 10),
                    hasMoreErrors: uploadStats.errorDetails.length > 10,
                    hasMoreDuplicates: uploadStats.duplicateDetails.length > 10
                },
                summary: `${uploadStats.uploaded} vouchers uploaded, ${uploadStats.duplicates} duplicates rejected (${uploadStats.fileDuplicates} in file, ${uploadStats.dbDuplicates} in database), ${uploadStats.errors} errors`,
                recommendations: uploadStats.duplicates > 0 || uploadStats.errors > 0 ? [
                    ...(uploadStats.fileDuplicates > 0 ? ["Review Excel file for duplicate voucher numbers"] : []),
                    ...(uploadStats.dbDuplicates > 0 ? ["Some vouchers already exist in database with same voucher numbers"] : []),
                    ...(uploadStats.errors > 0 ? ["Check error details for validation issues"] : [])
                ] : []
            }
        });

    } catch (error) {
        console.error('❌ Voucher upload error:', error);
        res.status(500).json({
            status: 500,
            message: "Failed to upload vouchers",
            error: error.message
        });
    }
};

// Verify voucher numbers before upload (optional endpoint for pre-checking)
exports.verifyVoucherNumbers = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        const { voucherNumbers } = req.body;
        
        if (!voucherNumbers || !Array.isArray(voucherNumbers)) {
            return res.status(400).json({
                status: 400,
                message: "Voucher numbers array is required"
            });
        }
        
        console.log(`🔍 Verifying ${voucherNumbers.length} voucher numbers...`);
        
        const existingVouchers = await TallyVoucher.find({
            voucherNumber: { $in: voucherNumbers.map(v => String(v).trim()) },
            companyId: companyId
        }).select('voucherNumber date voucherType amount');
        
        const existingNumbers = existingVouchers.map(v => v.voucherNumber.toLowerCase());
        const results = voucherNumbers.map(voucherNum => {
            const exists = existingNumbers.includes(String(voucherNum).toLowerCase());
            const existingVoucher = existingVouchers.find(v => 
                v.voucherNumber.toLowerCase() === String(voucherNum).toLowerCase()
            );
            
            return {
                voucherNumber: voucherNum,
                exists,
                existing: exists ? {
                    date: existingVoucher.date,
                    voucherType: existingVoucher.voucherType,
                    amount: existingVoucher.amount
                } : null
            };
        });
        
        const duplicateCount = results.filter(r => r.exists).length;
        
        res.status(200).json({
            status: 200,
            message: `Verification completed: ${duplicateCount} duplicates found`,
            data: {
                total: voucherNumbers.length,
                duplicates: duplicateCount,
                unique: voucherNumbers.length - duplicateCount,
                results
            }
        });
        
    } catch (error) {
        console.error('❌ Verification error:', error);
        res.status(500).json({
            status: 500,
            message: "Failed to verify voucher numbers",
            error: error.message
        });
    }
};

