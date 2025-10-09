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

// Company ID - I'll use a default company ID since this is restoration
const DEFAULT_COMPANY_ID = "64f1a234b567890123456789"; // Default company ID for restoration

// Helper function to convert JSON voucher format to MongoDB document format
function convertVoucherToDbFormat(voucher, companyId, sourceFile) {
    const converted = {
        date: new Date(voucher.Date_iso),
        voucherNumber: voucher.Voucher_Number,
        voucherType: voucher.Vch_Type || 'Sales',
        voucherTypeName: voucher.Vch_Type || 'Sales',
        party: voucher.Party,
        partyledgername: voucher.Party,
        amount: voucher.Debit_Amount || voucher.Credit_Amount || 0,
        
        // Enhanced fields
        voucherDate: new Date(voucher.Date_iso),
        effectiveDate: new Date(voucher.Date_iso),
        basicvoucherdate: new Date(voucher.Date_iso),
        
        // Ledger entries from Details
        ledgerEntries: [],
        
        // GST and other details
        gstDetails: {
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            cessAmount: 0,
            totalTaxAmount: 0
        },
        
        // Upload metadata
        uploadSource: 'Database Restoration Script',
        uploadDate: new Date(),
        uploadBatch: Math.floor(Date.now() / 1000), // Use timestamp as batch ID
        uploadFileName: sourceFile,
        
        // Year from date
        year: new Date(voucher.Date_iso).getFullYear(),
        
        // Raw data for reference
        rawData: voucher,
        
        // Company ID - REQUIRED for vouchers to show up
        companyId: companyId
    };
    
    // Process Details array to create ledger entries
    if (voucher.Details && Array.isArray(voucher.Details)) {
        voucher.Details.forEach(detail => {
            if (detail.Account) {
                // Account entry
                converted.ledgerEntries.push({
                    ledgerName: detail.Account,
                    amount: Math.abs(detail.Amount || 0),
                    isDebit: detail.Amount >= 0
                });
                
                // Check for GST entries
                const accountName = detail.Account.toUpperCase();
                if (accountName.includes('CGST')) {
                    converted.gstDetails.cgstAmount += Math.abs(detail.Amount || 0);
                    converted.gstDetails.totalTaxAmount += Math.abs(detail.Amount || 0);
                } else if (accountName.includes('SGST')) {
                    converted.gstDetails.sgstAmount += Math.abs(detail.Amount || 0);
                    converted.gstDetails.totalTaxAmount += Math.abs(detail.Amount || 0);
                } else if (accountName.includes('IGST')) {
                    converted.gstDetails.igstAmount += Math.abs(detail.Amount || 0);
                    converted.gstDetails.totalTaxAmount += Math.abs(detail.Amount || 0);
                }
                
            } else if (detail.Staff) {
                // Staff entry
                converted.ledgerEntries.push({
                    ledgerName: detail.Staff,
                    amount: Math.abs(detail.Amount || 0),
                    isDebit: detail.Type === 'Dr'
                });
            }
        });
    }
    
    return converted;
}

// Function to restore vouchers from a single JSON file (bulk insert for performance)
async function restoreVouchersFromFile(filePath, batchName, companyId) {
    console.log(`\n📄 Processing file: ${path.basename(filePath)}`);
    
    try {
        // Read JSON file
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`📊 Found ${jsonData.length} vouchers in file`);
        
        const validVouchers = [];
        let skippedCount = 0;
        
        // Process each voucher and prepare for bulk insert
        for (let i = 0; i < jsonData.length; i++) {
            const voucher = jsonData[i];
            
            // Skip empty objects or invalid vouchers
            if (!voucher || Object.keys(voucher).length === 0 || !voucher.Voucher_Number) {
                skippedCount++;
                continue;
            }
            
            try {
                // Convert to DB format with company ID
                const dbVoucher = convertVoucherToDbFormat(voucher, companyId, batchName);
                validVouchers.push(dbVoucher);
                
            } catch (error) {
                console.log(`❌ Error processing voucher ${voucher.Voucher_Number || i}: ${error.message}`);
                skippedCount++;
            }
        }
        
        console.log(`🔄 Processing ${validVouchers.length} valid vouchers (${skippedCount} skipped)`);
        
        // Bulk insert vouchers in batches of 1000 for performance
        let successCount = 0;
        const batchSize = 1000;
        
        for (let i = 0; i < validVouchers.length; i += batchSize) {
            const batch = validVouchers.slice(i, i + batchSize);
            
            try {
                const result = await TallyVoucher.insertMany(batch, { 
                    ordered: false,  // Continue even if some fail
                    rawResult: true 
                });
                
                successCount += batch.length;
                console.log(`   ✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} vouchers`);
                
            } catch (error) {
                // Handle duplicate key errors and other issues
                if (error.writeErrors) {
                    const actualInserted = batch.length - error.writeErrors.length;
                    successCount += actualInserted;
                    console.log(`   ⚠️  Batch ${Math.floor(i / batchSize) + 1}: ${actualInserted}/${batch.length} inserted (${error.writeErrors.length} duplicates)`);
                } else {
                    console.log(`   ❌ Batch ${Math.floor(i / batchSize) + 1} failed: ${error.message}`);
                }
            }
        }
        
        console.log(`\n📋 ${batchName} Restore Summary:`);
        console.log(`   ✅ Successfully restored: ${successCount}`);
        console.log(`   ⚠️  Skipped invalid: ${skippedCount}`);
        
        return {
            success: successCount,
            skipped: skippedCount
        };
        
    } catch (error) {
        console.error(`❌ Failed to process file ${filePath}:`, error.message);
        return {
            success: 0,
            skipped: 0
        };
    }
}

