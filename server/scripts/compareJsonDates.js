const mongoose = require('mongoose');
const fs = require('fs');
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

// Function to compare JSON dates with database dates
async function compareJsonWithDatabase() {
    console.log('🔍 COMPARING JSON FILES WITH DATABASE DATES');
    console.log('==========================================');
    
    try {
        // Read and sample JSON files
        const jsonFiles = ['excel1.json', 'excel2.json', 'excel3.json', 'excel4.json'];
        const jsonDirectory = path.join(__dirname, 'converted');
        
        for (const jsonFile of jsonFiles) {
            const jsonPath = path.join(jsonDirectory, jsonFile);
            
            if (!fs.existsSync(jsonPath)) {
                console.log(`⚠️  ${jsonFile} not found, skipping...`);
                continue;
            }
            
            console.log(`\n📂 ANALYZING ${jsonFile.toUpperCase()}:`);
            console.log('='.repeat(30 + jsonFile.length));
            
            // Read JSON file
            const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            
            // Sample first 10 vouchers from JSON
            const sampleVouchers = jsonData.slice(0, 10).filter(v => v && v.Voucher_Number);
            
            console.log(`📄 JSON Sample (first 10 valid vouchers):`);
            sampleVouchers.forEach((voucher, index) => {
                console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${voucher.Voucher_Number.padEnd(12)} | JSON Date: ${voucher.Date_iso} | Party: ${voucher.Party.substring(0, 30)}`);
            });
            
            // Now check what's stored in database for these same vouchers
            console.log(`\n💾 DATABASE Comparison for same vouchers:`);
            
            const voucherNumbers = sampleVouchers.map(v => v.Voucher_Number);
            const dbVouchers = await TallyVoucher.find({
                voucherNumber: { $in: voucherNumbers }
            })
            .select('voucherNumber date party rawData.Date_iso')
            .lean();
            
            // Create a map for easy lookup
            const dbMap = {};
            dbVouchers.forEach(voucher => {
                dbMap[voucher.voucherNumber] = voucher;
            });
            
            let matchCount = 0;
            let mismatchCount = 0;
            
            sampleVouchers.forEach((jsonVoucher, index) => {
                const dbVoucher = dbMap[jsonVoucher.Voucher_Number];
                
                if (dbVoucher) {
                    const dbDate = dbVoucher.date ? dbVoucher.date.toISOString().split('T')[0] : 'NULL';
                    const jsonDate = jsonVoucher.Date_iso;
                    const rawDate = dbVoucher.rawData?.Date_iso || 'No raw';
                    
                    if (dbDate === jsonDate) {
                        console.log(`   ✅ ${jsonVoucher.Voucher_Number.padEnd(12)} | DB: ${dbDate} | JSON: ${jsonDate} | MATCH`);
                        matchCount++;
                    } else {
                        console.log(`   ❌ ${jsonVoucher.Voucher_Number.padEnd(12)} | DB: ${dbDate} | JSON: ${jsonDate} | RAW: ${rawDate} | MISMATCH!`);
                        mismatchCount++;
                    }
                } else {
                    console.log(`   ⚠️  ${jsonVoucher.Voucher_Number.padEnd(12)} | Not found in database`);
                }
            });
            
            console.log(`\n📊 Summary for ${jsonFile}: ${matchCount} matches, ${mismatchCount} mismatches`);
            
            if (mismatchCount > 0) {
                console.log(`🚨 PROBLEM DETECTED in ${jsonFile}!`);
            }
        }
        
        // Additional analysis: Check if dates are being overwritten during import
        console.log('\n🔍 CHECKING FOR DATE OVERWRITING PATTERN:');
        console.log('========================================');
        
        const recentDbVouchers = await TallyVoucher.find({})
            .sort({ _id: -1 })
            .limit(20)
            .select('voucherNumber date rawData.Date_iso uploadBatch')
            .lean();
        
        console.log('📄 Recent database vouchers with raw date comparison:');
        recentDbVouchers.forEach((voucher, index) => {
            const dbDate = voucher.date ? voucher.date.toISOString().split('T')[0] : 'NULL';
            const rawDate = voucher.rawData?.Date_iso || 'No raw data';
            const match = dbDate === rawDate ? '✅' : '❌';
            
            console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${voucher.voucherNumber.padEnd(12)} | DB: ${dbDate} | Raw: ${rawDate} | ${match}`);
        });
        
    } catch (error) {
        console.error('❌ Error comparing JSON with database:', error.message);
    }
}

// Function to identify the root cause
async function identifyRootCause() {
    console.log('\n🔍 ROOT CAUSE ANALYSIS:');
    console.log('======================');
    
    try {
        // Check if all vouchers have the same upload batch (suggesting they were processed at the same time)
        const batchDistribution = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: "$uploadBatch",
                    count: { $sum: 1 },
                    dateRange: {
                        $addToSet: {
                            $dateToString: {
                                format: "%Y-%m-%d",
                                date: "$date"
                            }
                        }
                    }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);
        
        console.log('📊 Upload Batch Analysis:');
        batchDistribution.forEach((batch, index) => {
            const uniqueDates = batch.dateRange.length;
            console.log(`   ${(index + 1).toString().padStart(2, ' ')}. Batch ${batch._id}: ${batch.count} vouchers, ${uniqueDates} unique dates`);
            if (uniqueDates < 5 && batch.count > 100) {
                console.log(`      🚨 SUSPICIOUS: Many vouchers (${batch.count}) but few dates (${uniqueDates})`);
            }
        });
        
        // Check for date conversion issues
        const dateIssueVouchers = await TallyVoucher.find({
            $and: [
                { 'rawData.Date_iso': { $exists: true } },
                { $expr: { 
                    $ne: [
                        { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        "$rawData.Date_iso"
                    ]
                }}
            ]
        })
        .limit(10)
        .select('voucherNumber date rawData.Date_iso party')
        .lean();
        
        if (dateIssueVouchers.length > 0) {
            console.log('\n🚨 FOUND VOUCHERS WITH DATE CONVERSION ISSUES:');
            dateIssueVouchers.forEach((voucher, index) => {
                const dbDate = voucher.date.toISOString().split('T')[0];
                const rawDate = voucher.rawData.Date_iso;
                console.log(`   ${(index + 1).toString().padStart(2, ' ')}. ${voucher.voucherNumber} | DB: ${dbDate} | Should be: ${rawDate} | ${voucher.party.substring(0, 30)}`);
            });
            
            console.log('\n💡 DIAGNOSIS: Date conversion during import is corrupting the dates!');
            console.log('🔧 SOLUTION: Need to fix the convertVoucherToDbFormat function or re-import with correct dates.');
        } else {
            console.log('\n✅ No date conversion issues found in sample.');
        }
        
    } catch (error) {
        console.error('❌ Error in root cause analysis:', error.message);
    }
}

// Main function
async function compareJsonDates() {
    await connectDB();
    
    try {
        await compareJsonWithDatabase();
        await identifyRootCause();
        
        console.log('\n🎯 NEXT STEPS:');
        console.log('==============');
        console.log('1. If mismatches found: Date conversion during import is the problem');
        console.log('2. If no mismatches: The JSON files might not represent the most recent data');
        console.log('3. Check import process and convertVoucherToDbFormat function');
        
    } catch (error) {
        console.error('❌ Error during comparison:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the comparison
if (require.main === module) {
    compareJsonDates()
        .then(() => {
            console.log('\n✅ JSON-Database comparison completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Comparison failed:', error);
            process.exit(1);
        });
}

module.exports = { compareJsonDates };