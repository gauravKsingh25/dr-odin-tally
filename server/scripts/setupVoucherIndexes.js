// Database migration script to ensure proper indexes for voucher duplicate detection
// Run this to set up the required indexes

const mongoose = require('mongoose');
const TallyVoucher = require('../models/tallyVoucher.model');

async function createVoucherIndexes() {
    try {
        console.log('🔧 Setting up voucher database indexes...');
        
        // Drop existing indexes to recreate them properly
        console.log('📋 Checking existing indexes...');
        const existingIndexes = await TallyVoucher.collection.getIndexes();
        console.log('Existing indexes:', Object.keys(existingIndexes));
        
        // Create the unique compound index if it doesn't exist properly
        console.log('\n🔨 Creating unique compound index on voucherNumber + companyId...');
        try {
            await TallyVoucher.collection.createIndex(
                { voucherNumber: 1, companyId: 1 },
                { 
                    unique: true,
                    name: 'voucher_company_unique',
                    background: true
                }
            );
            console.log('✅ Unique compound index created successfully');
        } catch (error) {
            if (error.code === 85) {
                console.log('ℹ️  Index already exists with same specification');
            } else {
                console.log('⚠️  Error creating index:', error.message);
                // Try to drop and recreate if there's a conflict
                try {
                    await TallyVoucher.collection.dropIndex('voucherNumber_1_companyId_1');
                    console.log('🗑️  Dropped existing non-unique index');
                    
                    await TallyVoucher.collection.createIndex(
                        { voucherNumber: 1, companyId: 1 },
                        { 
                            unique: true,
                            name: 'voucher_company_unique',
                            background: true
                        }
                    );
                    console.log('✅ Unique compound index recreated successfully');
                } catch (recreateError) {
                    console.log('❌ Failed to recreate index:', recreateError.message);
                }
            }
        }
        
        // Create other performance indexes
        console.log('\n📈 Creating performance indexes...');
        const performanceIndexes = [
            { date: -1 },
            { voucherType: 1 },
            { party: 1 },
            { lastUpdated: -1 },
            { uploadBatch: 1 },
            { amount: -1 }
        ];
        
        for (const indexSpec of performanceIndexes) {
            try {
                await TallyVoucher.collection.createIndex(indexSpec, { background: true });
                console.log(`✅ Created index:`, indexSpec);
            } catch (error) {
                if (error.code === 85) {
                    console.log(`ℹ️  Index already exists:`, indexSpec);
                } else {
                    console.log(`⚠️  Error creating index ${JSON.stringify(indexSpec)}:`, error.message);
                }
            }
        }
        
        // Verify final indexes
        console.log('\n🔍 Verifying final indexes...');
        const finalIndexes = await TallyVoucher.collection.getIndexes();
        
        let uniqueIndexFound = false;
        Object.entries(finalIndexes).forEach(([name, spec]) => {
            console.log(`  - ${name}: ${JSON.stringify(spec.key)} ${spec.unique ? '(UNIQUE)' : ''}`);
            if (name.includes('voucher') && name.includes('company') && spec.unique) {
                uniqueIndexFound = true;
            }
        });
        
        if (uniqueIndexFound) {
            console.log('✅ Unique constraint on voucherNumber + companyId is active');
        } else {
            console.log('❌ WARNING: Unique constraint not found! Duplicates may not be prevented at database level');
        }
        
        // Check for any duplicate data that might exist
        console.log('\n🔍 Checking for existing duplicate vouchers...');
        const duplicates = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: {
                        voucherNumber: '$voucherNumber',
                        companyId: '$companyId'
                    },
                    count: { $sum: 1 },
                    docs: { $push: '$_id' }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            },
            {
                $limit: 5 // Show first 5 duplicates
            }
        ]);
        
        if (duplicates.length > 0) {
            console.log(`⚠️  Found ${duplicates.length} sets of duplicate vouchers:`);
            duplicates.forEach((dup, idx) => {
                console.log(`  ${idx + 1}. Voucher: ${dup._id.voucherNumber}, Company: ${dup._id.companyId}, Count: ${dup.count}`);
            });
            console.log('ℹ️  These duplicates should be cleaned up before the unique index can be fully enforced');
        } else {
            console.log('✅ No duplicate vouchers found in database');
        }
        
        console.log('\n🎉 Index setup completed successfully!');
        
    } catch (error) {
        console.error('❌ Index setup failed:', error);
        throw error;
    }
}

// Export for use in other scripts
module.exports = { createVoucherIndexes };

// Run if executed directly
if (require.main === module) {
    // Connect to MongoDB (adjust connection string as needed)
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dr_odin_tally', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        console.log('Connected to MongoDB');
        return createVoucherIndexes();
    }).then(() => {
        console.log('Setup completed, disconnecting...');
        return mongoose.disconnect();
    }).catch(error => {
        console.error('Setup error:', error);
        process.exit(1);
    });
}