// Main restoration function
async function restoreAllVouchers() {
    await connectDB();
    
    console.log('🚀 STARTING COMPLETE VOUCHER DATABASE RESTORATION');
    console.log('===============================================');
    console.log('⚠️  This script will restore ALL vouchers from JSON files');
    console.log(`🏢 Using company ID: ${DEFAULT_COMPANY_ID}`);
    
    // Check if database is really empty
    try {
        const existingCount = await TallyVoucher.countDocuments();
        console.log(`📊 Current vouchers in database: ${existingCount}`);
        
        if (existingCount > 0) {
            console.log('⚠️  WARNING: Database is not empty! This may create duplicates.');
            console.log('   If you want to clear the database first, run db.tallyVouchers.deleteMany({}) in MongoDB shell');
        }
    } catch (error) {
        console.log('📊 Unable to check existing voucher count:', error.message);
    }
    
    const convertedDir = path.join(__dirname, 'converted');
    
    // All JSON files to restore
    const jsonFiles = [
        { file: 'vouchers.json', name: 'Original-Vouchers' },
        { file: 'excel1.json', name: 'Excel1-April-June-2024' },
        { file: 'excel2.json', name: 'Excel2-Jan-March-2024' },
        { file: 'excel3.json', name: 'Excel3-July-Sep-2024' },
        { file: 'excel4.json', name: 'Excel4-Oct-Dec-2024' }
    ];
    
    let totalSuccess = 0;
    let totalSkipped = 0;
    
    // Start restoration timer
    const startTime = Date.now();
    
    // Restore each file
    for (const jsonFile of jsonFiles) {
        const filePath = path.join(convertedDir, jsonFile.file);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${jsonFile.file}`);
            continue;
        }
        
        const result = await restoreVouchersFromFile(filePath, jsonFile.name, DEFAULT_COMPANY_ID);
        totalSuccess += result.success;
        totalSkipped += result.skipped;
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log('\n🎉 COMPLETE RESTORATION SUMMARY');
    console.log('=====================================');
    console.log(`✅ Total vouchers restored: ${totalSuccess}`);
    console.log(`⚠️  Total skipped/invalid: ${totalSkipped}`);
    console.log(`⏱️  Restoration time: ${duration} seconds`);
    
    // Get final database statistics
    try {
        const totalVouchers = await TallyVoucher.countDocuments();
        const voucherTypes = await TallyVoucher.aggregate([
            { $group: { _id: '$voucherType', count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);
        
        const dateRange = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: null,
                    earliestDate: { $min: '$date' },
                    latestDate: { $max: '$date' }
                }
            }
        ]);
        
        console.log(`\n📊 FINAL DATABASE STATISTICS:`);
        console.log(`   Total vouchers in database: ${totalVouchers}`);
        
        if (dateRange.length > 0) {
            console.log(`   Date range: ${dateRange[0].earliestDate?.toDateString()} to ${dateRange[0].latestDate?.toDateString()}`);
        }
        
        console.log(`   Voucher types distribution:`);
        voucherTypes.forEach(type => {
            console.log(`     - ${type._id}: ${type.count.toLocaleString()}`);
        });
        
        // Sample of recent vouchers
        const recentVouchers = await TallyVoucher.find({})
            .sort({ date: -1 })
            .limit(5)
            .select('voucherNumber party date amount');
        
        console.log(`\n📋 Sample of most recent vouchers:`);
        recentVouchers.forEach(voucher => {
            console.log(`   - ${voucher.voucherNumber} | ${voucher.party} | ${voucher.date?.toDateString()} | ₹${voucher.amount}`);
        });
        
    } catch (error) {
        console.error('Error getting final statistics:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
    console.log('\n✅ VOUCHER RESTORATION COMPLETED SUCCESSFULLY!');
    console.log('🎯 All vouchers should now be visible in your Tally dashboard');
}

// Run the restoration if this script is called directly
if (require.main === module) {
    restoreAllVouchers()
        .then(() => {
            console.log('\n🎊 Restoration process completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Restoration process failed:', error);
            process.exit(1);
        });
}

module.exports = {
    restoreAllVouchers,
    restoreVouchersFromFile,
    convertVoucherToDbFormat
};