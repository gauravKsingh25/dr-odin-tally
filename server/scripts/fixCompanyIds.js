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

// Function to find existing company ID from old vouchers
async function findExistingCompanyId() {
    console.log('🔍 Looking for existing company ID...');
    
    try {
        // Look for vouchers that have companyId set
        const voucherWithCompanyId = await TallyVoucher.findOne({
            companyId: { $exists: true, $ne: null }
        }).select('companyId voucherNumber uploadFileName');
        
        if (voucherWithCompanyId) {
            console.log(`✅ Found existing company ID: ${voucherWithCompanyId.companyId}`);
            console.log(`   From voucher: ${voucherWithCompanyId.voucherNumber}`);
            console.log(`   Upload source: ${voucherWithCompanyId.uploadFileName || 'Original data'}`);
            return voucherWithCompanyId.companyId;
        } else {
            console.log('⚠️  No vouchers with company ID found');
            return null;
        }
    } catch (error) {
        console.error('❌ Error finding company ID:', error.message);
        return null;
    }
}

// Function to update vouchers without company ID
async function updateVouchersWithCompanyId(companyId) {
    console.log('\n🔧 Updating vouchers with company ID...');
    
    try {
        // Find vouchers that don't have companyId or have null companyId
        const vouchersToUpdate = await TallyVoucher.find({
            $or: [
                { companyId: { $exists: false } },
                { companyId: null }
            ]
        }).select('_id voucherNumber uploadFileName');
        
        console.log(`📊 Found ${vouchersToUpdate.length} vouchers without company ID`);
        
        if (vouchersToUpdate.length === 0) {
            console.log('✅ All vouchers already have company ID set!');
            return;
        }
        
        // Group by upload source for better reporting
        const bySource = {};
        vouchersToUpdate.forEach(voucher => {
            const source = voucher.uploadFileName || 'Unknown';
            if (!bySource[source]) bySource[source] = [];
            bySource[source].push(voucher);
        });
        
        console.log('\n📋 Vouchers to update by source:');
        Object.keys(bySource).forEach(source => {
            console.log(`   ${source}: ${bySource[source].length} vouchers`);
        });
        
        // Update all vouchers without company ID
        const updateResult = await TallyVoucher.updateMany(
            {
                $or: [
                    { companyId: { $exists: false } },
                    { companyId: null }
                ]
            },
            {
                $set: { 
                    companyId: companyId,
                    lastUpdated: new Date()
                }
            }
        );
        
        console.log(`\n✅ Successfully updated ${updateResult.modifiedCount} vouchers`);
        console.log(`   Matched: ${updateResult.matchedCount}`);
        console.log(`   Modified: ${updateResult.modifiedCount}`);
        
        return updateResult;
        
    } catch (error) {
        console.error('❌ Error updating vouchers:', error.message);
        throw error;
    }
}

// Function to verify the update
async function verifyUpdate() {
    console.log('\n🔍 Verifying update...');
    
    try {
        // Count vouchers without company ID
        const withoutCompanyId = await TallyVoucher.countDocuments({
            $or: [
                { companyId: { $exists: false } },
                { companyId: null }
            ]
        });
        
        // Count vouchers with company ID
        const withCompanyId = await TallyVoucher.countDocuments({
            companyId: { $exists: true, $ne: null }
        });
        
        // Total count
        const totalVouchers = await TallyVoucher.countDocuments();
        
        console.log(`📊 Verification Results:`);
        console.log(`   Total vouchers: ${totalVouchers}`);
        console.log(`   With company ID: ${withCompanyId}`);
        console.log(`   Without company ID: ${withoutCompanyId}`);
        
        if (withoutCompanyId === 0) {
            console.log('✅ All vouchers now have company ID!');
        } else {
            console.log(`⚠️  Still ${withoutCompanyId} vouchers without company ID`);
        }
        
        // Show breakdown by upload source
        const sourceBreakdown = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: '$uploadFileName',
                    total: { $sum: 1 },
                    withCompanyId: {
                        $sum: {
                            $cond: [
                                { $and: [{ $ne: ['$companyId', null] }, { $ne: ['$companyId', undefined] }] },
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            { $sort: { total: -1 } }
        ]);
        
        console.log('\n📁 Company ID status by upload source:');
        sourceBreakdown.forEach(source => {
            const sourceName = source._id || 'Original data';
            const status = source.withCompanyId === source.total ? '✅' : '⚠️';
            console.log(`   ${status} ${sourceName}: ${source.withCompanyId}/${source.total}`);
        });
        
    } catch (error) {
        console.error('❌ Error verifying update:', error.message);
    }
}

// Main function
async function fixCompanyIds() {
    await connectDB();
    
    console.log('🔧 FIXING COMPANY IDs FOR VOUCHERS');
    console.log('=====================================');
    
    try {
        // Find existing company ID
        const companyId = await findExistingCompanyId();
        
        if (!companyId) {
            console.log('❌ Cannot proceed without an existing company ID');
            console.log('Please check if there are any vouchers with company ID set');
            return;
        }
        
        // Update vouchers without company ID
        await updateVouchersWithCompanyId(companyId);
        
        // Verify the update
        await verifyUpdate();
        
        console.log('\n🎉 Company ID fix completed successfully!');
        
    } catch (error) {
        console.error('❌ Error during company ID fix:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Function to show sample vouchers before and after
async function showSampleVouchers() {
    console.log('\n📋 Sample vouchers:');
    
    try {
        const samples = await TallyVoucher.find()
            .limit(5)
            .select('voucherNumber companyId uploadFileName createdAt')
            .sort({ createdAt: -1 });
        
        samples.forEach((voucher, index) => {
            const companyStatus = voucher.companyId ? '✅' : '❌';
            console.log(`   ${index + 1}. ${voucher.voucherNumber} ${companyStatus} (${voucher.uploadFileName || 'Original'})`);
        });
    } catch (error) {
        console.error('Error showing samples:', error.message);
    }
}

// Run the fix if this script is called directly
if (require.main === module) {
    fixCompanyIds()
        .then(() => {
            console.log('\n✅ Company ID fix process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Company ID fix process failed:', error);
            process.exit(1);
        });
}

module.exports = { 
    fixCompanyIds, 
    findExistingCompanyId, 
    updateVouchersWithCompanyId, 
    verifyUpdate 
};