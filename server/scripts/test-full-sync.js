const TallyService = require('../services/tallyService');
const TallyCompany = require('../models/tallyCompany.model');
const TallyLedger = require('../models/tallyLedger.model');
const TallyStockItem = require('../models/tallyStockItem.model');
const TallyVoucher = require('../models/tallyVoucher.model');
const mongoose = require('mongoose');

async function syncWithDatabase() {
    console.log('🔄 Testing Full Sync with MongoDB...');
    
    try {
        // Connect to MongoDB
        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/odin_hcpvt_db', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');

        const tallyService = new TallyService();
        let totalSynced = 0;

        // Sync Companies
        console.log('\n📊 Syncing Companies...');
        try {
            const companiesResponse = await tallyService.fetchCompanyInfo();
            const companies = tallyService.normalizeCompanyInfo(companiesResponse);
            
            for (const company of companies) {
                await TallyCompany.findOneAndUpdate(
                    { name: company.name },
                    company,
                    { upsert: true, new: true }
                );
            }
            console.log(`✅ Synced ${companies.length} companies`);
            totalSynced += companies.length;
        } catch (error) {
            console.log(`❌ Companies sync failed: ${error.message}`);
        }

        // Sync Ledgers (limited to 100 for speed)
        console.log('\n📋 Syncing Ledgers (sample of 100)...');
        try {
            const ledgersResponse = await tallyService.fetchLedgers();
            const ledgers = tallyService.normalizeLedgers(ledgersResponse);
            
            let syncedLedgers = 0;
            for (const ledger of ledgers.slice(0, 100)) {
                await TallyLedger.findOneAndUpdate(
                    { name: ledger.name },
                    ledger,
                    { upsert: true, new: true }
                );
                syncedLedgers++;
            }
            console.log(`✅ Synced ${syncedLedgers} ledgers (sample)`);
            totalSynced += syncedLedgers;
        } catch (error) {
            console.log(`❌ Ledgers sync failed: ${error.message}`);
        }

        // Sync Stock Items (limited to 50 for speed)
        console.log('\n📦 Syncing Stock Items (sample of 50)...');
        try {
            const stockResponse = await tallyService.fetchStockItems();
            const stockItems = tallyService.normalizeStockItems(stockResponse);
            
            let syncedItems = 0;
            for (const item of stockItems.slice(0, 50)) {
                await TallyStockItem.findOneAndUpdate(
                    { name: item.name },
                    item,
                    { upsert: true, new: true }
                );
                syncedItems++;
            }
            console.log(`✅ Synced ${syncedItems} stock items (sample)`);
            totalSynced += syncedItems;
        } catch (error) {
            console.log(`❌ Stock Items sync failed: ${error.message}`);
        }

        // Sync Voucher Types
        console.log('\n📄 Syncing Voucher Types...');
        try {
            const vouchersResponse = await tallyService.fetchVouchers();
            const vouchers = tallyService.normalizeVouchers(vouchersResponse);
            
            for (const voucher of vouchers) {
                await TallyVoucher.findOneAndUpdate(
                    { name: voucher.name || voucher.voucherType },
                    voucher,
                    { upsert: true, new: true }
                );
            }
            console.log(`✅ Synced ${vouchers.length} voucher types`);
            totalSynced += vouchers.length;
        } catch (error) {
            console.log(`❌ Voucher Types sync failed: ${error.message}`);
        }

        console.log(`\n🎉 Sync completed! Total records synced: ${totalSynced}`);
        
        // Check database counts
        console.log('\n📊 Database Summary:');
        const companiesCount = await TallyCompany.countDocuments();
        const ledgersCount = await TallyLedger.countDocuments();
        const stockItemsCount = await TallyStockItem.countDocuments();
        const vouchersCount = await TallyVoucher.countDocuments();
        
        console.log(`- Companies in DB: ${companiesCount}`);
        console.log(`- Ledgers in DB: ${ledgersCount}`);
        console.log(`- Stock Items in DB: ${stockItemsCount}`);
        console.log(`- Vouchers in DB: ${vouchersCount}`);

    } catch (error) {
        console.error('❌ Sync failed:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

syncWithDatabase();
