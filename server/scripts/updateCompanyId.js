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

// Update company ID for all vouchers
async function updateAllVouchersCompanyId() {
    await connectDB();
    
    console.log('🚀 UPDATING COMPANY ID FOR ALL VOUCHERS');
    console.log('======================================');
    
    const CORRECT_COMPANY_ID = "68b9755e578bec07fd1ca54d";
    const WRONG_COMPANY_ID = "64f1a234b567890123456789";
    
    console.log(`🔄 Updating from: ${WRONG_COMPANY_ID}`);
    console.log(`✅ Updating to: ${CORRECT_COMPANY_ID}`);
    
    try {
        // Get current count of vouchers with wrong company ID
        const wrongIdCount = await TallyVoucher.countDocuments({ 
            companyId: WRONG_COMPANY_ID 
        });
        
        const totalVouchers = await TallyVoucher.countDocuments();
        
        console.log(`\n📊 Current Database State:`);
        console.log(`   Total vouchers: ${totalVouchers}`);
        console.log(`   Vouchers with wrong company ID: ${wrongIdCount}`);
        
        if (wrongIdCount === 0) {
            console.log('✅ No vouchers found with wrong company ID. Checking all vouchers...');
            
            // Check if any vouchers have the correct ID already
            const correctIdCount = await TallyVoucher.countDocuments({ 
                companyId: CORRECT_COMPANY_ID 
            });
            
            if (correctIdCount > 0) {
                console.log(`✅ Found ${correctIdCount} vouchers already with correct company ID`);
                console.log('🎯 No update needed!');
            } else {
                console.log('⚠️  No vouchers found with any company ID. Updating all...');
                
                // Update all vouchers without specific company ID filter
                const updateResult = await TallyVoucher.updateMany(
                    {}, // Update all vouchers
                    { 
                        $set: { 
                            companyId: CORRECT_COMPANY_ID,
                            updatedAt: new Date(),
                            companyIdUpdatedBy: 'Company ID Fix Script'
                        } 
                    }
                );
                
                console.log(`\n🎉 UPDATE COMPLETED SUCCESSFULLY!`);
                console.log(`   ✅ Vouchers updated: ${updateResult.modifiedCount}`);
                console.log(`   📝 Matched vouchers: ${updateResult.matchedCount}`);
            }
        } else {
            // Update vouchers with wrong company ID
            console.log(`\n🔄 Starting bulk update...`);
            
            const updateResult = await TallyVoucher.updateMany(
                { companyId: WRONG_COMPANY_ID },
                { 
                    $set: { 
                        companyId: CORRECT_COMPANY_ID,
                        updatedAt: new Date(),
                        companyIdUpdatedBy: 'Company ID Fix Script'
                    } 
                }
            );
            
            console.log(`\n🎉 UPDATE COMPLETED SUCCESSFULLY!`);
            console.log(`   ✅ Vouchers updated: ${updateResult.modifiedCount}`);
            console.log(`   📝 Matched vouchers: ${updateResult.matchedCount}`);
        }
        
        // Verify the update
        const verificationCount = await TallyVoucher.countDocuments({ 
            companyId: CORRECT_COMPANY_ID 
        });
        
        const remainingWrongCount = await TallyVoucher.countDocuments({ 
            companyId: WRONG_COMPANY_ID 
        });
        
        console.log(`\n🔍 VERIFICATION RESULTS:`);
        console.log(`   ✅ Vouchers with correct company ID: ${verificationCount}`);
        console.log(`   ❌ Vouchers with wrong company ID: ${remainingWrongCount}`);
        
        if (remainingWrongCount === 0 && verificationCount > 0) {
            console.log(`\n🎯 SUCCESS! All vouchers now have the correct company ID!`);
        } else if (verificationCount === 0) {
            console.log(`\n⚠️  WARNING: No vouchers found with the correct company ID after update!`);
        }
        
        // Sample verification - show a few vouchers with their company IDs
        const sampleVouchers = await TallyVoucher.find({})
            .select('voucherNumber companyId party date')
            .limit(5);
        
        console.log(`\n📋 Sample vouchers verification:`);
        sampleVouchers.forEach(voucher => {
            const idStatus = voucher.companyId === CORRECT_COMPANY_ID ? '✅' : '❌';
            console.log(`   ${idStatus} ${voucher.voucherNumber} | ${voucher.party} | Company: ${voucher.companyId}`);
        });
        
    } catch (error) {
        console.error('❌ Error updating company IDs:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the update if this script is called directly
if (require.main === module) {
    updateAllVouchersCompanyId()
        .then(() => {
            console.log('\n✅ Company ID update process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Company ID update process failed:', error);
            process.exit(1);
        });
}

module.exports = { updateAllVouchersCompanyId };