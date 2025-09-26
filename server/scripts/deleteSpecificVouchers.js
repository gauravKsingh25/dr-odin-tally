#!/usr/bin/env node

/**
 * Script to find and delete specific voucher numbers from the database
 * Usage: node scripts/deleteSpecificVouchers.js
 * 
 * This script will:
 * 1. Search for the specified voucher numbers
 * 2. Display details of found vouchers
 * 3. Delete them if confirmed
 */

const mongoose = require('mongoose');
const readline = require('readline');

// Import the TallyVoucher model
const TallyVoucher = require('../models/tallyVoucher.model');

// Database connection
const DB_URI = process.env.DB_URI || 'mongodb+srv://gs8683921:123qwe@cluster0.m94ov.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';


// Specific voucher numbers to delete (from the provided image)
const TARGET_VOUCHERS = [
    'SAL001',
    'PUR001', 
    'REC001',
    'PAY001'
];

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function connectToDatabase() {
    try {
        await mongoose.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        process.exit(1);
    }
}

async function findVouchers() {
    console.log('\n🔍 Searching for target vouchers...');
    console.log('Target voucher numbers:', TARGET_VOUCHERS.join(', '));
    
    try {
        const foundVouchers = await TallyVoucher.find({
            voucherNumber: { $in: TARGET_VOUCHERS }
        }).sort({ voucherNumber: 1 });

        console.log(`\n📊 Found ${foundVouchers.length} voucher(s) in database:`);
        
        if (foundVouchers.length === 0) {
            console.log('✅ No vouchers found with the specified numbers.');
            return [];
        }

        // Display found vouchers in a table format
        console.log('\n┌─────────────┬──────────────┬─────────────┬──────────────┬─────────────┬─────────────────────┐');
        console.log('│ Voucher No. │ Date         │ Type        │ Party        │ Amount      │ Company ID          │');
        console.log('├─────────────┼──────────────┼─────────────┼──────────────┼─────────────┼─────────────────────┤');
        
        foundVouchers.forEach(voucher => {
            const date = voucher.date ? new Date(voucher.date).toLocaleDateString('en-GB') : 'N/A';
            const voucherNum = (voucher.voucherNumber || 'N/A').padEnd(11);
            const voucherDate = date.padEnd(12);
            const voucherType = (voucher.voucherType || 'N/A').padEnd(11);
            const party = (voucher.party || 'N/A').substring(0, 12).padEnd(12);
            const amount = (voucher.amount ? `₹${voucher.amount}` : 'N/A').padEnd(11);
            const companyId = voucher.companyId ? voucher.companyId.toString().substring(0, 19) : 'N/A';
            
            console.log(`│ ${voucherNum} │ ${voucherDate} │ ${voucherType} │ ${party} │ ${amount} │ ${companyId} │`);
        });
        
        console.log('└─────────────┴──────────────┴─────────────┴──────────────┴─────────────┴─────────────────────┘');
        
        return foundVouchers;
        
    } catch (error) {
        console.error('❌ Error searching vouchers:', error.message);
        return [];
    }
}

async function confirmDeletion() {
    return new Promise((resolve) => {
        rl.question('\n⚠️  Are you sure you want to DELETE these vouchers? This action cannot be undone! (yes/no): ', (answer) => {
            resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
        });
    });
}

async function deleteVouchers(vouchers) {
    console.log('\n🗑️  Starting deletion process...');
    
    try {
        const voucherIds = vouchers.map(v => v._id);
        const result = await TallyVoucher.deleteMany({
            _id: { $in: voucherIds }
        });
        
        console.log(`✅ Successfully deleted ${result.deletedCount} voucher(s)`);
        
        if (result.deletedCount > 0) {
            console.log('\nDeleted vouchers:');
            vouchers.forEach(voucher => {
                console.log(`  - ${voucher.voucherNumber} (${voucher.voucherType || 'Unknown Type'})`);
            });
        }
        
        return result.deletedCount;
        
    } catch (error) {
        console.error('❌ Error deleting vouchers:', error.message);
        return 0;
    }
}

async function main() {
    console.log('🚀 Specific Voucher Deletion Script');
    console.log('=====================================');
    
    try {
        // Connect to database
        await connectToDatabase();
        
        // Find target vouchers
        const foundVouchers = await findVouchers();
        
        if (foundVouchers.length === 0) {
            console.log('\n✅ No action needed - target vouchers not found in database.');
            process.exit(0);
        }
        
        // Get user confirmation
        const confirmed = await confirmDeletion();
        
        if (!confirmed) {
            console.log('\n❌ Deletion cancelled by user.');
            process.exit(0);
        }
        
        // Delete vouchers
        const deletedCount = await deleteVouchers(foundVouchers);
        
        if (deletedCount > 0) {
            console.log(`\n🎉 Operation completed successfully! Deleted ${deletedCount} voucher(s).`);
        } else {
            console.log('\n⚠️  No vouchers were deleted.');
        }
        
    } catch (error) {
        console.error('\n💥 Script execution failed:', error.message);
        process.exit(1);
    } finally {
        // Close readline interface and database connection
        rl.close();
        await mongoose.connection.close();
        console.log('📤 Database connection closed.');
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Script interrupted by user');
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
});

// Run the main function
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = { TARGET_VOUCHERS, findVouchers, deleteVouchers };