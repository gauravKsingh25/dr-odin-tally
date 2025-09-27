const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import the TallyLedger model
const TallyLedger = require('../models/tallyLedger.model.js');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dr-odin-tally', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// Function to diagnose ledger data issues
async function diagnoseLedgerIssues() {
    await connectDB();
    
    console.log('🔍 DIAGNOSING LEDGER DATA ISSUES');
    console.log('================================');
    
    try {
        // Check total ledgers count
        const totalLedgers = await TallyLedger.countDocuments();
        console.log(`📊 Total ledgers in database: ${totalLedgers}`);
        
        if (totalLedgers === 0) {
            console.log('❌ NO LEDGERS FOUND IN DATABASE!');
            console.log('   This explains why the frontend shows no data');
            console.log('   You need to sync ledger data from Tally first');
            return;
        }
        
        // Check company ID distribution
        const companyIdStats = await TallyLedger.aggregate([
            {
                $group: {
                    _id: '$companyId',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);
        
        console.log(`\n🏢 Company ID distribution:`);
        companyIdStats.forEach(stat => {
            console.log(`   Company ID: ${stat._id} | Count: ${stat.count}`);
        });
        
        // Check year distribution
        const yearStats = await TallyLedger.aggregate([
            {
                $group: {
                    _id: '$year',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);
        
        console.log(`\n📅 Year distribution:`);
        yearStats.forEach(stat => {
            console.log(`   Year: ${stat._id} | Count: ${stat.count}`);
        });
        
        // Check parent/group distribution
        const parentStats = await TallyLedger.aggregate([
            {
                $group: {
                    _id: '$parent',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        console.log(`\n📋 Top 10 Parent groups:`);
        parentStats.forEach(stat => {
            console.log(`   Parent: "${stat._id}" | Count: ${stat.count}`);
        });
        
        // Check for "Sundry Debtors" specifically
        const sundryDebtorsCount = await TallyLedger.countDocuments({
            parent: { $regex: 'Sundry Debtors', $options: 'i' }
        });
        console.log(`\n🎯 Sundry Debtors count: ${sundryDebtorsCount}`);
        
        // Sample ledgers
        const sampleLedgers = await TallyLedger.find({})
            .limit(5)
            .select('name parent companyId year openingBalance closingBalance lastUpdated');
        
        console.log(`\n📋 Sample ledgers:`);
        sampleLedgers.forEach((ledger, index) => {
            console.log(`   ${index + 1}. Name: "${ledger.name}"`);
            console.log(`      Parent: "${ledger.parent}"`);
            console.log(`      Company ID: ${ledger.companyId}`);
            console.log(`      Year: ${ledger.year}`);
            console.log(`      Opening: ${ledger.openingBalance} | Closing: ${ledger.closingBalance}`);
            console.log(`      Last Updated: ${ledger.lastUpdated}`);
            console.log('');
        });
        
        // Test the current filter that's failing
        console.log(`\n🧪 Testing current frontend filter:`);
        const correctCompanyId = "68b9755e578bec07fd1ca54d"; // The company ID we set earlier
        const currentYear = new Date().getFullYear();
        
        const currentFilterQuery = {
            companyId: mongoose.Types.ObjectId(correctCompanyId),
            year: currentYear,
            parent: { $regex: 'Sundry Debtors', $options: 'i' }
        };
        
        const currentFilterCount = await TallyLedger.countDocuments(currentFilterQuery);
        console.log(`   Query: companyId=${correctCompanyId}, year=${currentYear}, parent=Sundry Debtors`);
        console.log(`   Result count: ${currentFilterCount}`);
        
        // Try without year filter
        const withoutYearQuery = {
            companyId: mongoose.Types.ObjectId(correctCompanyId),
            parent: { $regex: 'Sundry Debtors', $options: 'i' }
        };
        
        const withoutYearCount = await TallyLedger.countDocuments(withoutYearQuery);
        console.log(`   Without year filter count: ${withoutYearCount}`);
        
        // Try without company ID filter
        const withoutCompanyQuery = {
            year: currentYear,
            parent: { $regex: 'Sundry Debtors', $options: 'i' }
        };
        
        const withoutCompanyCount = await TallyLedger.countDocuments(withoutCompanyQuery);
        console.log(`   Without company filter count: ${withoutCompanyCount}`);
        
        // Try with just parent filter
        const justParentCount = await TallyLedger.countDocuments({
            parent: { $regex: 'Sundry Debtors', $options: 'i' }
        });
        console.log(`   Just parent filter count: ${justParentCount}`);
        
        // Try without any filters
        const noFilterCount = await TallyLedger.countDocuments({
            companyId: mongoose.Types.ObjectId(correctCompanyId)
        });
        console.log(`   Just company ID filter count: ${noFilterCount}`);
        
        console.log(`\n💡 DIAGNOSIS SUMMARY:`);
        if (totalLedgers === 0) {
            console.log(`   🔴 Problem: No ledgers in database - need to sync from Tally`);
        } else if (currentFilterCount === 0) {
            console.log(`   🔴 Problem: Filters in getTallyLedgers are too restrictive`);
            if (noFilterCount > 0) {
                console.log(`   ✅ Solution: Remove or adjust year/parent filters`);
            } else {
                console.log(`   🔴 Problem: Company ID filter not matching - check if ledgers have correct company ID`);
            }
        } else {
            console.log(`   ✅ Filters working correctly - check frontend API call`);
        }
        
    } catch (error) {
        console.error('❌ Error during diagnosis:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the diagnosis
if (require.main === module) {
    diagnoseLedgerIssues()
        .then(() => {
            console.log('\n✅ Diagnosis completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Diagnosis failed:', error);
            process.exit(1);
        });
}

module.exports = { diagnoseLedgerIssues };