const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import the TallyVoucher model
const TallyVoucher = require('../models/tallyVoucher.model.js');

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

// Function to find and remove duplicate vouchers
async function removeDuplicateVouchers() {
    console.log('🔍 FINDING DUPLICATE VOUCHERS...');
    
    try {
        // Find duplicates using aggregation
        const duplicates = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: '$voucherNumber',
                    count: { $sum: 1 },
                    docs: { $push: '$$ROOT' }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);
        
        console.log(`📊 Found ${duplicates.length} voucher numbers with duplicates`);
        
        if (duplicates.length === 0) {
            console.log('✅ No duplicates found!');
            return 0;
        }
        
        let totalDuplicatesRemoved = 0;
        
        // Process each duplicate group
        for (const duplicate of duplicates) {
            const voucherNumber = duplicate._id;
            const docs = duplicate.docs;
            
            console.log(`\n🔄 Processing voucher ${voucherNumber} (${docs.length} copies)`);
            
            // Sort by creation date to keep the oldest/first one
            docs.sort((a, b) => new Date(a.createdAt || a._id.getTimestamp()) - new Date(b.createdAt || b._id.getTimestamp()));
            
            // Keep the first one, remove the rest
            const toKeep = docs[0];
            const toRemove = docs.slice(1);
            
            console.log(`   ✅ Keeping: ${toKeep._id} (created: ${toKeep.createdAt || toKeep._id.getTimestamp()})`);
            console.log(`   🗑️  Removing: ${toRemove.length} duplicates`);
            
            // Remove duplicates
            const idsToRemove = toRemove.map(doc => doc._id);
            const deleteResult = await TallyVoucher.deleteMany({ _id: { $in: idsToRemove } });
            
            totalDuplicatesRemoved += deleteResult.deletedCount;
            console.log(`   ✅ Removed ${deleteResult.deletedCount} duplicates for ${voucherNumber}`);
        }
        
        console.log(`\n🎉 DUPLICATE REMOVAL COMPLETE!`);
        console.log(`   🗑️  Total duplicates removed: ${totalDuplicatesRemoved}`);
        
        return totalDuplicatesRemoved;
        
    } catch (error) {
        console.error('❌ Error finding/removing duplicates:', error.message);
        return 0;
    }
}

// Function to create unique index on voucherNumber
async function createUniqueIndex() {
    console.log('\n🔧 CREATING UNIQUE INDEX ON VOUCHER NUMBER...');
    
    try {
        // Check if index already exists
        const indexes = await TallyVoucher.collection.getIndexes();
        const existingIndex = Object.keys(indexes).find(indexName => 
            indexes[indexName].some(field => field[0] === 'voucherNumber' && field[1] === 1)
        );
        
        if (existingIndex) {
            console.log(`📋 Found existing index: ${existingIndex}`);
            
            // Check if it's unique
            const indexInfo = await TallyVoucher.collection.indexInformation();
            const voucherNumberIndex = Object.keys(indexInfo).find(name => 
                JSON.stringify(indexInfo[name]) === JSON.stringify([['voucherNumber', 1]])
            );
            
            if (voucherNumberIndex && indexes[voucherNumberIndex] && indexes[voucherNumberIndex].unique) {
                console.log('✅ Unique index on voucherNumber already exists!');
                return true;
            } else {
                console.log('⚠️  Index exists but is not unique. Dropping and recreating...');
                try {
                    await TallyVoucher.collection.dropIndex({ voucherNumber: 1 });
                    console.log('✅ Dropped existing non-unique index');
                } catch (dropError) {
                    console.log('⚠️  Could not drop existing index:', dropError.message);
                }
            }
        }
        
        // Create unique index
        await TallyVoucher.collection.createIndex(
            { voucherNumber: 1 }, 
            { 
                unique: true, 
                name: 'voucherNumber_unique',
                background: true  // Create in background to avoid blocking
            }
        );
        
        console.log('✅ Successfully created unique index on voucherNumber!');
        console.log('🔒 Voucher numbers are now enforced as unique (primary key)');
        
        return true;
        
    } catch (error) {
        if (error.code === 11000) {
            console.error('❌ Cannot create unique index - duplicates still exist!');
            console.error('   Please run duplicate removal first');
        } else {
            console.error('❌ Error creating unique index:', error.message);
        }
        return false;
    }
}

