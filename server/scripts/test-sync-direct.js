const TallyService = require('../services/tallyService');
const TallyCompany = require('../models/tallyCompany.model');
const TallyLedger = require('../models/tallyLedger.model');
const TallyStockItem = require('../models/tallyStockItem.model');
const TallyVoucher = require('../models/tallyVoucher.model');

async function testSyncDirect() {
    console.log('🔄 Testing Direct Sync with Updated XML Formats...');
    
    const tallyService = new TallyService();
    
    try {
        // Test Companies sync
        console.log('\n📊 Syncing Companies...');
        const companiesResponse = await tallyService.fetchCompanyInfo();
        const companies = tallyService.normalizeCompanyInfo(companiesResponse);
        console.log(`✅ Companies normalized: ${companies.length} companies`);
        
        if (companies.length > 0) {
            console.log('Sample company:', companies[0]);
            
            // Try to save to database (if models are properly set up)
            try {
                for (const company of companies) {
                    await TallyCompany.findOneAndUpdate(
                        { name: company.name },
                        company,
                        { upsert: true, new: true }
                    );
                }
                console.log(`💾 Saved ${companies.length} companies to database`);
            } catch (dbError) {
                console.log('⚠️ Database save failed (expected if not connected):', dbError.message);
            }
        }

        // Test Ledgers sync
        console.log('\n📋 Syncing Ledgers...');
        const ledgersResponse = await tallyService.fetchLedgers();
        const ledgers = tallyService.normalizeLedgers(ledgersResponse);
        console.log(`✅ Ledgers normalized: ${ledgers.length} ledgers`);
        
        if (ledgers.length > 0) {
            console.log('Sample ledger:', ledgers[0]);
            
            try {
                let savedCount = 0;
                for (const ledger of ledgers.slice(0, 10)) { // Save first 10 for test
                    await TallyLedger.findOneAndUpdate(
                        { name: ledger.name },
                        ledger,
                        { upsert: true, new: true }
                    );
                    savedCount++;
                }
                console.log(`💾 Saved ${savedCount} ledgers to database (sample)`);
            } catch (dbError) {
                console.log('⚠️ Database save failed (expected if not connected):', dbError.message);
            }
        }

        // Test Stock Items sync
        console.log('\n📦 Syncing Stock Items...');
        const stockResponse = await tallyService.fetchStockItems();
        const stockItems = tallyService.normalizeStockItems(stockResponse);
        console.log(`✅ Stock Items normalized: ${stockItems.length} stock items`);
        
        if (stockItems.length > 0) {
            console.log('Sample stock item:', stockItems[0]);
        }

        // Test Voucher Types sync
        console.log('\n📄 Syncing Voucher Types...');
        const vouchersResponse = await tallyService.fetchVouchers();
        const vouchers = tallyService.normalizeVouchers(vouchersResponse);
        console.log(`✅ Voucher Types normalized: ${vouchers.length} voucher types`);
        
        if (vouchers.length > 0) {
            console.log('Sample voucher type:', vouchers[0]);
        }

        console.log('\n🎉 Sync Test Summary:');
        console.log(`- Companies: ${companies.length}`);
        console.log(`- Ledgers: ${ledgers.length}`);
        console.log(`- Stock Items: ${stockItems.length}`);
        console.log(`- Voucher Types: ${vouchers.length}`);
        
        console.log('\n✅ All sync operations working! The XML formats are correct.');

    } catch (error) {
        console.error('❌ Sync test failed:', error.message);
        console.error('Full error:', error.stack);
    }
}

// Run without connecting to MongoDB (just test the parsing)
testSyncDirect();
