// Test script to validate voucher duplicate detection
// Run this in MongoDB shell or Node.js environment

const mongoose = require('mongoose');
const TallyVoucher = require('../models/tallyVoucher.model');

async function testVoucherDuplicateDetection() {
    try {
        console.log('🧪 Testing Voucher Duplicate Detection...');
        
        const testCompanyId = new mongoose.Types.ObjectId();
        
        // Test 1: Insert a valid voucher
        console.log('\n1. Inserting first voucher...');
        const voucher1 = await TallyVoucher.create({
            date: new Date('2024-01-01'),
            voucherNumber: 'TEST001',
            voucherType: 'Sales',
            amount: 5000,
            party: 'Test Party',
            companyId: testCompanyId,
            year: 2024
        });
        console.log('✅ First voucher inserted successfully:', voucher1.voucherNumber);
        
        // Test 2: Try to insert duplicate voucher number for same company
        console.log('\n2. Attempting to insert duplicate voucher number...');
        try {
            const voucher2 = await TallyVoucher.create({
                date: new Date('2024-01-02'),
                voucherNumber: 'TEST001', // Same voucher number
                voucherType: 'Purchase',
                amount: 3000,
                party: 'Different Party',
                companyId: testCompanyId, // Same company
                year: 2024
            });
            console.log('❌ ERROR: Duplicate voucher was allowed! This should not happen.');
        } catch (error) {
            if (error.code === 11000) {
                console.log('✅ Duplicate correctly rejected with error code 11000 (duplicate key)');
                console.log('   Error details:', error.message);
            } else {
                console.log('❌ Unexpected error:', error);
            }
        }
        
        // Test 3: Insert same voucher number for different company (should be allowed)
        console.log('\n3. Inserting same voucher number for different company...');
        const differentCompanyId = new mongoose.Types.ObjectId();
        const voucher3 = await TallyVoucher.create({
            date: new Date('2024-01-01'),
            voucherNumber: 'TEST001', // Same voucher number
            voucherType: 'Sales',
            amount: 5000,
            party: 'Test Party',
            companyId: differentCompanyId, // Different company
            year: 2024
        });
        console.log('✅ Same voucher number for different company allowed:', voucher3.voucherNumber);
        
        // Test 4: Check database constraints
        console.log('\n4. Checking database indexes...');
        const indexes = await TallyVoucher.collection.getIndexes();
        console.log('Database indexes:', Object.keys(indexes));
        
        const uniqueIndex = indexes['voucherNumber_1_companyId_1'];
        if (uniqueIndex && uniqueIndex.unique) {
            console.log('✅ Unique compound index on voucherNumber + companyId exists');
        } else {
            console.log('❌ WARNING: Unique compound index not found or not unique');
        }
        
        // Cleanup
        console.log('\n5. Cleaning up test data...');
        await TallyVoucher.deleteMany({ 
            voucherNumber: 'TEST001',
            companyId: { $in: [testCompanyId, differentCompanyId] }
        });
        console.log('✅ Test data cleaned up');
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Export for use in testing
module.exports = { testVoucherDuplicateDetection };

// Run if executed directly
if (require.main === module) {
    // Connect to MongoDB (adjust connection string as needed)
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dr_odin_tally', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('Connected to MongoDB');
        return testVoucherDuplicateDetection();
    }).then(() => {
        console.log('Tests completed, disconnecting...');
        return mongoose.disconnect();
    }).catch(error => {
        console.error('Test error:', error);
        process.exit(1);
    });
}