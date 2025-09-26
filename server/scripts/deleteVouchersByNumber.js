#!/usr/bin/env node

/**
 * Flexible Voucher Deletion Script
 * Usage: 
 *   node scripts/deleteVouchersByNumber.js SAL001 PUR001 REC001 PAY001
 *   node scripts/deleteVouchersByNumber.js --interactive
 * 
 * This script allows you to:
 * 1. Specify voucher numbers as command line arguments
 * 2. Use interactive mode to enter voucher numbers
 * 3. Search and display voucher details before deletion
 * 4. Safely delete vouchers with confirmation
 */

const mongoose = require('mongoose');
const readline = require('readline');

// Import the TallyVoucher model
const TallyVoucher = require('../models/tallyVoucher.model');

// Database connection
const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/your_database_name';

// Create readline interface
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

async function getVoucherNumbers() {
    const args = process.argv.slice(2);
    
    // Check if interactive mode
    if (args.includes('--interactive') || args.includes('-i')) {
        return await getVouchersInteractively();
    }
    
    // Check if voucher numbers provided as arguments
    if (args.length > 0) {
        const voucherNumbers = args.filter(arg => !arg.startsWith('--'));
        if (voucherNumbers.length > 0) {
            return voucherNumbers;
        }
    }
    
    // Default interactive mode if no arguments
    return await getVouchersInteractively();
}

async function getVouchersInteractively() {
    return new Promise((resolve) => {
        console.log('\n📝 Interactive Mode: Enter voucher numbers to delete');
        console.log('💡 Tip: Enter voucher numbers separated by spaces or commas');
        console.log('📝 Example: SAL001 PUR001 REC001 PAY001');
        
        rl.question('\n🔢 Enter voucher numbers: ', (input) => {
            const voucherNumbers = input
                .split(/[\s,]+/)
                .map(v => v.trim())
                .filter(v => v.length > 0);
            resolve(voucherNumbers);
        });
    });
}

async function findVouchersByNumbers(voucherNumbers) {
    console.log('\n🔍 Searching for vouchers...');
    console.log('Target voucher numbers:', voucherNumbers.join(', '));
    
    try {
        const foundVouchers = await TallyVoucher.find({
            voucherNumber: { $in: voucherNumbers.map(v => v.toUpperCase()) }
        }).sort({ voucherNumber: 1, date: -1 });

        console.log(`\n📊 Search Results: ${foundVouchers.length} voucher(s) found`);
        
        if (foundVouchers.length === 0) {
            console.log('✅ No vouchers found with the specified numbers.');
            return { found: [], notFound: voucherNumbers };
        }

        // Identify which vouchers were found and not found
        const foundNumbers = foundVouchers.map(v => v.voucherNumber.toUpperCase());
        const notFound = voucherNumbers.filter(vn => 
            !foundNumbers.includes(vn.toUpperCase())
        );

        // Display found vouchers
        console.log('\n📋 Found Vouchers:');
        console.log('┌─────────────┬──────────────┬─────────────┬──────────────┬─────────────┬─────────────────────┐');
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
        
        if (notFound.length > 0) {
            console.log(`\n⚠️  Not Found: ${notFound.join(', ')}`);
        }
        
        return { found: foundVouchers, notFound };
        
    } catch (error) {
        console.error('❌ Error searching vouchers:', error.message);
        return { found: [], notFound: voucherNumbers };
    }
}

async function confirmDeletion(foundVouchers) {
    if (foundVouchers.length === 0) return false;
    
    return new Promise((resolve) => {
        console.log(`\n⚠️  DANGER ZONE: You are about to delete ${foundVouchers.length} voucher(s)`);
        console.log('🚨 This action is IRREVERSIBLE and will permanently remove these vouchers from the database!');
        
        rl.question('\n❓ Type "DELETE" to confirm deletion (anything else will cancel): ', (answer) => {
            resolve(answer === 'DELETE');
        });
    });
}

