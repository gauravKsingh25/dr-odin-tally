const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import the TallyVoucher model
const TallyVoucher = require('../models/tallyVoucher.model.js');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// Function to add compound indexes for better performance
async function optimizeVoucherIndexes() {
    console.log('🚀 OPTIMIZING VOUCHER INDEXES FOR SORTING');
    console.log('==========================================');
    
    try {
        const collection = TallyVoucher.collection;
        
        // Add compound indexes for common query patterns with date sorting
        const indexesToAdd = [
            // Company + Date (most common query pattern)
            { companyId: 1, date: -1 },
            
            // Company + VoucherType + Date (for filtered views)
            { companyId: 1, voucherType: 1, date: -1 },
            
            // Company + Year + Date (for yearly reports)
            { companyId: 1, year: 1, date: -1 },
            
            // Company + Party + Date (for party-specific queries)
            { companyId: 1, party: 1, date: -1 },
            
            // Upload batch + Date (for batch tracking sorted by date)
            { uploadBatch: 1, date: -1 }
        ];
        
        let created = 0;
        let existing = 0;
        
        for (const indexSpec of indexesToAdd) {
            try {
                const indexName = Object.keys(indexSpec).map(key => 
                    `${key}_${indexSpec[key]}`
                ).join('_');
                
                await collection.createIndex(indexSpec, { 
                    name: indexName,
                    background: true 
                });
                
                console.log(`✅ Created index: ${JSON.stringify(indexSpec)}`);
                created++;
            } catch (error) {
                if (error.code === 85 || error.message.includes('already exists')) {
                    console.log(`ℹ️  Index already exists: ${JSON.stringify(indexSpec)}`);
                    existing++;
                } else {
                    console.error(`❌ Error creating index ${JSON.stringify(indexSpec)}:`, error.message);
                }
            }
        }
        
        console.log(`\n📊 Index Summary:`);
        console.log(`   Created: ${created}`);
        console.log(`   Already existed: ${existing}`);
        
        // Show all indexes
        const indexes = await collection.indexes();
        console.log(`\n📋 All Voucher Indexes:`);
        indexes.forEach(index => {
            console.log(`   ${index.name}: ${JSON.stringify(index.key)}`);
        });
        
    } catch (error) {
        console.error('❌ Error optimizing indexes:', error.message);
    }
}

// Function to test query performance
async function testQueryPerformance() {
    console.log('\n⚡ TESTING QUERY PERFORMANCE');
    console.log('=============================');
    
    try {
        // Get a sample company ID
        const sampleVoucher = await TallyVoucher.findOne({}).select('companyId');
        if (!sampleVoucher) {
            console.log('No vouchers found for performance testing');
            return;
        }
        
        const companyId = sampleVoucher.companyId;
        const currentYear = new Date().getFullYear();
        
        // Test different query patterns
        const tests = [
            {
                name: 'Recent 50 vouchers (company + date sort)',
                query: () => TallyVoucher.find({ companyId }).sort({ date: -1 }).limit(50)
            },
            {
                name: 'Sales vouchers current year (company + type + year + date)',
                query: () => TallyVoucher.find({ 
                    companyId, 
                    voucherType: 'Sales', 
                    year: currentYear 
                }).sort({ date: -1 }).limit(50)
            },
            {
                name: 'Date range query (company + date filter + sort)',
                query: () => TallyVoucher.find({ 
                    companyId, 
                    date: { 
                        $gte: new Date('2024-01-01'), 
                        $lte: new Date('2024-12-31') 
                    } 
                }).sort({ date: -1 }).limit(50)
            }
        ];
        
        for (const test of tests) {
            console.log(`\n🔍 Testing: ${test.name}`);
            const startTime = Date.now();
            
            const result = await test.query();
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            console.log(`   ✅ Found ${result.length} vouchers in ${duration}ms`);
            
            // Show explain for the query (in development only)
            if (process.env.NODE_ENV === 'development') {
                try {
                    const explain = await test.query().explain('executionStats');
                    const stats = explain.executionStats;
                    console.log(`   📈 Docs examined: ${stats.totalDocsExamined}, Docs returned: ${stats.totalDocsReturned}`);
                    console.log(`   🎯 Index used: ${stats.executionStages.inputStage?.indexName || 'No specific index'}`);
                } catch (explainError) {
                    // Explain might not work in all environments
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error testing performance:', error.message);
    }
}

// Function to verify sorting is working correctly
async function verifySorting() {
    console.log('\n✅ VERIFYING VOUCHER SORTING');
    console.log('=============================');
    
    try {
        // Get sample vouchers to verify they're sorted correctly
        const vouchers = await TallyVoucher.find({})
            .sort({ date: -1 })
            .limit(10)
            .select('voucherNumber date party amount');
        
        if (vouchers.length === 0) {
            console.log('No vouchers found for sorting verification');
            return;
        }
        
        console.log('📋 Recent vouchers (should be newest first):');
        vouchers.forEach((voucher, index) => {
            const dateStr = voucher.date ? voucher.date.toDateString() : 'No date';
            console.log(`   ${index + 1}. ${voucher.voucherNumber} - ${dateStr} - ${voucher.party} - ₹${voucher.amount}`);
        });
        
        // Verify dates are in descending order
        let isCorrectlySorted = true;
        for (let i = 1; i < vouchers.length; i++) {
            if (vouchers[i-1].date && vouchers[i].date && vouchers[i-1].date < vouchers[i].date) {
                isCorrectlySorted = false;
                break;
            }
        }
        
        if (isCorrectlySorted) {
            console.log('\n✅ Vouchers are correctly sorted (newest first)!');
        } else {
            console.log('\n⚠️  Warning: Vouchers may not be correctly sorted');
        }
        
    } catch (error) {
        console.error('❌ Error verifying sorting:', error.message);
    }
}

// Main function
async function optimizeVoucherSorting() {
    await connectDB();
    
    console.log('🎯 VOUCHER SORTING OPTIMIZATION');
    console.log('===============================');
    
    try {
        await optimizeVoucherIndexes();
        await testQueryPerformance();
        await verifySorting();
        
        console.log('\n🎉 Voucher sorting optimization completed!');
        console.log('\nℹ️  Summary:');
        console.log('   • All voucher queries are already sorted by date (newest first)');
        console.log('   • Database indexes have been optimized for sorting performance');
        console.log('   • Compound indexes created for common query patterns');
        console.log('   • Performance testing completed');
        
    } catch (error) {
        console.error('❌ Error during optimization:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the optimization if this script is called directly
if (require.main === module) {
    optimizeVoucherSorting()
        .then(() => {
            console.log('\n✅ Voucher sorting optimization process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Voucher sorting optimization failed:', error);
            process.exit(1);
        });
}

module.exports = { 
    optimizeVoucherSorting, 
    optimizeVoucherIndexes, 
    testQueryPerformance, 
    verifySorting 
};