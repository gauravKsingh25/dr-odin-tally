const mongoose = require('mongoose');
const TallyCompany = require('../models/tallyCompany.model');
const TallyLedger = require('../models/tallyLedger.model');
const TallyVoucher = require('../models/tallyVoucher.model');
const TallyStockItem = require('../models/tallyStockItem.model');

// Database connection
const dbConfig = require('../config/db.config');

async function cleanupTallyData() {
    try {
        // Check if already connected, if not connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('🔗 Connected to MongoDB');
        } else {
            console.log('🔗 Using existing MongoDB connection');
        }
        console.log('🧹 Starting Tally data cleanup...');

        // Count existing records
        const companiesCount = await TallyCompany.countDocuments();
        const ledgersCount = await TallyLedger.countDocuments();
        const vouchersCount = await TallyVoucher.countDocuments();
        const stockItemsCount = await TallyStockItem.countDocuments();

        console.log(`📊 Found existing data:`);
        console.log(`   - Companies: ${companiesCount}`);
        console.log(`   - Ledgers: ${ledgersCount}`);
        console.log(`   - Vouchers: ${vouchersCount}`);
        console.log(`   - Stock Items: ${stockItemsCount}`);

        if (companiesCount + ledgersCount + vouchersCount + stockItemsCount === 0) {
            console.log('✅ No Tally data found - nothing to clean up');
            process.exit(0);
        }

        // Delete all Tally data
        console.log('🗑️  Deleting all Tally data...');
        
        const companyResult = await TallyCompany.deleteMany({});
        const ledgerResult = await TallyLedger.deleteMany({});
        const voucherResult = await TallyVoucher.deleteMany({});
        const stockItemResult = await TallyStockItem.deleteMany({});

        console.log(`✅ Cleanup completed:`);
        console.log(`   - Companies deleted: ${companyResult.deletedCount}`);
        console.log(`   - Ledgers deleted: ${ledgerResult.deletedCount}`);
        console.log(`   - Vouchers deleted: ${voucherResult.deletedCount}`);
        console.log(`   - Stock Items deleted: ${stockItemResult.deletedCount}`);

        // Drop and recreate indexes to ensure they're clean
        console.log('🔧 Recreating indexes...');
        
        try {
            await TallyCompany.collection.dropIndexes();
            await TallyLedger.collection.dropIndexes();
            await TallyVoucher.collection.dropIndexes();
            await TallyStockItem.collection.dropIndexes();
            console.log('✅ Indexes dropped');
        } catch (error) {
            console.log('ℹ️  Some indexes may not have existed:', error.message);
        }

        // Recreate the schema indexes
        await TallyCompany.createIndexes();
        await TallyLedger.createIndexes();
        await TallyVoucher.createIndexes();
        await TallyStockItem.createIndexes();
        console.log('✅ Indexes recreated');

        console.log('🎉 Tally data cleanup completed successfully!');
        console.log('💡 You can now restart the server for fresh Tally sync');

    } catch (error) {
        console.error('❌ Cleanup failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the cleanup
cleanupTallyData();
