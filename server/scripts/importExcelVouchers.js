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

// Helper function to get or find company ID
async function getCompanyId() {
    try {
        // Look for an existing voucher with company ID
        const existingVoucher = await TallyVoucher.findOne({
            companyId: { $exists: true, $ne: null }
        }).select('companyId');
        
        if (existingVoucher) {
            console.log(`🏢 Using existing company ID: ${existingVoucher.companyId}`);
            return existingVoucher.companyId;
        } else {
            console.log('⚠️  No existing company ID found - vouchers may not show up without it');
            return null;
        }
    } catch (error) {
        console.error('Error finding company ID:', error.message);
        return null;
    }
}

// Helper function to convert JSON voucher format to MongoDB document format
function convertVoucherToDbFormat(voucher, companyId = null) {
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
        uploadSource: 'Excel Import Script',
        uploadDate: new Date(),
        uploadBatch: Math.floor(Date.now() / 1000), // Use timestamp as batch ID
        
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

// Function to import vouchers from a single JSON file
async function importVouchersFromFile(filePath, batchName, companyId = null) {
    console.log(`\n📄 Processing file: ${path.basename(filePath)}`);
    
    try {
        // Read JSON file
        const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`📊 Found ${jsonData.length} vouchers in file`);
        
        let successCount = 0;
        let duplicateCount = 0;
        let errorCount = 0;
        const errors = [];
        
        // Process each voucher
        for (let i = 0; i < jsonData.length; i++) {
            const voucher = jsonData[i];
            
            // Skip empty objects
            if (!voucher || Object.keys(voucher).length === 0) {
                continue;
            }
            
            try {
                // Check if voucher already exists
                const existingVoucher = await TallyVoucher.findOne({
                    voucherNumber: voucher.Voucher_Number
                });
                
                if (existingVoucher) {
                    duplicateCount++;
                    console.log(`⚠️  Duplicate voucher skipped: ${voucher.Voucher_Number}`);
                    continue;
                }
                
                // Convert to DB format with company ID
                const dbVoucher = convertVoucherToDbFormat(voucher, companyId);
                dbVoucher.uploadFileName = batchName;
                
                // Create new voucher document
                const newVoucher = new TallyVoucher(dbVoucher);
                await newVoucher.save();
                
                successCount++;
                
                if (successCount % 100 === 0) {
                    console.log(`   ✅ Processed ${successCount} vouchers...`);
                }
                
            } catch (error) {
                errorCount++;
                const errorMsg = `Voucher ${voucher.Voucher_Number || i}: ${error.message}`;
                errors.push(errorMsg);
                
                if (error.code === 11000) {
                    duplicateCount++;
                    console.log(`⚠️  Duplicate key error: ${voucher.Voucher_Number}`);
                } else {
                    console.log(`❌ Error processing voucher ${voucher.Voucher_Number || i}: ${error.message}`);
                }
            }
        }
        
        console.log(`\n📋 ${batchName} Import Summary:`);
        console.log(`   ✅ Successfully imported: ${successCount}`);
        console.log(`   ⚠️  Duplicates skipped: ${duplicateCount}`);
        console.log(`   ❌ Errors encountered: ${errorCount}`);
        
        if (errors.length > 0 && errors.length <= 10) {
            console.log('\n🔍 Error details:');
            errors.forEach(error => console.log(`   - ${error}`));
        } else if (errors.length > 10) {
            console.log(`\n🔍 Showing first 10 errors (${errors.length} total):`);
            errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
        }
        
        return {
            success: successCount,
            duplicates: duplicateCount,
            errors: errorCount
        };
        
    } catch (error) {
        console.error(`❌ Failed to process file ${filePath}:`, error.message);
        return {
            success: 0,
            duplicates: 0,
            errors: 1
        };
    }
}

// Main import function
async function importAllExcelVouchers() {
    await connectDB();
    
    console.log('🚀 Starting Excel vouchers import...');
    console.log('=====================================');
    
    // Get company ID for all imports
    const companyId = await getCompanyId();
    if (!companyId) {
        console.log('⚠️  WARNING: No company ID found - vouchers may not appear in the system');
        console.log('   Consider setting up a company ID first');
    }
    
    const convertedDir = path.join(__dirname, 'converted');
    const excelFiles = [
        { file: 'excel1.json', name: 'Excel1-April-June-2024' },
        { file: 'excel2.json', name: 'Excel2-Jan-March-2024' },
        { file: 'excel3.json', name: 'Excel3-July-Sep-2024' },
        { file: 'excel4.json', name: 'Excel4-Oct-Dec-2024' }
    ];
    
    let totalSuccess = 0;
    let totalDuplicates = 0;
    let totalErrors = 0;
    
    // Import each file
    for (const excelFile of excelFiles) {
        const filePath = path.join(convertedDir, excelFile.file);
        
        if (!fs.existsSync(filePath)) {
            console.log(`❌ File not found: ${excelFile.file}`);
            continue;
        }
        
        const result = await importVouchersFromFile(filePath, excelFile.name, companyId);
        totalSuccess += result.success;
        totalDuplicates += result.duplicates;
        totalErrors += result.errors;
    }
    
    console.log('\n🎉 FINAL IMPORT SUMMARY');
    console.log('=====================================');
    console.log(`✅ Total vouchers imported: ${totalSuccess}`);
    console.log(`⚠️  Total duplicates skipped: ${totalDuplicates}`);
    console.log(`❌ Total errors: ${totalErrors}`);
    
    // Get some statistics
    try {
        const totalVouchers = await TallyVoucher.countDocuments();
        const voucherTypes = await TallyVoucher.aggregate([
            { $group: { _id: '$voucherType', count: { $sum: 1 } } }
        ]);
        
        console.log(`\n📊 Database Statistics:`);
        console.log(`   Total vouchers in database: ${totalVouchers}`);
        console.log(`   Voucher types:`);
        voucherTypes.forEach(type => {
            console.log(`     - ${type._id}: ${type.count}`);
        });
        
    } catch (error) {
        console.error('Error getting statistics:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the import if this script is called directly
if (require.main === module) {
    importAllExcelVouchers()
        .then(() => {
            console.log('\n✅ Import process completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Import process failed:', error);
            process.exit(1);
        });
}

module.exports = {
    importAllExcelVouchers,
    importVouchersFromFile,
    convertVoucherToDbFormat
};