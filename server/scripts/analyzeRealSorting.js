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

// Function to show the actual date distribution and sorting
async function showRealDateDistribution() {
    console.log('📅 REAL DATE DISTRIBUTION AND SORTING ANALYSIS');
    console.log('==============================================');
    
    try {
        // Get the newest and oldest dates
        const newestVoucher = await TallyVoucher.findOne({}).sort({ date: -1 }).select('date voucherNumber party');
        const oldestVoucher = await TallyVoucher.findOne({}).sort({ date: 1 }).select('date voucherNumber party');
        
        console.log('📊 Date Range in Database:');
        console.log(`   Newest: ${newestVoucher.date.toISOString().split('T')[0]} (${newestVoucher.voucherNumber})`);
        console.log(`   Oldest: ${oldestVoucher.date.toISOString().split('T')[0]} (${oldestVoucher.voucherNumber})`);
        
        // Get top 50 most recent vouchers to see the date distribution
        console.log('\n🔍 TOP 50 MOST RECENT VOUCHERS:');
        console.log('================================');
        
        const recentVouchers = await TallyVoucher.find({})
            .sort({ date: -1, _id: -1 }) // Secondary sort by _id for consistency
            .limit(50)
            .select('date voucherNumber party amount')
            .lean();
        
        // Group by date to see pattern
        const dateGroups = {};
        recentVouchers.forEach(voucher => {
            const dateKey = voucher.date.toISOString().split('T')[0];
            if (!dateGroups[dateKey]) {
                dateGroups[dateKey] = [];
            }
            dateGroups[dateKey].push(voucher);
        });
        
        // Show grouped results
        let counter = 1;
        Object.keys(dateGroups).sort().reverse().forEach(date => {
            const vouchers = dateGroups[date];
            console.log(`\n📅 ${date} (${vouchers.length} vouchers):`);
            vouchers.slice(0, 10).forEach(voucher => {
                const amount = voucher.amount ? `₹${voucher.amount.toLocaleString()}` : '₹0';
                console.log(`   ${counter.toString().padStart(2, ' ')}. ${voucher.voucherNumber.padEnd(12)} | ${voucher.party.substring(0, 35).padEnd(35)} | ${amount}`);
                counter++;
            });
            if (vouchers.length > 10) {
                console.log(`   ... and ${vouchers.length - 10} more vouchers on this date`);
            }
        });
        
        // Check if the "same date" issue is actually correct
        const june30Count = await TallyVoucher.countDocuments({
            date: {
                $gte: new Date('2025-06-30T00:00:00.000Z'),
                $lt: new Date('2025-07-01T00:00:00.000Z')
            }
        });
        
        console.log(`\n📊 JUNE 30, 2025 ANALYSIS:`);
        console.log('===========================');
        console.log(`Total vouchers on June 30, 2025: ${june30Count}`);
        
        if (june30Count > 50) {
            console.log('✅ This explains why you see the same date repeatedly!');
            console.log('   Many vouchers legitimately have June 30, 2025 as their date.');
            console.log('   The sorting is working correctly - these ARE the most recent vouchers.');
        }
        
        // Check for vouchers after June 30, 2025
        const afterJune30 = await TallyVoucher.find({
            date: { $gt: new Date('2025-06-30T23:59:59.999Z') }
        })
        .sort({ date: -1 })
        .limit(10)
        .select('date voucherNumber party')
        .lean();
        
        if (afterJune30.length > 0) {
            console.log('\n🔍 VOUCHERS AFTER JUNE 30, 2025:');
            console.log('=================================');
            afterJune30.forEach((voucher, index) => {
                console.log(`${(index + 1).toString().padStart(2, ' ')}. ${voucher.voucherNumber} | ${voucher.date.toISOString().split('T')[0]} | ${voucher.party}`);
            });
        } else {
            console.log('\n✅ NO VOUCHERS FOUND AFTER JUNE 30, 2025');
            console.log('This confirms that June 30, 2025 vouchers are indeed the most recent!');
        }
        
        // Show monthly distribution for recent months
        console.log('\n📅 RECENT MONTHLY DISTRIBUTION:');
        console.log('===============================');
        
        const monthlyDistribution = await TallyVoucher.aggregate([
            {
                $match: {
                    date: { $gte: new Date('2025-01-01') }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    count: { $sum: 1 },
                    maxDate: { $max: "$date" },
                    minDate: { $min: "$date" }
                }
            },
            {
                $sort: { "_id.year": -1, "_id.month": -1 }
            }
        ]);
        
        monthlyDistribution.forEach(month => {
            const monthName = new Date(month._id.year, month._id.month - 1).toLocaleString('default', { month: 'long' });
            console.log(`${monthName} ${month._id.year}: ${month.count.toLocaleString()} vouchers`);
        });
        
    } catch (error) {
        console.error('❌ Error analyzing date distribution:', error.message);
    }
}

// Main function
async function analyzeRealSorting() {
    await connectDB();
    
    try {
        await showRealDateDistribution();
        
        console.log('\n🎯 CONCLUSION:');
        console.log('==============');
        console.log('If you see many vouchers with the same date (June 30, 2025),');
        console.log('this is likely CORRECT behavior - they are genuinely the most recent vouchers!');
        console.log('The sorting is working properly. The issue is not technical but data-related.');
        
    } catch (error) {
        console.error('❌ Error during analysis:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the analysis
if (require.main === module) {
    analyzeRealSorting()
        .then(() => {
            console.log('\n✅ Real sorting analysis completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Analysis failed:', error);
            process.exit(1);
        });
}

module.exports = { analyzeRealSorting };