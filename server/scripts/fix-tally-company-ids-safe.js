const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import Tally models
const TallyLedger = require('../models/tallyLedger.model');
const TallyVoucher = require('../models/tallyVoucher.model');
const TallyStockItem = require('../models/tallyStockItem.model');
const TallyCompany = require('../models/tallyCompany.model');
const TallyGroup = require('../models/tallyGroup.model');
const TallyCostCenter = require('../models/tallyCostCenter.model');
const TallyCurrency = require('../models/tallyCurrency.model');

// Target company ID (from your user session)
const TARGET_COMPANY_ID = '68b9755e578bec07fd1ca54d';

// Hardcoded MongoDB URI as fallback
const FALLBACK_MONGO_URI = 'mongodb+srv://gs8683921:123qwe@cluster0.m94ov.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function fixTallyCompanyIdsSafe() {
    try {
        // Connect to MongoDB
        const mongoUri = process.env.MONGO_URI || FALLBACK_MONGO_URI;
        console.log('🔗 Connecting to MongoDB...');
        
        if (mongoose.connection.readyState === 0) {
            mongoose.set('strictQuery', false);
            await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('✅ Connected to MongoDB successfully\n');
        }

        const targetObjectId = new mongoose.Types.ObjectId(TARGET_COMPANY_ID);
        
        console.log('🔧 SAFELY FIXING TALLY DATA COMPANY IDs');
        console.log('=======================================\n');
        console.log(`🎯 Target Company ID: ${TARGET_COMPANY_ID}\n`);

        // ===========================================
        // HANDLE TALLY COMPANIES CAREFULLY
        // ===========================================
        console.log('🏢 Handling Tally Companies...');
        
        // First, delete duplicate companies that would cause constraint violations
        const existingCompanies = await TallyCompany.find({ companyId: targetObjectId });
        const existingCompanyNames = existingCompanies.map(c => c.name);
        
        if (existingCompanyNames.length > 0) {
            console.log(`   Found ${existingCompanyNames.length} companies already with target ID`);
            
            // Delete companies with different IDs but same names to avoid duplicates
            const duplicateDeleteResult = await TallyCompany.deleteMany({
                companyId: { $ne: targetObjectId },
                name: { $in: existingCompanyNames }
            });
            console.log(`   Deleted ${duplicateDeleteResult.deletedCount} duplicate company records`);
        }
        
        // Now safely update remaining companies
        const companiesUpdateResult = await TallyCompany.updateMany(
            { companyId: { $exists: true, $ne: targetObjectId } },
            { $set: { companyId: targetObjectId } }
        );
        console.log(`   ✅ Updated ${companiesUpdateResult.modifiedCount} companies\n`);

        // ===========================================
        // UPDATE OTHER COLLECTIONS (NO CONSTRAINTS)
        // ===========================================
        console.log('📊 Updating Tally Ledgers...');
        const ledgersUpdateResult = await TallyLedger.updateMany(
            { companyId: { $exists: true, $ne: targetObjectId } },
            { $set: { companyId: targetObjectId } }
        );
        console.log(`   ✅ Updated ${ledgersUpdateResult.modifiedCount} ledgers\n`);

        console.log('📄 Updating Tally Vouchers...');
        const vouchersUpdateResult = await TallyVoucher.updateMany(
            { companyId: { $exists: true, $ne: targetObjectId } },
            { $set: { companyId: targetObjectId } }
        );
        console.log(`   ✅ Updated ${vouchersUpdateResult.modifiedCount} vouchers\n`);

        console.log('📦 Updating Tally Stock Items...');
        const stockItemsUpdateResult = await TallyStockItem.updateMany(
            { companyId: { $exists: true, $ne: targetObjectId } },
            { $set: { companyId: targetObjectId } }
        );
        console.log(`   ✅ Updated ${stockItemsUpdateResult.modifiedCount} stock items\n`);

        console.log('🗂️ Updating Tally Groups...');
        const groupsUpdateResult = await TallyGroup.updateMany(
            { companyId: { $exists: true, $ne: targetObjectId } },
            { $set: { companyId: targetObjectId } }
        );
        console.log(`   ✅ Updated ${groupsUpdateResult.modifiedCount} groups\n`);

        console.log('💼 Updating Tally Cost Centers...');
        const costCentersUpdateResult = await TallyCostCenter.updateMany(
            { companyId: { $exists: true, $ne: targetObjectId } },
            { $set: { companyId: targetObjectId } }
        );
        console.log(`   ✅ Updated ${costCentersUpdateResult.modifiedCount} cost centers\n`);

        console.log('💱 Updating Tally Currencies...');
        const currenciesUpdateResult = await TallyCurrency.updateMany(
            { companyId: { $exists: true, $ne: targetObjectId } },
            { $set: { companyId: targetObjectId } }
        );
        console.log(`   ✅ Updated ${currenciesUpdateResult.modifiedCount} currencies\n`);

        // ===========================================
        // VERIFICATION
        // ===========================================
        console.log('🔍 Verifying Updates...');
        
        const verificationResults = await Promise.all([
            TallyCompany.countDocuments({ companyId: targetObjectId }),
            TallyLedger.countDocuments({ companyId: targetObjectId }),
            TallyVoucher.countDocuments({ companyId: targetObjectId }),
            TallyStockItem.countDocuments({ companyId: targetObjectId }),
            TallyGroup.countDocuments({ companyId: targetObjectId }),
            TallyCostCenter.countDocuments({ companyId: targetObjectId }),
            TallyCurrency.countDocuments({ companyId: targetObjectId })
        ]);

        console.log('   📊 Records now with correct company ID:');
        console.log(`      - Companies: ${verificationResults[0]}`);
        console.log(`      - Ledgers: ${verificationResults[1]}`);
        console.log(`      - Vouchers: ${verificationResults[2]}`);
        console.log(`      - Stock Items: ${verificationResults[3]}`);
        console.log(`      - Groups: ${verificationResults[4]}`);
        console.log(`      - Cost Centers: ${verificationResults[5]}`);
        console.log(`      - Currencies: ${verificationResults[6]}`);
        console.log();

        // ===========================================
        // TEST DASHBOARD AGGREGATIONS
        // ===========================================
        console.log('🧮 Testing Dashboard Aggregations After Fix:');
        
        // Test voucher summary aggregation
        const voucherSummary = await TallyVoucher.aggregate([
            { $match: { companyId: targetObjectId } },
            {
                $group: {
                    _id: '$voucherType',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        console.log(`   - Voucher Summary: ${voucherSummary.length} types`);
        voucherSummary.forEach((v, i) => {
            console.log(`     ${i+1}. ${v._id}: ${v.count} vouchers, ₹${(v.totalAmount || 0).toLocaleString()}`);
        });

        // Test stock summary aggregation  
        const stockSummary = await TallyStockItem.aggregate([
            { $match: { companyId: targetObjectId } },
            {
                $group: {
                    _id: '$stockGroup',
                    itemCount: { $sum: 1 },
                    totalValue: { $sum: '$closingValue' },
                    totalQty: { $sum: '$closingQty' }
                }
            },
            { $sort: { totalValue: -1 } },
            { $limit: 5 }
        ]);
        console.log(`   - Stock Summary: ${stockSummary.length} groups`);
        stockSummary.forEach((s, i) => {
            console.log(`     ${i+1}. ${s._id || 'Uncategorized'}: ${s.itemCount} items, ₹${(s.totalValue || 0).toLocaleString()}`);
        });

        // Test group summary aggregation
        const groupSummary = await TallyGroup.aggregate([
            { $match: { companyId: targetObjectId } },
            {
                $group: {
                    _id: '$nature',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        console.log(`   - Group Summary: ${groupSummary.length} natures`);
        groupSummary.forEach((g, i) => {
            console.log(`     ${i+1}. ${g._id || 'No Nature'}: ${g.count} groups`);
        });

        // Test financial summary aggregation
        const financialSummary = await TallyLedger.aggregate([
            { $match: { companyId: targetObjectId } },
            {
                $group: {
                    _id: null,
                    openingNetTotal: { $sum: '$openingBalance' },
                    openingAbsoluteTotal: { $sum: { $abs: '$openingBalance' } },
                    closingNetTotal: { $sum: '$closingBalance' },
                    closingAbsoluteTotal: { $sum: { $abs: '$closingBalance' } },
                    totalLedgers: { $sum: 1 }
                }
            }
        ]);
        
        const fsResult = financialSummary[0] || {};
        console.log(`   - Financial Summary:`);
        console.log(`     Opening Balance: ₹${(fsResult.openingNetTotal || 0).toLocaleString()}`);
        console.log(`     Closing Balance: ₹${(fsResult.closingNetTotal || 0).toLocaleString()}`);
        console.log(`     Net Change: ₹${((fsResult.closingNetTotal || 0) - (fsResult.openingNetTotal || 0)).toLocaleString()}`);
        console.log(`     Total Ledgers: ${fsResult.totalLedgers || 0}`);

        // ===========================================
        // SUMMARY
        // ===========================================
        console.log('\n' + '='.repeat(60));
        console.log('📊 TALLY DATA FIX SUMMARY');
        console.log('='.repeat(60));
        console.log(`🎯 Target Company ID: ${TARGET_COMPANY_ID}`);
        console.log(`🏢 Companies updated: ${companiesUpdateResult.modifiedCount}`);
        console.log(`📊 Ledgers updated: ${ledgersUpdateResult.modifiedCount}`);
        console.log(`📄 Vouchers updated: ${vouchersUpdateResult.modifiedCount}`);
        console.log(`📦 Stock items updated: ${stockItemsUpdateResult.modifiedCount}`);
        console.log(`🗂️ Groups updated: ${groupsUpdateResult.modifiedCount}`);
        console.log(`💼 Cost centers updated: ${costCentersUpdateResult.modifiedCount}`);
        console.log(`💱 Currencies updated: ${currenciesUpdateResult.modifiedCount}`);
        
        const totalUpdated = companiesUpdateResult.modifiedCount + 
                           ledgersUpdateResult.modifiedCount + 
                           vouchersUpdateResult.modifiedCount + 
                           stockItemsUpdateResult.modifiedCount + 
                           groupsUpdateResult.modifiedCount + 
                           costCentersUpdateResult.modifiedCount + 
                           currenciesUpdateResult.modifiedCount;
                           
        console.log(`📈 Total records updated: ${totalUpdated}`);
        console.log('\n✅ Tally data company IDs fixed successfully!');
        console.log('\n💡 WHAT TO DO NEXT:');
        console.log('   1. Go to your Tally Dashboard in the browser');
        console.log('   2. Click the "Refresh" button to reload the data');
        console.log('   3. You should now see all your Tally data displayed!');
        console.log('   4. If you need transaction vouchers, click "Fetch Vouchers"');
        console.log('\n🎉 Your dashboard should now be working properly!');

    } catch (error) {
        console.error('❌ Fix failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('🔌 Database connection closed');
        }
        process.exit(0);
    }
}

// Run the fix
console.log('🚀 Starting SAFE Tally Data Company ID Fix');
console.log('==========================================\n');
console.log('⚠️  This will safely update company IDs in all Tally collections');
console.log('   to match your user company ID, handling duplicates properly.\n');

fixTallyCompanyIdsSafe();