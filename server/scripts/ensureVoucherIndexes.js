// Database index verification and creation script
const mongoose = require('mongoose');
const TallyVoucher = require('../models/tallyVoucher.model');

async function ensureVoucherIndexes() {
    try {
        console.log('🔍 Checking voucher collection indexes...');
        
        // Get existing indexes
        const existingIndexes = await TallyVoucher.collection.getIndexes();
        console.log('📋 Existing indexes:', Object.keys(existingIndexes));
        
        // Check if the unique compound index exists
        const requiredIndexName = 'voucherNumber_1_companyId_1';
        const uniqueIndex = existingIndexes[requiredIndexName];
        
        if (uniqueIndex && uniqueIndex.unique) {
            console.log('✅ Required unique index already exists:', requiredIndexName);
            console.log('   Index details:', uniqueIndex);
        } else {
            console.log('⚠️  Required unique index not found, creating it...');
            
            try {
                await TallyVoucher.collection.createIndex(
                    { voucherNumber: 1, companyId: 1 }, 
                    { 
                        unique: true, 
                        name: requiredIndexName,
                        background: true // Create in background to avoid blocking
                    }
                );
                console.log('✅ Unique index created successfully');
            } catch (indexError) {
                if (indexError.code === 11000) {
                    console.log('⚠️  Index creation failed due to existing duplicate data');
                    console.log('   You may need to clean up duplicate vouchers first');
                    
                    // Find and report duplicates
                    const duplicates = await TallyVoucher.aggregate([
                        {
                            $group: {
                                _id: { voucherNumber: "$voucherNumber", companyId: "$companyId" },
                                count: { $sum: 1 },
                                documents: { $push: { _id: "$_id", date: "$date", amount: "$amount" } }
                            }
                        },
                        { $match: { count: { $gt: 1 } } },
                        { $limit: 10 } // Show first 10 duplicates
                    ]);
                    
                    if (duplicates.length > 0) {
                        console.log('🔍 Found duplicate vouchers:');
                        duplicates.forEach(dup => {
                            console.log(`   - Voucher ${dup._id.voucherNumber}: ${dup.count} duplicates`);
                            dup.documents.forEach((doc, idx) => {
                                console.log(`     ${idx + 1}. ID: ${doc._id}, Date: ${doc.date}, Amount: ${doc.amount}`);
                            });
                        });
                    }
                } else {
                    console.error('❌ Failed to create index:', indexError);
                }
            }
        }
        
        // List all indexes after operation
        const finalIndexes = await TallyVoucher.collection.getIndexes();
        console.log('📋 Final indexes:', Object.keys(finalIndexes));
        
        return { success: true, indexes: finalIndexes };
        
    } catch (error) {
        console.error('❌ Error ensuring indexes:', error);
        return { success: false, error: error.message };
    }
}

// Function to clean up duplicate vouchers (use with caution)
async function cleanupDuplicateVouchers(dryRun = true) {
    try {
        console.log(`🧹 ${dryRun ? 'Analyzing' : 'Cleaning up'} duplicate vouchers...`);
        
        const duplicates = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: { voucherNumber: "$voucherNumber", companyId: "$companyId" },
                    count: { $sum: 1 },
                    documents: { $push: { _id: "$_id", createdAt: "$createdAt", date: "$date" } }
                }
            },
            { $match: { count: { $gt: 1 } } }
        ]);
        
        console.log(`📊 Found ${duplicates.length} sets of duplicate vouchers`);
        
        let totalDuplicates = 0;
        let cleanupOperations = [];
        
        for (const duplicate of duplicates) {
            // Keep the oldest document (first created), remove others
            const sortedDocs = duplicate.documents.sort((a, b) => {
                // Sort by createdAt if available, otherwise by _id (which contains timestamp)
                const aTime = a.createdAt ? new Date(a.createdAt) : a._id.getTimestamp();
                const bTime = b.createdAt ? new Date(b.createdAt) : b._id.getTimestamp();
                return aTime - bTime;
            });
            
            const toKeep = sortedDocs[0];
            const toDelete = sortedDocs.slice(1);
            
            console.log(`   Voucher ${duplicate._id.voucherNumber}:`);
            console.log(`     Keep: ${toKeep._id} (${toKeep.createdAt || toKeep._id.getTimestamp()})`);
            console.log(`     Delete: ${toDelete.length} duplicates`);
            
            totalDuplicates += toDelete.length;
            
            if (!dryRun) {
                const deleteIds = toDelete.map(doc => doc._id);
                cleanupOperations.push({
                    deleteMany: {
                        filter: { _id: { $in: deleteIds } }
                    }
                });
            }
        }
        
        console.log(`📈 Total duplicates to ${dryRun ? 'be cleaned' : 'clean'}: ${totalDuplicates}`);
        
        if (!dryRun && cleanupOperations.length > 0) {
            console.log('🗑️  Executing cleanup operations...');
            const result = await TallyVoucher.bulkWrite(cleanupOperations);
            console.log(`✅ Cleaned up ${result.deletedCount} duplicate vouchers`);
            return { success: true, deletedCount: result.deletedCount };
        }
        
        return { success: true, duplicateCount: totalDuplicates, dryRun };
        
    } catch (error) {
        console.error('❌ Error cleaning duplicates:', error);
        return { success: false, error: error.message };
    }
}

module.exports = { ensureVoucherIndexes, cleanupDuplicateVouchers };

// Run if executed directly
if (require.main === module) {
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dr_odin_tally', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(async () => {
        console.log('Connected to MongoDB');
        
        // First ensure indexes
        await ensureVoucherIndexes();
        
        // Then analyze duplicates (dry run)
        await cleanupDuplicateVouchers(true);
        
        console.log('\n💡 To actually clean up duplicates, run:');
        console.log('   cleanupDuplicateVouchers(false)');
        
        return mongoose.disconnect();
    }).catch(error => {
        console.error('Database error:', error);
        process.exit(1);
    });
}