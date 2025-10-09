const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

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

// Function to fix dates for vouchers from a specific JSON file
async function fixDatesFromFile(jsonFilePath, sourceFileName) {
    console.log(`\n📄 Processing ${sourceFileName}...`);
    
    try {
        // Read the JSON file
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));
        console.log(`📊 Found ${jsonData.length} vouchers in ${sourceFileName}`);
        
        let fixedCount = 0;
        let notFoundCount = 0;
        let errorCount = 0;
        
        // Process vouchers in batches for better performance
        const batchSize = 100;
        for (let i = 0; i < jsonData.length; i += batchSize) {
            const batch = jsonData.slice(i, i + batchSize);
            
            // Prepare bulk operations
            const bulkOps = [];
            
            for (const voucher of batch) {
                // Skip empty vouchers
                if (!voucher || !voucher.Voucher_Number || !voucher.Date_iso) {
                    continue;
                }
                
                try {
                    // Parse the correct date from JSON
                    const correctDate = new Date(voucher.Date_iso);
                    
                    // Validate the date
                    if (isNaN(correctDate.getTime())) {
                        console.log(`⚠️  Invalid date for voucher ${voucher.Voucher_Number}: ${voucher.Date_iso}`);
                        errorCount++;
                        continue;
                    }
                    
                    // Add to bulk operations
                    bulkOps.push({
                        updateOne: {
                            filter: { voucherNumber: voucher.Voucher_Number },
                            update: {
                                $set: {
                                    date: correctDate,
                                    voucherDate: correctDate,
                                    effectiveDate: correctDate,
                                    basicvoucherdate: correctDate,
                                    year: correctDate.getFullYear(),
                                    dateFixed: true,
                                    dateFixedAt: new Date(),
                                    dateFixedFrom: sourceFileName
                                }
                            }
                        }
                    });
                    
                } catch (error) {
                    console.log(`❌ Error processing voucher ${voucher.Voucher_Number}: ${error.message}`);
                    errorCount++;
                }
            }
            
            // Execute bulk operations
            if (bulkOps.length > 0) {
                try {
                    const result = await TallyVoucher.bulkWrite(bulkOps);
                    fixedCount += result.modifiedCount;
                    notFoundCount += (bulkOps.length - result.modifiedCount);
                    
                    if ((i + batchSize) % 1000 === 0 || i + batchSize >= jsonData.length) {
                        console.log(`   ✅ Processed ${Math.min(i + batchSize, jsonData.length)}/${jsonData.length} vouchers...`);
                    }
                    
                } catch (error) {
                    console.log(`❌ Batch update failed: ${error.message}`);
                    errorCount += bulkOps.length;
                }
            }
        }
        
        console.log(`\n📋 ${sourceFileName} Date Fix Summary:`);
        console.log(`   ✅ Dates fixed: ${fixedCount}`);
        console.log(`   ❓ Not found in DB: ${notFoundCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        
        return {
            fixed: fixedCount,
            notFound: notFoundCount,
            errors: errorCount
        };
        
    } catch (error) {
        console.error(`❌ Failed to process ${sourceFileName}:`, error.message);
        return {
            fixed: 0,
            notFound: 0,
            errors: 1
        };
    }
}

// Main date fixing function
async function fixAllVoucherDates() {
    await connectDB();
    
    console.log('🚀 FIXING ALL VOUCHER DATES FROM JSON FILES');
    console.log('==========================================');
    
    // Check current date distribution before fix
    try {
        const dateDistribution = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $limit: 10 }
        ]);
        
        console.log(`\n📊 Current date distribution (first 10):`);
        dateDistribution.forEach(item => {
            console.log(`   ${item._id}: ${item.count} vouchers`);
        });
    } catch (error) {
        console.log('Unable to get current date distribution:', error.message);
    }
    
    const convertedDir = path.join(__dirname, 'converted');
    const jsonFiles = [
        { file: 'vouchers.json', name: 'Original-Vouchers' },
        { file: 'excel1.json', name: 'Excel1-April-June-2024' },
        { file: 'excel2.json', name: 'Excel2-Jan-March-2024' },
        { file: 'excel3.json', name: 'Excel3-July-Sep-2024' },
        { file: 'excel4.json', name: 'Excel4-Oct-Dec-2024' }
    ];
    
    let totalFixed = 0;
    let totalNotFound = 0;
    let totalErrors = 0;
    
    const startTime = Date.now();
    
    // Fix dates from each file
    for (const jsonFile of jsonFiles) {
        const filePath = path.join(convertedDir, jsonFile.file);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${jsonFile.file}`);
            continue;
        }
        
        const result = await fixDatesFromFile(filePath, jsonFile.name);
        totalFixed += result.fixed;
        totalNotFound += result.notFound;
        totalErrors += result.errors;
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 COMPLETE DATE FIX SUMMARY');
    console.log('============================');
    console.log(`✅ Total dates fixed: ${totalFixed}`);
    console.log(`❓ Total not found: ${totalNotFound}`);
    console.log(`❌ Total errors: ${totalErrors}`);
    console.log(`⏱️  Fix time: ${duration} seconds`);
    
    // Check final date distribution after fix
    try {
        const finalDateDistribution = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }, // Recent first
            { $limit: 15 }
        ]);
        
        console.log(`\n📊 FINAL DATE DISTRIBUTION (most recent 15):`);
        finalDateDistribution.forEach(item => {
            console.log(`   ${item._id}: ${item.count} vouchers`);
        });
        
        // Sample of vouchers with different dates
        const sampleVouchers = await TallyVoucher.find({})
            .sort({ date: -1 })
            .limit(8)
            .select('voucherNumber party date year dateFixedFrom');
        
        console.log(`\n📋 Sample vouchers with fixed dates:`);
        sampleVouchers.forEach(voucher => {
            console.log(`   ${voucher.voucherNumber} | ${voucher.party} | ${voucher.date?.toDateString()} | ${voucher.year} | From: ${voucher.dateFixedFrom || 'Original'}`);
        });
        
    } catch (error) {
        console.error('Error getting final statistics:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
    console.log('\n✅ DATE FIX COMPLETED SUCCESSFULLY!');
    console.log('🎯 All vouchers should now have correct dates in Tally dashboard');
}

// Run the date fix if this script is called directly
if (require.main === module) {
    fixAllVoucherDates()
        .then(() => {
            console.log('\n🎊 Date fix process completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Date fix process failed:', error);
            process.exit(1);
        });
}

module.exports = { fixAllVoucherDates };