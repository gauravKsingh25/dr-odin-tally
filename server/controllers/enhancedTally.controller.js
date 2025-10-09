const TallyLedger = require('../models/tallyLedger.model');
const TallyService = require('../services/tallyService');
const mongoose = require('mongoose');

// Enhanced Full Sync Controller
exports.fullSyncWithoutVouchers = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        const syncStartTime = Date.now();

        console.log('🔄 Starting enhanced full sync (excluding vouchers)...');
        console.log(`📊 Company ID: ${companyId}`);

        const results = {
            ledgers: 0,
            errors: [],
            clearedCount: 0,
        };

        // Clear existing ledger data for the company
        console.log('🗑️ Clearing existing ledger data...');
        const clearResult = await TallyLedger.deleteMany({ companyId });
        results.clearedCount = clearResult.deletedCount;
        console.log(`✅ Cleared ${results.clearedCount} ledgers`);

        // Fetch enhanced ledger data from Tally
        console.log('📊 Fetching enhanced ledger data from Tally...');
        const tallyService = new TallyService();
        const ledgerPayload = tallyService.getEnhancedLedgerPayload();
        const ledgerResponse = await tallyService.sendRequest(ledgerPayload);

        // Normalize ledger data
        console.log('🔍 Normalizing ledger data...');
        const normalizedLedgers = tallyService.normalizeEnhancedLedgers(ledgerResponse);
        console.log(`✅ Normalized ${normalizedLedgers.length} ledgers`);

        // Bulk insert/update ledgers in MongoDB
        console.log('📦 Storing ledgers in MongoDB...');
        const bulkOps = normalizedLedgers.map((ledger) => {
            const query = ledger.guid && ledger.guid.trim() !== ''
                ? { guid: ledger.guid, companyId }
                : { name: ledger.name, companyId };

            return {
                updateOne: {
                    filter: query,
                    update: { $set: { ...ledger, companyId, lastUpdated: new Date() } },
                    upsert: true,
                },
            };
        });

        const bulkResult = await TallyLedger.bulkWrite(bulkOps, { ordered: false });
        results.ledgers = bulkResult.upsertedCount + bulkResult.modifiedCount;
        console.log(`✅ Stored ${results.ledgers} ledgers in MongoDB`);

        const syncEndTime = Date.now();
        console.log(`⏱️ Full sync completed in ${(syncEndTime - syncStartTime) / 1000}s`);

        res.status(200).json({
            status: 200,
            message: 'Enhanced full sync (excluding vouchers) completed successfully',
            data: results,
        });
    } catch (error) {
        console.error('❌ Error during full sync:', error);
        res.status(500).json({
            status: 500,
            message: 'Failed to complete full sync',
            error: error.message,
        });
    }
};