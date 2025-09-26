const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const TallyVoucher = require('../models/tallyVoucher.model.js');

async function quickVerification() {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    
    console.log('🔍 QUICK VERIFICATION');
    console.log('====================');
    
    // Sample vouchers
    const samples = await TallyVoucher.find()
        .limit(5)
        .select('voucherNumber companyId uploadFileName')
        .sort({ createdAt: -1 });
    
    console.log('\n📋 Sample recent vouchers:');
    samples.forEach((v, i) => {
        const status = v.companyId ? '✅' : '❌';
        console.log(`   ${i+1}. ${v.voucherNumber} ${status} CompanyId: ${v.companyId}`);
        console.log(`      Source: ${v.uploadFileName || 'Original'}`);
    });
    
    // Count verification
    const totalVouchers = await TallyVoucher.countDocuments();
    const withCompanyId = await TallyVoucher.countDocuments({
        companyId: { $exists: true, $ne: null }
    });
    
    console.log(`\n📊 Final Count:`);
    console.log(`   Total vouchers: ${totalVouchers}`);
    console.log(`   With company ID: ${withCompanyId}`);
    console.log(`   Missing company ID: ${totalVouchers - withCompanyId}`);
    
    if (totalVouchers === withCompanyId) {
        console.log('\n🎉 SUCCESS: All vouchers have company IDs!');
    } else {
        console.log('\n⚠️ WARNING: Some vouchers still missing company IDs!');
    }
    
    await mongoose.connection.close();
}

quickVerification().catch(console.error);