// Function to validate database integrity
async function validateDatabaseIntegrity() {
    console.log('\n🔍 VALIDATING DATABASE INTEGRITY...');
    
    try {
        const totalVouchers = await TallyVoucher.countDocuments();
        console.log(`📊 Total vouchers in database: ${totalVouchers}`);
        
        // Check for any remaining duplicates
        const duplicateCheck = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: '$voucherNumber',
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);
        
        if (duplicateCheck.length > 0) {
            console.log(`❌ Found ${duplicateCheck.length} voucher numbers still have duplicates:`);
            duplicateCheck.forEach(dup => {
                console.log(`   - ${dup._id}: ${dup.count} copies`);
            });
            return false;
        } else {
            console.log('✅ No duplicate voucher numbers found!');
        }
        
        // Check unique voucher count
        const uniqueVoucherCount = await TallyVoucher.distinct('voucherNumber');
        console.log(`📊 Unique voucher numbers: ${uniqueVoucherCount.length}`);
        
        if (totalVouchers === uniqueVoucherCount.length) {
            console.log('✅ Perfect! Total vouchers = Unique voucher numbers');
        } else {
            console.log(`⚠️  Mismatch: ${totalVouchers} total vs ${uniqueVoucherCount.length} unique`);
        }
        
        // Sample voucher numbers
        const sampleVouchers = await TallyVoucher.find({})
            .select('voucherNumber party date')
            .sort({ date: -1 })
            .limit(5);
        
        console.log('\n📋 Sample vouchers:');
        sampleVouchers.forEach(voucher => {
            console.log(`   ${voucher.voucherNumber} | ${voucher.party} | ${voucher.date?.toDateString()}`);
        });
        
        return true;
        
    } catch (error) {
        console.error('❌ Error validating database:', error.message);
        return false;
    }
}

// Main function to ensure unique voucher numbers
async function ensureUniqueVoucherNumbers() {
    await connectDB();
    
    console.log('🚀 ENSURING UNIQUE VOUCHER NUMBERS (PRIMARY KEY)');
    console.log('===============================================');
    
    const startTime = Date.now();
    
    // Step 1: Remove duplicates
    const duplicatesRemoved = await removeDuplicateVouchers();
    
    // Step 2: Create unique index
    const indexCreated = await createUniqueIndex();
    
    // Step 3: Validate integrity
    const isValid = await validateDatabaseIntegrity();
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 UNIQUE VOUCHER NUMBER SETUP COMPLETE');
    console.log('======================================');
    console.log(`🗑️  Duplicates removed: ${duplicatesRemoved}`);
    console.log(`🔧 Unique index created: ${indexCreated ? 'Yes' : 'No'}`);
    console.log(`✅ Database valid: ${isValid ? 'Yes' : 'No'}`);
    console.log(`⏱️  Process time: ${duration} seconds`);
    
    if (indexCreated && isValid) {
        console.log('\n🎯 SUCCESS! Voucher numbers are now unique primary keys!');
        console.log('🔒 Future attempts to insert duplicate voucher numbers will be rejected');
    } else {
        console.log('\n⚠️  Some issues encountered. Please review the output above.');
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the script if called directly
if (require.main === module) {
    ensureUniqueVoucherNumbers()
        .then(() => {
            console.log('\n✅ Unique voucher number setup completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Setup failed:', error);
            process.exit(1);
        });
}

module.exports = { ensureUniqueVoucherNumbers, removeDuplicateVouchers, createUniqueIndex };