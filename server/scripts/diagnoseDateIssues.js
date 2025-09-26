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

// Function to analyze date issues in the database
async function analyzeDateIssues() {
    console.log('🔍 ANALYZING DATE ISSUES IN DATABASE');
    console.log('===================================');
    
    try {
        // Get total count
        const totalVouchers = await TallyVoucher.countDocuments();
        console.log(`📊 Total vouchers in database: ${totalVouchers.toLocaleString()}`);
        
        // Get unique dates
        const uniqueDates = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$date"
                        }
                    },
                    count: { $sum: 1 },
                    sampleVouchers: { $push: { voucherNumber: "$voucherNumber", party: "$party" } }
                }
            },
            {
                $sort: { "_id": -1 }
            },
            {
                $limit: 20
            }
        ]);
        
        console.log('\n📅 UNIQUE DATES FOUND (Top 20):');
        console.log('===============================');
        uniqueDates.forEach((dateGroup, index) => {
            const sampleVoucher = dateGroup.sampleVouchers[0] || { voucherNumber: 'N/A', party: 'N/A' };
            console.log(`${(index + 1).toString().padStart(2, ' ')}. ${dateGroup._id} | Count: ${dateGroup.count.toString().padStart(4, ' ')} | Sample: ${sampleVoucher.voucherNumber} - ${sampleVoucher.party.substring(0, 30)}`);
        });
        
        // Check for NULL or invalid dates
        const nullDates = await TallyVoucher.countDocuments({ 
            $or: [
                { date: null },
                { date: { $exists: false } },
                { date: "" }
            ]
        });
        
        console.log(`\n⚠️  Vouchers with NULL/missing dates: ${nullDates}`);
        
        // Check for specific date ranges
        const dateRanges = [
            { name: '2024 dates', start: new Date('2024-01-01'), end: new Date('2024-12-31') },
            { name: '2025 dates', start: new Date('2025-01-01'), end: new Date('2025-12-31') },
            { name: 'Future dates (after Sept 2025)', start: new Date('2025-09-26'), end: new Date('2030-01-01') }
        ];
        
        console.log('\n📊 DATE RANGE ANALYSIS:');
        console.log('=======================');
        
        for (const range of dateRanges) {
            const count = await TallyVoucher.countDocuments({
                date: {
                    $gte: range.start,
                    $lte: range.end
                }
            });
            console.log(`${range.name.padEnd(30)} | Count: ${count.toLocaleString()}`);
        }
        
        // Get sample vouchers with their raw dates
        console.log('\n🔍 SAMPLE VOUCHERS WITH DATES:');
        console.log('==============================');
        
        const sampleVouchers = await TallyVoucher.find({})
            .sort({ date: -1 })
            .limit(10)
            .select('voucherNumber date party rawData.Date_iso uploadBatch')
            .lean();
        
        sampleVouchers.forEach((voucher, index) => {
            const dateStr = voucher.date ? voucher.date.toISOString().split('T')[0] : 'NULL';
            const rawDateStr = voucher.rawData?.Date_iso || 'No raw date';
            console.log(`${(index + 1).toString().padStart(2, ' ')}. ${voucher.voucherNumber.padEnd(12)} | DB Date: ${dateStr} | Raw Date: ${rawDateStr} | Party: ${voucher.party.substring(0, 25)}`);
        });
        
        // Check if all vouchers have the same date
        const dateDistribution = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: "$date",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 5
            }
        ]);
        
        console.log('\n📈 TOP 5 DATE OCCURRENCES:');
        console.log('==========================');
        dateDistribution.forEach((dist, index) => {
            const dateStr = dist._id ? dist._id.toISOString().split('T')[0] : 'NULL';
            const percentage = ((dist.count / totalVouchers) * 100).toFixed(1);
            console.log(`${(index + 1).toString().padStart(2, ' ')}. ${dateStr} | Count: ${dist.count.toLocaleString()} (${percentage}%)`);
        });
        
        if (dateDistribution.length > 0 && dateDistribution[0].count > (totalVouchers * 0.8)) {
            console.log('\n🚨 PROBLEM DETECTED: More than 80% of vouchers have the same date!');
            console.log('   This suggests a date conversion/import issue.');
        }
        
    } catch (error) {
        console.error('❌ Error analyzing dates:', error.message);
    }
}

// Function to fix date issues if found
async function fixDateIssues() {
    console.log('\n🔧 CHECKING FOR DATE FIX OPPORTUNITIES');
    console.log('======================================');
    
    try {
        // Find vouchers that have rawData with different Date_iso than the stored date
        const vouchersWithRawData = await TallyVoucher.find({
            'rawData.Date_iso': { $exists: true, $ne: null }
        })
        .limit(10)
        .select('voucherNumber date rawData.Date_iso party')
        .lean();
        
        console.log('\nChecking if stored dates match raw dates...');
        
        let mismatchCount = 0;
        const mismatches = [];
        
        for (const voucher of vouchersWithRawData) {
            const storedDate = voucher.date ? voucher.date.toISOString().split('T')[0] : null;
            const rawDate = voucher.rawData.Date_iso;
            
            if (storedDate !== rawDate) {
                mismatchCount++;
                mismatches.push({
                    voucherNumber: voucher.voucherNumber,
                    storedDate,
                    rawDate,
                    party: voucher.party
                });
            }
        }
        
        if (mismatchCount > 0) {
            console.log(`\n⚠️  Found ${mismatchCount} vouchers with date mismatches in sample:`);
            mismatches.forEach((mismatch, index) => {
                console.log(`${(index + 1).toString().padStart(2, ' ')}. ${mismatch.voucherNumber} | Stored: ${mismatch.storedDate} | Raw: ${mismatch.rawDate} | ${mismatch.party.substring(0, 25)}`);
            });
            
            console.log('\n💡 Would you like to run a fix script? This issue suggests dates were incorrectly processed during import.');
        } else {
            console.log('✅ Dates match between stored and raw data in sample.');
        }
        
    } catch (error) {
        console.error('❌ Error checking for date fixes:', error.message);
    }
}

// Main function
async function diagnoseDateIssues() {
    await connectDB();
    
    try {
        await analyzeDateIssues();
        await fixDateIssues();
        
        console.log('\n🎯 DIAGNOSIS COMPLETE');
        console.log('====================');
        console.log('If many vouchers have the same date, the issue is in:');
        console.log('1. Date conversion during import (convertVoucherToDbFormat function)');
        console.log('2. Date parsing from JSON (new Date() calls)');
        console.log('3. Database storage/retrieval');
        
    } catch (error) {
        console.error('❌ Error during diagnosis:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the diagnosis
if (require.main === module) {
    diagnoseDateIssues()
        .then(() => {
            console.log('\n✅ Date diagnosis completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Date diagnosis failed:', error);
            process.exit(1);
        });
}

module.exports = { diagnoseDateIssues, analyzeDateIssues };