async function deleteVouchers(vouchers) {
    console.log('\n🗑️  Initiating deletion process...');
    
    try {
        const voucherIds = vouchers.map(v => v._id);
        const voucherNumbers = vouchers.map(v => v.voucherNumber);
        
        const result = await TallyVoucher.deleteMany({
            _id: { $in: voucherIds }
        });
        
        console.log(`\n✅ Deletion completed successfully!`);
        console.log(`📊 Deleted ${result.deletedCount} voucher(s) from database`);
        
        if (result.deletedCount > 0) {
            console.log('\n📋 Deleted vouchers:');
            vouchers.forEach((voucher, index) => {
                const date = voucher.date ? new Date(voucher.date).toLocaleDateString('en-GB') : 'Unknown';
                console.log(`   ${index + 1}. ${voucher.voucherNumber} (${voucher.voucherType || 'Unknown Type'}, ${date})`);
            });
        }
        
        return result.deletedCount;
        
    } catch (error) {
        console.error('❌ Deletion failed:', error.message);
        return 0;
    }
}

async function main() {
    console.log('🗑️  Voucher Deletion Utility');
    console.log('============================');
    
    try {
        // Connect to database
        await connectToDatabase();
        
        // Get voucher numbers to delete
        const voucherNumbers = await getVoucherNumbers();
        
        if (voucherNumbers.length === 0) {
            console.log('❌ No voucher numbers provided. Exiting...');
            process.exit(1);
        }
        
        // Find vouchers
        const { found: foundVouchers, notFound } = await findVouchersByNumbers(voucherNumbers);
        
        if (foundVouchers.length === 0) {
            console.log('\n✅ No vouchers to delete. Operation completed.');
            process.exit(0);
        }
        
        // Get confirmation
        const confirmed = await confirmDeletion(foundVouchers);
        
        if (!confirmed) {
            console.log('\n❌ Deletion cancelled by user. No vouchers were deleted.');
            process.exit(0);
        }
        
        // Delete vouchers
        const deletedCount = await deleteVouchers(foundVouchers);
        
        if (deletedCount > 0) {
            console.log(`\n🎉 Mission accomplished! ${deletedCount} voucher(s) permanently deleted.`);
        } else {
            console.log('\n⚠️  Unexpected: No vouchers were deleted despite confirmation.');
        }
        
        // Final summary
        console.log('\n📊 Final Summary:');
        console.log(`   ✅ Successfully deleted: ${deletedCount}`);
        console.log(`   ❌ Not found: ${notFound.length}`);
        
    } catch (error) {
        console.error('\n💥 Script execution failed:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1);
    } finally {
        rl.close();
        await mongoose.connection.close();
        console.log('\n📤 Database connection closed. Goodbye!');
    }
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
    console.log('\n\n⚠️  Script interrupted by user (Ctrl+C)');
    rl.close();
    if (mongoose.connection.readyState === 1) {
        await mongoose.connection.close();
    }
    process.exit(0);
});

// Display help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🗑️  Voucher Deletion Utility - Help
=====================================

Usage:
  node scripts/deleteVouchersByNumber.js [voucher_numbers...]
  node scripts/deleteVouchersByNumber.js --interactive
  node scripts/deleteVouchersByNumber.js --help

Examples:
  # Delete specific vouchers
  node scripts/deleteVouchersByNumber.js SAL001 PUR001 REC001 PAY001
  
  # Interactive mode
  node scripts/deleteVouchersByNumber.js --interactive
  
  # Show this help
  node scripts/deleteVouchersByNumber.js --help

Features:
  ✅ Safe deletion with confirmation
  ✅ Detailed voucher information display
  ✅ Handles multiple vouchers at once
  ✅ Shows which vouchers were not found
  ✅ Interactive and command-line modes

⚠️  WARNING: Deletion is irreversible!
    `);
    process.exit(0);
}

// Run the main function
if (require.main === module) {
    main().catch(error => {
        console.error('💥 Unhandled error:', error);
        rl.close();
        process.exit(1);
    });
}