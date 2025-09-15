const mongoose = require('mongoose');
const TallyLedger = require('../models/tallyLedger.model');
require('dotenv').config();

async function checkEmpLedgerLedgers() {
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

        console.log('📊 Checking EMPLEDGER ledgers...\n');

        // Find all ledgers that start with "EMPLEDGER"
        const empLedgerLedgers = await TallyLedger.find({
            name: { $regex: /^EMPLEDGER/i }
        }).sort({ name: 1 });

        console.log(`📈 Found ${empLedgerLedgers.length} ledgers starting with "EMPLEDGER"`);

        if (empLedgerLedgers.length === 0) {
            console.log('✅ No EMPLEDGER ledgers found in the database');
            return;
        }

        // Display all EMPLEDGER ledgers
        console.log('\n📋 EMPLEDGER ledgers found:');
        empLedgerLedgers.forEach((ledger, index) => {
            const balance = ledger.closingBalance || ledger.openingBalance || 0;
            const balanceStr = balance !== 0 ? `₹${balance.toLocaleString('en-IN')}` : '₹0';
            console.log(`\n   ${index + 1}. ${ledger.name}`);
            console.log(`      - Parent: ${ledger.parent || 'N/A'}`);
            console.log(`      - Opening Balance: ₹${(ledger.openingBalance || 0).toLocaleString('en-IN')}`);
            console.log(`      - Closing Balance: ₹${(ledger.closingBalance || 0).toLocaleString('en-IN')}`);
            console.log(`      - GUID: ${ledger.guid || 'N/A'}`);
            console.log(`      - Master ID: ${ledger.masterId || 'N/A'}`);
            console.log(`      - Is Group: ${ledger.isGroup ? 'Yes' : 'No'}`);
            console.log(`      - Last Updated: ${ledger.lastUpdated ? new Date(ledger.lastUpdated).toLocaleString('en-IN') : 'N/A'}`);
            
            if (ledger.email) {
                console.log(`      - Email: ${ledger.email}`);
            }
            if (ledger.ledgerPhone) {
                console.log(`      - Phone: ${ledger.ledgerPhone}`);
            }
            if (ledger.gstin) {
                console.log(`      - GSTIN: ${ledger.gstin}`);
            }
        });

        // Calculate summary statistics
        const totalOpeningBalance = empLedgerLedgers.reduce((sum, ledger) => sum + (ledger.openingBalance || 0), 0);
        const totalClosingBalance = empLedgerLedgers.reduce((sum, ledger) => sum + (ledger.closingBalance || 0), 0);
        const groupCount = empLedgerLedgers.filter(ledger => ledger.isGroup).length;
        const ledgerCount = empLedgerLedgers.filter(ledger => !ledger.isGroup).length;

        console.log('\n📊 Summary Statistics:');
        console.log(`   - Total EMPLEDGER ledgers: ${empLedgerLedgers.length}`);
        console.log(`   - Groups: ${groupCount}`);
        console.log(`   - Non-groups: ${ledgerCount}`);
        console.log(`   - Total Opening Balance: ₹${totalOpeningBalance.toLocaleString('en-IN')}`);
        console.log(`   - Total Closing Balance: ₹${totalClosingBalance.toLocaleString('en-IN')}`);

        // Group by parent
        const parentGroups = {};
        empLedgerLedgers.forEach(ledger => {
            const parent = ledger.parent || 'No Parent';
            if (!parentGroups[parent]) {
                parentGroups[parent] = [];
            }
            parentGroups[parent].push(ledger);
        });

        console.log('\n📈 Grouped by Parent:');
        Object.keys(parentGroups).forEach(parent => {
            const ledgers = parentGroups[parent];
            console.log(`   - ${parent}: ${ledgers.length} ledgers`);
        });

        // Show unique patterns in names
        const namePatterns = {};
        empLedgerLedgers.forEach(ledger => {
            const name = ledger.name;
            // Extract pattern after EMPLEDGER-
            const match = name.match(/^EMPLEDGER-(.+)/i);
            if (match) {
                const pattern = match[1];
                if (!namePatterns[pattern]) {
                    namePatterns[pattern] = 0;
                }
                namePatterns[pattern]++;
            }
        });

        console.log('\n🔍 Name patterns found:');
        Object.keys(namePatterns).forEach(pattern => {
            console.log(`   - ${pattern}: ${namePatterns[pattern]} ledgers`);
        });

        // Show total ledger count
        const totalLedgers = await TallyLedger.countDocuments();
        console.log(`\n📊 Total ledgers in database: ${totalLedgers}`);

        console.log('\n✅ EMPLEDGER ledger check completed!');

    } catch (error) {
        console.error('❌ Check failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the check
checkEmpLedgerLedgers();

