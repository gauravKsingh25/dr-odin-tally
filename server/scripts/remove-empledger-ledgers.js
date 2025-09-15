const mongoose = require('mongoose');
const TallyLedger = require('../models/tallyLedger.model');
require('dotenv').config();

async function removeEmpLedgerLedgers() {
    try {
        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('🔗 Connected to MongoDB');
        } else {
            console.log('🔗 Using existing MongoDB connection');
        }

        console.log('🧹 Starting EMPLEDGER ledger cleanup...\n');

        // First, let's find all ledgers that start with "EMPLEDGER"
        const empLedgerLedgers = await TallyLedger.find({
            name: { $regex: /^EMPLEDGER/i }
        }).sort({ name: 1 });

        console.log(`📊 Found ${empLedgerLedgers.length} ledgers starting with "EMPLEDGER"`);

        if (empLedgerLedgers.length === 0) {
            console.log('✅ No EMPLEDGER ledgers found - nothing to clean up');
            process.exit(0);
        }

        // Display the ledgers that will be deleted
        console.log('\n📋 Ledgers to be deleted:');
        empLedgerLedgers.forEach((ledger, index) => {
            const balance = ledger.closingBalance || ledger.openingBalance || 0;
            const balanceStr = balance !== 0 ? `₹${balance.toLocaleString('en-IN')}` : '₹0';
            console.log(`   ${index + 1}. ${ledger.name}`);
            console.log(`      - Parent: ${ledger.parent || 'N/A'}`);
            console.log(`      - Balance: ${balanceStr}`);
            console.log(`      - GUID: ${ledger.guid || 'N/A'}`);
            console.log(`      - Is Group: ${ledger.isGroup ? 'Yes' : 'No'}`);
            console.log('');
        });

        // Calculate total balances
        const totalOpeningBalance = empLedgerLedgers.reduce((sum, ledger) => sum + (ledger.openingBalance || 0), 0);
        const totalClosingBalance = empLedgerLedgers.reduce((sum, ledger) => sum + (ledger.closingBalance || 0), 0);
        const groupCount = empLedgerLedgers.filter(ledger => ledger.isGroup).length;
        const ledgerCount = empLedgerLedgers.filter(ledger => !ledger.isGroup).length;

        console.log(`💰 Total Balances:`);
        console.log(`   - Opening Balance: ₹${totalOpeningBalance.toLocaleString('en-IN')}`);
        console.log(`   - Closing Balance: ₹${totalClosingBalance.toLocaleString('en-IN')}`);
        console.log(`   - Groups: ${groupCount}`);
        console.log(`   - Ledgers: ${ledgerCount}`);

        // Delete all ledgers that start with "EMPLEDGER"
        console.log('\n🗑️  Deleting EMPLEDGER ledgers...');
        
        const deleteResult = await TallyLedger.deleteMany({
            name: { $regex: /^EMPLEDGER/i }
        });

        console.log(`\n✅ Cleanup completed:`);
        console.log(`   - EMPLEDGER ledgers deleted: ${deleteResult.deletedCount}`);

        // Verify the deletion
        const remainingCount = await TallyLedger.countDocuments({
            name: { $regex: /^EMPLEDGER/i }
        });

        if (remainingCount === 0) {
            console.log('✅ All EMPLEDGER ledgers have been successfully removed');
        } else {
            console.log(`⚠️  Warning: ${remainingCount} EMPLEDGER ledgers still remain`);
        }

        // Show total ledger count after cleanup
        const totalLedgers = await TallyLedger.countDocuments();
        const totalGroups = await TallyLedger.countDocuments({ isGroup: true });
        const totalNonGroups = await TallyLedger.countDocuments({ isGroup: false });

        console.log(`\n📊 Database summary after cleanup:`);
        console.log(`   - Total ledgers remaining: ${totalLedgers}`);
        console.log(`   - Groups: ${totalGroups}`);
        console.log(`   - Non-groups: ${totalNonGroups}`);

        // Show summary by parent groups
        const parentSummary = await TallyLedger.aggregate([
            { $group: { _id: '$parent', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        console.log('\n📈 Top 10 parent groups by ledger count:');
        parentSummary.forEach(item => {
            const parentName = item._id || 'No Parent';
            console.log(`   - ${parentName}: ${item.count} ledgers`);
        });

        console.log('\n🎉 EMPLEDGER ledger cleanup completed successfully!');

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
removeEmpLedgerLedgers();

