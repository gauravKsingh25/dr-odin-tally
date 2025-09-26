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

// Function to get voucher statistics
async function getVoucherStatistics() {
    console.log('📊 VOUCHER DATABASE STATISTICS');
    console.log('=====================================');
    
    try {
        // Total vouchers count
        const totalVouchers = await TallyVoucher.countDocuments();
        console.log(`📈 Total Vouchers: ${totalVouchers}`);
        
        // Voucher types breakdown
        const voucherTypes = await TallyVoucher.aggregate([
            { $group: { _id: '$voucherType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\n📋 Voucher Types:');
        voucherTypes.forEach(type => {
            console.log(`   ${type._id}: ${type.count}`);
        });
        
        // Upload sources breakdown
        const uploadSources = await TallyVoucher.aggregate([
            { $group: { _id: '$uploadFileName', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        console.log('\n📁 Upload Sources:');
        uploadSources.forEach(source => {
            console.log(`   ${source._id}: ${source.count}`);
        });
        
        // Date range
        const dateRange = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: null,
                    minDate: { $min: '$date' },
                    maxDate: { $max: '$date' }
                }
            }
        ]);
        
        if (dateRange.length > 0) {
            console.log('\n📅 Date Range:');
            console.log(`   From: ${dateRange[0].minDate.toDateString()}`);
            console.log(`   To: ${dateRange[0].maxDate.toDateString()}`);
        }
        
        // Monthly breakdown
        const monthlyBreakdown = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);
        
        console.log('\n📆 Monthly Breakdown:');
        monthlyBreakdown.forEach(month => {
            const monthName = new Date(month._id.year, month._id.month - 1).toLocaleString('default', { month: 'long' });
            console.log(`   ${monthName} ${month._id.year}: ${month.count} vouchers (₹${month.totalAmount.toLocaleString()})`);
        });
        
        // Top parties by transaction count
        const topPartiesByCount = await TallyVoucher.aggregate([
            { $group: { _id: '$party', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        
        console.log('\n🏢 Top 10 Parties (by transaction count):');
        topPartiesByCount.forEach((party, index) => {
            console.log(`   ${index + 1}. ${party._id}: ${party.count} transactions (₹${party.totalAmount.toLocaleString()})`);
        });
        
        // Top parties by amount
        const topPartiesByAmount = await TallyVoucher.aggregate([
            { $group: { _id: '$party', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
            { $sort: { totalAmount: -1 } },
            { $limit: 10 }
        ]);
        
        console.log('\n💰 Top 10 Parties (by amount):');
        topPartiesByAmount.forEach((party, index) => {
            console.log(`   ${index + 1}. ${party._id}: ₹${party.totalAmount.toLocaleString()} (${party.count} transactions)`);
        });
        
        // Total amount by upload source
        const amountBySource = await TallyVoucher.aggregate([
            { 
                $group: { 
                    _id: '$uploadFileName', 
                    count: { $sum: 1 }, 
                    totalAmount: { $sum: '$amount' } 
                } 
            },
            { $sort: { totalAmount: -1 } }
        ]);
        
        console.log('\n💵 Amount by Upload Source:');
        amountBySource.forEach(source => {
            console.log(`   ${source._id}: ₹${source.totalAmount.toLocaleString()} (${source.count} vouchers)`);
        });
        
        // GST statistics
        const gstStats = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: null,
                    totalCGST: { $sum: '$gstDetails.cgstAmount' },
                    totalSGST: { $sum: '$gstDetails.sgstAmount' },
                    totalIGST: { $sum: '$gstDetails.igstAmount' },
                    totalTax: { $sum: '$gstDetails.totalTaxAmount' }
                }
            }
        ]);
        
        if (gstStats.length > 0) {
            console.log('\n🧾 GST Summary:');
            console.log(`   Total CGST: ₹${gstStats[0].totalCGST.toLocaleString()}`);
            console.log(`   Total SGST: ₹${gstStats[0].totalSGST.toLocaleString()}`);
            console.log(`   Total IGST: ₹${gstStats[0].totalIGST.toLocaleString()}`);
            console.log(`   Total Tax: ₹${gstStats[0].totalTax.toLocaleString()}`);
        }
        
        // Recent vouchers
        const recentVouchers = await TallyVoucher.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('voucherNumber party amount date uploadFileName createdAt');
        
        console.log('\n🕐 Recently Added Vouchers:');
        recentVouchers.forEach((voucher, index) => {
            console.log(`   ${index + 1}. ${voucher.voucherNumber} - ${voucher.party} - ₹${voucher.amount} (${voucher.uploadFileName})`);
        });
        
    } catch (error) {
        console.error('❌ Error getting statistics:', error.message);
    }
}

// Function to check for duplicates
async function checkForDuplicates() {
    console.log('\n🔍 DUPLICATE CHECK');
    console.log('=====================================');
    
    try {
        const duplicates = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: '$voucherNumber',
                    count: { $sum: 1 },
                    docs: { $push: { id: '$_id', uploadSource: '$uploadFileName' } }
                }
            },
            { $match: { count: { $gt: 1 } } },
            { $limit: 10 }
        ]);
        
        if (duplicates.length > 0) {
            console.log(`⚠️  Found ${duplicates.length} voucher numbers with duplicates:`);
            duplicates.forEach(dup => {
                console.log(`   ${dup._id}: ${dup.count} instances`);
                dup.docs.forEach(doc => {
                    console.log(`     - ${doc.id} (${doc.uploadSource})`);
                });
            });
        } else {
            console.log('✅ No duplicate voucher numbers found!');
        }
    } catch (error) {
        console.error('❌ Error checking duplicates:', error.message);
    }
}

// Main function
async function generateReport() {
    await connectDB();
    
    await getVoucherStatistics();
    await checkForDuplicates();
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the report if this script is called directly
if (require.main === module) {
    generateReport()
        .then(() => {
            console.log('\n✅ Report generated successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Report generation failed:', error);
            process.exit(1);
        });
}

module.exports = { generateReport, getVoucherStatistics, checkForDuplicates };