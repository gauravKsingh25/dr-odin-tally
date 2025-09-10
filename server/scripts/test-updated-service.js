const TallyService = require('../services/tallyService');

async function testUpdatedService() {
    console.log('🔧 Testing Updated TallyService with working XML formats...');
    
    const tallyService = new TallyService();
    
    try {
        // Test each data type
        console.log('\n📊 Testing Companies...');
        const companies = await tallyService.fetchCompanyInfo();
        console.log(`✅ Companies: ${companies ? 'fetched' : 'no data'}`);
        console.log('Companies response type:', typeof companies);
        console.log('Companies structure:', companies);

        console.log('\n📋 Testing Ledgers...');
        const ledgers = await tallyService.fetchLedgers();
        console.log(`✅ Ledgers: ${ledgers ? 'fetched' : 'no data'}`);
        console.log('Ledgers response type:', typeof ledgers);

        console.log('\n📦 Testing Stock Items...');
        const stockItems = await tallyService.fetchStockItems();
        console.log(`✅ Stock Items: ${stockItems ? 'fetched' : 'no data'}`);
        console.log('Stock Items response type:', typeof stockItems);

        console.log('\n📄 Testing Voucher Types...');
        const vouchers = await tallyService.fetchVouchers();
        console.log(`✅ Voucher Types: ${vouchers ? 'fetched' : 'no data'}`);
        console.log('Vouchers response type:', typeof vouchers);

        console.log('\n🎉 All tests completed!');
        console.log('Raw fetch results - check if we get actual data vs parsed');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testUpdatedService();
