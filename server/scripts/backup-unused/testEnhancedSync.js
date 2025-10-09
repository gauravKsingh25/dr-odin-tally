/**
 * Test Script for Enhanced Tally Sync
 * This script tests the enhanced Tally sync functionality with your Tally server
 */

const mongoose = require('mongoose');
const EnhancedTallySync = require('./enhancedTallySync');
require('dotenv').config();

async function testTallyConnection() {
    console.log('🧪 Testing Enhanced Tally Sync\n');
    
    try {
        // Connect to MongoDB
        console.log('📦 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        // Initialize Enhanced Tally Sync
        const enhancedSync = new EnhancedTallySync();
        
        // Test 1: Basic connection test
        console.log('🔗 Test 1: Testing Tally connection...');
        try {
            const testPayload = `
            <ENVELOPE>
                <HEADER>
                    <VERSION>1</VERSION>
                    <TALLYREQUEST>Export</TALLYREQUEST>
                    <TYPE>Collection</TYPE>
                    <ID>Test Connection</ID>
                </HEADER>
                <BODY>
                    <DESC>
                        <STATICVARIABLES>
                            <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                        </STATICVARIABLES>
                        <TDL>
                            <TDLMESSAGE>
                                <COLLECTION NAME="Test Connection" ISMODIFY="No">
                                    <TYPE>Company</TYPE>
                                    <NATIVEMETHOD>NAME</NATIVEMETHOD>
                                </COLLECTION>
                            </TDLMESSAGE>
                        </TDL>
                    </DESC>
                </BODY>
            </ENVELOPE>`;
            
            const testResponse = await enhancedSync.tallyService.sendRequest(testPayload);
            console.log('✅ Tally connection successful!');
            console.log('📊 Response received from Tally\n');
        } catch (error) {
            console.error('❌ Tally connection failed:', error.message);
            process.exit(1);
        }

        // Test 2: Enhanced ledger data fetch (small sample)
        console.log('🔗 Test 2: Testing enhanced ledger data fetch...');
        try {
            const ledgerPayload = enhancedSync.getEnhancedLedgerPayload();
            const ledgerResponse = await enhancedSync.tallyService.sendRequest(ledgerPayload);
            
            const normalizedLedgers = enhancedSync.normalizeEnhancedLedgers(ledgerResponse);
            console.log(`✅ Successfully normalized ${normalizedLedgers.length} ledgers`);
            
            if (normalizedLedgers.length > 0) {
                const sampleLedger = normalizedLedgers[0];
                console.log('\n📊 Sample ledger data:');
                console.log(`   Name: ${sampleLedger.name}`);
                console.log(`   Opening Balance: ${sampleLedger.openingBalance}`);
                console.log(`   Closing Balance: ${sampleLedger.closingBalance}`);
                console.log(`   Has Bank Details: ${!!(sampleLedger.bankDetails?.bankName)}`);
                console.log(`   Has Contact Info: ${!!(sampleLedger.contact?.email)}`);
                console.log(`   Has GST Details: ${!!(sampleLedger.gstDetails?.gstin)}`);
                console.log(`   Address Count: ${sampleLedger.addressList?.length || 0}`);
            }
            console.log('');
        } catch (error) {
            console.error('❌ Enhanced ledger fetch failed:', error.message);
        }

        // Test 3: SKIP voucher data fetch (manual only)
        console.log('🔗 Test 3: SKIPPING voucher data fetch (manual only)...');
        console.log('⚠️ Voucher sync is disabled in enhanced sync - vouchers must be fetched manually');
        console.log('� Use the dashboard voucher fetch feature for manual voucher synchronization');
        console.log('');

        // Test 4: Prompt for full sync
        console.log('🎯 Test Results Summary:');
        console.log('✅ All connection tests passed!');
        console.log('\n🚀 Ready to run enhanced ledger sync (LEDGERS ONLY)?');
        console.log('This will:');
        console.log('  - Fetch ALL ledger data with comprehensive details');
        console.log('  - Extract bank details, contact info, GST details');
        console.log('  - Process opening/closing balances with enhanced extraction');
        console.log('  - Build relationships with existing vouchers');
        console.log('  - Store all ledger data in MongoDB');
        console.log('\n⚠️ NOTE: Vouchers are NOT synced automatically');
        console.log('💡 Use the dashboard manual voucher fetch for vouchers');
        console.log('\nTo run enhanced ledger sync, execute: node enhancedTallySync.js');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Run the test
testTallyConnection().catch(console.error);