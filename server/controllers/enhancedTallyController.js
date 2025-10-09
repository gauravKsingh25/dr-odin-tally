/**
 * Enhanced Tally Controller Method for Comprehensive Ledger Data
 * This adds new endpoints to the existing tally controller for enhanced data retrieval
 */

// Add this to your existing tally.controller.js file

// Enhanced comprehensive sync endpoint
exports.runEnhancedSync = async (req, res) => {
    try {
        console.log('🚀 Starting enhanced comprehensive sync...');
        
        const EnhancedTallySync = require('../scripts/enhancedTallySync');
        const enhancedSync = new EnhancedTallySync();
        
        // Run the enhanced sync
        const results = await enhancedSync.syncEnhancedLedgerData();
        
        console.log('✅ Enhanced sync completed');
        
        res.status(200).json({
            status: 200,
            message: 'Enhanced sync completed successfully',
            data: {
                results: results,
                timestamp: new Date().toISOString(),
                syncType: 'enhanced_comprehensive'
            }
        });
        
    } catch (error) {
        console.error('❌ Enhanced sync error:', error);
        res.status(500).json({
            status: 500,
            message: 'Enhanced sync failed',
            error: error.message
        });
    }
};

// Get enhanced ledger details with comprehensive information
exports.getEnhancedLedgers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        
        const {
            search,
            group,
            balance,
            fromDate,
            toDate,
            hasBank,
            hasContact,
            hasGST
        } = req.query;

        // Build comprehensive query
        let query = {};
        
        // Basic filters
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { aliasName: { $regex: search, $options: 'i' } },
                { 'contact.email': { $regex: search, $options: 'i' } },
                { 'contact.phone': { $regex: search, $options: 'i' } },
                { gstin: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (group) {
            query.parent = { $regex: group, $options: 'i' };
        }
        
        // Balance filters
        if (balance === 'positive') {
            query.$or = [
                { openingBalance: { $gt: 0 } },
                { closingBalance: { $gt: 0 } }
            ];
        } else if (balance === 'negative') {
            query.$or = [
                { openingBalance: { $lt: 0 } },
                { closingBalance: { $lt: 0 } }
            ];
        } else if (balance === 'zero') {
            query.openingBalance = 0;
            query.closingBalance = 0;
        }
        
        // Enhanced filters
        if (hasBank === 'true') {
            query['bankDetails.bankName'] = { $ne: '' };
        }
        
        if (hasContact === 'true') {
            query.$or = [
                { 'contact.email': { $ne: '' } },
                { 'contact.phone': { $ne: '' } }
            ];
        }
        
        if (hasGST === 'true') {
            query.gstin = { $ne: '' };
        }
        
        // Date range filter
        if (fromDate && toDate) {
            query.lastUpdated = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate)
            };
        }
        
        console.log('🔍 Enhanced ledger query:', JSON.stringify(query, null, 2));
        
        // Execute query with enhanced fields
        const [ledgers, total] = await Promise.all([
            TallyLedger.find(query)
                .select(`
                    name aliasName reservedName parent guid masterId alterId description
                    openingBalance closingBalance
                    contact bankDetails gstDetails taxInfo addressList
                    city state country pincode
                    creditLimit creditPeriod interestRate isBillWiseOn
                    billWiseDetails voucherSummary
                    isGroup isCostCentresOn isInterestOn isGSTApplicable
                    contactPerson email ledgerPhone ledgerFax website
                    gstregistrationtype gstin incometaxnumber salestaxnumber
                    lastModified created lastUpdated hasRelatedVouchers
                `)
                .sort({ name: 1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            TallyLedger.countDocuments(query)
        ]);
        
        console.log(`📊 Found ${total} enhanced ledgers, returning ${ledgers.length}`);
        
        // Calculate enhanced statistics
        const stats = await TallyLedger.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalLedgers: { $sum: 1 },
                    totalOpeningBalance: { $sum: '$openingBalance' },
                    totalClosingBalance: { $sum: '$closingBalance' },
                    ledgersWithBank: { $sum: { $cond: [{ $ne: ['$bankDetails.bankName', ''] }, 1, 0] } },
                    ledgersWithContact: { $sum: { $cond: [{ $ne: ['$contact.email', ''] }, 1, 0] } },
                    ledgersWithGST: { $sum: { $cond: [{ $ne: ['$gstin', ''] }, 1, 0] } },
                    ledgersWithVouchers: { $sum: { $cond: ['$hasRelatedVouchers', 1, 0] } }
                }
            }
        ]);
        
        res.status(200).json({
            status: 200,
            message: 'Enhanced ledgers retrieved successfully',
            data: {
                ledgers: ledgers,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(total / limit),
                    totalRecords: total,
                    recordsPerPage: limit,
                    hasNextPage: page < Math.ceil(total / limit),
                    hasPrevPage: page > 1
                },
                statistics: stats[0] || {},
                filters: {
                    search, group, balance, fromDate, toDate, hasBank, hasContact, hasGST
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Enhanced ledgers fetch error:', error);
        res.status(500).json({
            status: 500,
            message: 'Failed to fetch enhanced ledgers',
            error: error.message
        });
    }
};

// Get ledger with related vouchers/invoices
exports.getLedgerWithRelatedData = async (req, res) => {
    try {
        const { ledgerId } = req.params;
        
        console.log(`🔍 Fetching comprehensive data for ledger: ${ledgerId}`);
        
        // Get ledger details
        const ledger = await TallyLedger.findById(ledgerId).lean();
        
        if (!ledger) {
            return res.status(404).json({
                status: 404,
                message: 'Ledger not found'
            });
        }
        
        // Get related vouchers
        const relatedVouchers = await TallyVoucher.find({
            $or: [
                { party: { $regex: new RegExp(ledger.name, 'i') } },
                { partyLedgerName: { $regex: new RegExp(ledger.name, 'i') } },
                ...(ledger.aliasName ? [{ party: { $regex: new RegExp(ledger.aliasName, 'i') } }] : [])
            ]
        })
        .sort({ date: -1 })
        .limit(50)
        .lean();
        
        // Calculate voucher statistics
        const voucherStats = {
            totalVouchers: relatedVouchers.length,
            totalAmount: relatedVouchers.reduce((sum, v) => sum + (v.amount || 0), 0),
            voucherTypes: [...new Set(relatedVouchers.map(v => v.voucherType))],
            dateRange: relatedVouchers.length > 0 ? {
                from: relatedVouchers[relatedVouchers.length - 1]?.date,
                to: relatedVouchers[0]?.date
            } : null
        };
        
        res.status(200).json({
            status: 200,
            message: 'Comprehensive ledger data retrieved successfully',
            data: {
                ledger: ledger,
                relatedVouchers: relatedVouchers,
                voucherStatistics: voucherStats,
                dataCompleteness: {
                    hasBasicInfo: !!(ledger.name && ledger.parent),
                    hasBankDetails: !!(ledger.bankDetails?.bankName),
                    hasContactInfo: !!(ledger.contact?.email || ledger.contact?.phone),
                    hasGSTDetails: !!(ledger.gstin),
                    hasAddressInfo: !!(ledger.addressList?.length),
                    hasFinancialData: !!(ledger.openingBalance || ledger.closingBalance),
                    hasRelatedTransactions: relatedVouchers.length > 0
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Comprehensive ledger data fetch error:', error);
        res.status(500).json({
            status: 500,
            message: 'Failed to fetch comprehensive ledger data',
            error: error.message
        });
    }
};

// Test enhanced sync quality
exports.testEnhancedSyncQuality = async (req, res) => {
    try {
        console.log('🧪 Testing enhanced sync quality...');
        
        const EnhancedTallySync = require('../scripts/enhancedTallySync');
        const enhancedSync = new EnhancedTallySync();
        
        const qualityReport = await enhancedSync.testSyncQuality();
        
        res.status(200).json({
            status: 200,
            message: 'Sync quality test completed',
            data: qualityReport
        });
        
    } catch (error) {
        console.error('❌ Sync quality test error:', error);
        res.status(500).json({
            status: 500,
            message: 'Sync quality test failed',
            error: error.message
        });
    }
};

module.exports = {
    runEnhancedSync: exports.runEnhancedSync,
    getEnhancedLedgers: exports.getEnhancedLedgers,
    getLedgerWithRelatedData: exports.getLedgerWithRelatedData,
    testEnhancedSyncQuality: exports.testEnhancedSyncQuality
};