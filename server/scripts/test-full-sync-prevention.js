const mongoose = require('mongoose');
const TallyService = require('../services/tallyService');
const TallyCompany = require('../models/tallyCompany.model');
const TallyLedger = require('../models/tallyLedger.model');
const TallyStockItem = require('../models/tallyStockItem.model');

// Database connection
const dbConfig = require('../config/db.config');

async function testFullSyncDuplicatePrevention() {
    try {
        // Check if already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('🔗 Connected to MongoDB');
        } else {
            console.log('🔗 Using existing MongoDB connection');
        }

        console.log('🧪 Testing FULL sync duplicate prevention logic...');
        
        const tallyService = new TallyService();

        // Test multiple full syncs (simulating server restarts)
        for (let syncRun = 1; syncRun <= 3; syncRun++) {
            console.log(`\n📡 Full Sync Run ${syncRun}:`);
            
            // 1. Sync Companies
            try {
                const companyData = await tallyService.fetchCompanyInfo();
                const normalizedCompanies = tallyService.normalizeCompanyInfo(companyData);
                
                let companyCount = 0;
                for (const company of normalizedCompanies) {
                    const query = company.guid && company.guid.trim() !== '' 
                        ? { guid: company.guid }
                        : { name: company.name, guid: { $in: [null, ''] } };
                    
                    await TallyCompany.updateOne(
                        query,
                        { 
                            $set: { 
                                ...company, 
                                year: new Date().getFullYear(),
                                lastSyncedAt: new Date(),
                                syncRun: syncRun
                            } 
                        },
                        { upsert: true }
                    );
                    companyCount++;
                }
                console.log(`   ✓ Companies: ${companyCount} processed`);
            } catch (error) {
                console.error(`   ✗ Company sync error: ${error.message}`);
            }

            // 2. Sync Ledgers (first 50 to keep test manageable)
            try {
                const ledgerData = await tallyService.fetchLedgers();
                const normalizedLedgers = tallyService.normalizeLedgers(ledgerData).slice(0, 50);
                
                let ledgerCount = 0;
                for (const ledger of normalizedLedgers) {
                    const query = ledger.guid && ledger.guid.trim() !== '' 
                        ? { guid: ledger.guid }
                        : { name: ledger.name, guid: { $in: [null, ''] } };
                    
                    await TallyLedger.updateOne(
                        query,
                        { 
                            $set: { 
                                ...ledger, 
                                year: new Date().getFullYear(),
                                lastUpdated: new Date(),
                                syncRun: syncRun
                            } 
                        },
                        { upsert: true }
                    );
                    ledgerCount++;
                }
                console.log(`   ✓ Ledgers: ${ledgerCount} processed`);
            } catch (error) {
                console.error(`   ✗ Ledger sync error: ${error.message}`);
            }

            // 3. Sync Stock Items (first 50 to keep test manageable)
            try {
                const stockData = await tallyService.fetchStockItems();
                const normalizedStockItems = tallyService.normalizeStockItems(stockData).slice(0, 50);
                
                let stockCount = 0;
                for (const item of normalizedStockItems) {
                    const query = item.guid && item.guid.trim() !== '' 
                        ? { guid: item.guid }
                        : { name: item.name, guid: { $in: [null, ''] } };
                    
                    await TallyStockItem.updateOne(
                        query,
                        { 
                            $set: { 
                                ...item, 
                                year: new Date().getFullYear(),
                                lastUpdated: new Date(),
                                syncRun: syncRun
                            } 
                        },
                        { upsert: true }
                    );
                    stockCount++;
                }
                console.log(`   ✓ Stock Items: ${stockCount} processed`);
            } catch (error) {
                console.error(`   ✗ Stock items sync error: ${error.message}`);
            }

            // Check counts after each sync run
            const companies = await TallyCompany.countDocuments();
            const ledgers = await TallyLedger.countDocuments();
            const stockItems = await TallyStockItem.countDocuments();
            
            console.log(`   📊 Totals after sync ${syncRun}: Companies=${companies}, Ledgers=${ledgers}, Stock=${stockItems}`);
        }

        // Final verification
        console.log('\n🔍 Final Duplicate Check:');
        
        // Check for duplicates in each collection
        const duplicateCompanies = await TallyCompany.aggregate([
            { $group: { _id: '$name', count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        
        const duplicateLedgers = await TallyLedger.aggregate([
            { $group: { _id: '$name', count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        
        const duplicateStockItems = await TallyStockItem.aggregate([
            { $group: { _id: '$name', count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);

        console.log(`   Companies with duplicates: ${duplicateCompanies.length}`);
        console.log(`   Ledgers with duplicates: ${duplicateLedgers.length}`);
        console.log(`   Stock Items with duplicates: ${duplicateStockItems.length}`);

        if (duplicateCompanies.length === 0 && duplicateLedgers.length === 0 && duplicateStockItems.length === 0) {
            console.log('✅ SUCCESS: No duplicates found in any collection!');
        } else {
            console.log('⚠️  WARNING: Duplicates found! This needs investigation.');
            
            if (duplicateCompanies.length > 0) {
                console.log('Duplicate companies:', duplicateCompanies.slice(0, 5));
            }
            if (duplicateLedgers.length > 0) {
                console.log('Duplicate ledgers:', duplicateLedgers.slice(0, 5));
            }
            if (duplicateStockItems.length > 0) {
                console.log('Duplicate stock items:', duplicateStockItems.slice(0, 5));
            }
        }

        // Final stats
        console.log('\n📊 Final Database Statistics:');
        const finalStats = {
            companies: await TallyCompany.countDocuments(),
            ledgers: await TallyLedger.countDocuments(),
            stockItems: await TallyStockItem.countDocuments(),
            companiesWithGuid: await TallyCompany.countDocuments({ guid: { $ne: null, $ne: '' } }),
            ledgersWithGuid: await TallyLedger.countDocuments({ guid: { $ne: null, $ne: '' } }),
            stockItemsWithGuid: await TallyStockItem.countDocuments({ guid: { $ne: null, $ne: '' } })
        };

        Object.entries(finalStats).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });

        console.log('\n🎉 Full sync duplicate prevention test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the test
testFullSyncDuplicatePrevention();
