/**
 * Manual Voucher Sync Script
 * This script is for manual voucher synchronization only
 * Use this when you specifically need to sync vouchers from Tally
 */

const mongoose = require('mongoose');
const EnhancedTallySync = require('./enhancedTallySync');

async function manualVoucherSync() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI || 'mongodb+srv://gs8683921:123qwe@cluster0.m94ov.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Initialize Enhanced Tally Sync
        const enhancedSync = new EnhancedTallySync();
        
        // Get command line arguments for date range
        const args = process.argv.slice(2);
        let fromDate = null;
        let toDate = null;
        let maxDays = 30;
        
        // Parse arguments: node manualVoucherSync.js [fromDate] [toDate] [maxDays]
        if (args.length >= 1) {
            fromDate = args[0]; // Format: YYYYMMDD
        }
        if (args.length >= 2) {
            toDate = args[1]; // Format: YYYYMMDD
        }
        if (args.length >= 3) {
            maxDays = parseInt(args[2]) || 30;
        }
        
        console.log('\n📄 Manual Voucher Sync Parameters:');
        console.log(`   From Date: ${fromDate || 'Auto (last ' + maxDays + ' days)'}`);
        console.log(`   To Date: ${toDate || 'Auto (today)'}`);
        console.log(`   Max Days: ${maxDays}`);
        
        // Confirmation prompt
        console.log('\n⚠️ WARNING: This will sync vouchers from Tally to MongoDB');
        console.log('   This may take significant time for large date ranges');
        console.log('   Proceed with manual voucher sync? (Press Ctrl+C to cancel)\n');
        
        // Wait 5 seconds before proceeding
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Run manual voucher sync
        const results = await enhancedSync.syncVouchersManually(fromDate, toDate, maxDays);
        
        console.log('\n🎉 Manual voucher sync completed!');
        
    } catch (error) {
        console.error('❌ Manual voucher sync failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Usage examples
if (require.main === module) {
    console.log('📋 Manual Voucher Sync Usage Examples:');
    console.log('   node manualVoucherSync.js                    # Last 30 days');
    console.log('   node manualVoucherSync.js 20241001 20241031  # October 2024');
    console.log('   node manualVoucherSync.js null null 7       # Last 7 days');
    console.log('');
    
    manualVoucherSync().catch(console.error);
}

module.exports = { manualVoucherSync };