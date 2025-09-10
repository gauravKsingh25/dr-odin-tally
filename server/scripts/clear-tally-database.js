const mongoose = require('mongoose');
const TallyCompany = require('../models/tallyCompany.model');
const TallyLedger = require('../models/tallyLedger.model');
const TallyVoucher = require('../models/tallyVoucher.model');
const TallyStockItem = require('../models/tallyStockItem.model');
const TallyGroup = require('../models/tallyGroup.model');
const TallyCostCenter = require('../models/tallyCostCenter.model');
const TallyCurrency = require('../models/tallyCurrency.model');
require('dotenv').config();

// Use the same MongoDB URI as the main application
const mongoUri = process.env.MONGO_URI || 'mongodb+srv://gs8683921:123qwe@cluster0.m94ov.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function clearTallyDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        console.log('MongoDB URI:', mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in log
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB successfully');

        console.log('Starting database cleanup for enhanced Tally data structure...');

        // Get counts before cleanup
        const beforeCounts = {
            companies: await TallyCompany.countDocuments(),
            ledgers: await TallyLedger.countDocuments(),
            vouchers: await TallyVoucher.countDocuments(),
            stockItems: await TallyStockItem.countDocuments(),
            groups: await TallyGroup.countDocuments(),
            costCenters: await TallyCostCenter.countDocuments(),
            currencies: await TallyCurrency.countDocuments()
        };

        console.log('Before cleanup counts:', beforeCounts);

        // Clear all Tally collections
        const cleanupResults = await Promise.all([
            TallyCompany.deleteMany({}),
            TallyLedger.deleteMany({}),
            TallyVoucher.deleteMany({}),
            TallyStockItem.deleteMany({}),
            TallyGroup.deleteMany({}),
            TallyCostCenter.deleteMany({}),
            TallyCurrency.deleteMany({})
        ]);

        console.log('Database cleanup completed successfully!');
        console.log('Deleted documents:');
        console.log(`- Companies: ${cleanupResults[0].deletedCount}`);
        console.log(`- Ledgers: ${cleanupResults[1].deletedCount}`);
        console.log(`- Vouchers: ${cleanupResults[2].deletedCount}`);
        console.log(`- Stock Items: ${cleanupResults[3].deletedCount}`);
        console.log(`- Groups: ${cleanupResults[4].deletedCount}`);
        console.log(`- Cost Centers: ${cleanupResults[5].deletedCount}`);
        console.log(`- Currencies: ${cleanupResults[6].deletedCount}`);

        // Verify cleanup
        const afterCounts = {
            companies: await TallyCompany.countDocuments(),
            ledgers: await TallyLedger.countDocuments(),
            vouchers: await TallyVoucher.countDocuments(),
            stockItems: await TallyStockItem.countDocuments(),
            groups: await TallyGroup.countDocuments(),
            costCenters: await TallyCostCenter.countDocuments(),
            currencies: await TallyCurrency.countDocuments()
        };

        console.log('After cleanup counts:', afterCounts);

        // Create indexes for better performance
        console.log('Creating database indexes...');
        
        try {
            await Promise.all([
                TallyCompany.createIndexes(),
                TallyLedger.createIndexes(),
                TallyVoucher.createIndexes(),
                TallyStockItem.createIndexes(),
                TallyGroup.createIndexes(),
                TallyCostCenter.createIndexes(),
                TallyCurrency.createIndexes()
            ]);
            console.log('Database indexes created successfully');
        } catch (indexError) {
            // Ignore index conflicts as they might already exist
            if (indexError.code === 86 || indexError.codeName === 'IndexKeySpecsConflict') {
                console.log('Some indexes already exist, skipping index creation');
            } else {
                console.warn('Index creation warning:', indexError.message);
            }
        }

        console.log('✅ Database is now ready for comprehensive Tally data extraction');

    } catch (error) {
        console.error('Database cleanup error:', error);
        throw error;
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

// Execute if run directly
if (require.main === module) {
    clearTallyDatabase()
        .then(() => {
            console.log('✅ Database cleanup completed successfully');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ Database cleanup failed:', error);
            process.exit(1);
        });
}

module.exports = clearTallyDatabase;
