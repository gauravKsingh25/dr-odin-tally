const TallyService = require('../services/tallyService');

async function testDashboardData() {
    console.log('📊 Testing Tally Dashboard Data Integration...');
    
    const tallyService = new TallyService();
    
    try {
        console.log('\n🔍 Fetching all Tally data for dashboard...');
        
        // Fetch and normalize all data types
        const [companiesResponse, ledgersResponse, stockResponse, vouchersResponse] = await Promise.all([
            tallyService.fetchCompanyInfo(),
            tallyService.fetchLedgers(),
            tallyService.fetchStockItems(),
            tallyService.fetchVouchers()
        ]);

        const companies = tallyService.normalizeCompanyInfo(companiesResponse);
        const ledgers = tallyService.normalizeLedgers(ledgersResponse);
        const stockItems = tallyService.normalizeStockItems(stockResponse);
        const vouchers = tallyService.normalizeVouchers(vouchersResponse);

        // Create dashboard summary (similar to what the API endpoint returns)
        const summary = {
            totalCompanies: companies.length,
            totalLedgers: ledgers.length,
            totalStockItems: stockItems.length,
            totalVouchers: vouchers.length,
            lastSyncTime: new Date().toISOString()
        };

        // Calculate financial metrics
        const creditorsCount = ledgers.filter(l => l.parent === 'Sundry Creditors').length;
        const debtorsCount = ledgers.filter(l => l.parent === 'Sundry Debtors').length;
        const bankLedgers = ledgers.filter(l => l.parent === 'Bank Accounts').length;
        const cashLedgers = ledgers.filter(l => l.parent === 'Cash-in-hand').length;

        const totalOpeningBalance = ledgers.reduce((sum, l) => sum + (l.openingBalance || 0), 0);
        const totalClosingBalance = ledgers.reduce((sum, l) => sum + (l.closingBalance || 0), 0);

        const financialSummary = {
            creditors: creditorsCount,
            debtors: debtorsCount,
            bankAccounts: bankLedgers,
            cashAccounts: cashLedgers,
            totalOpeningBalance: totalOpeningBalance.toFixed(2),
            totalClosingBalance: totalClosingBalance.toFixed(2)
        };

        // Recent items (top 5)
        const recentLedgers = ledgers
            .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated))
            .slice(0, 5)
            .map(l => ({
                name: l.name,
                parent: l.parent,
                closingBalance: l.closingBalance
            }));

        const topStockItems = stockItems
            .filter(item => item.closingQty > 0)
            .sort((a, b) => b.closingQty - a.closingQty)
            .slice(0, 5)
            .map(item => ({
                name: item.name,
                qty: item.closingQty,
                value: item.closingValue,
                unit: item.baseUnits
            }));

        // Simulate API response
        const dashboardData = {
            success: true,
            data: {
                summary,
                financial: financialSummary,
                recentLedgers,
                topStockItems,
                companies: companies.map(c => ({ name: c.name, isActive: c.isActive })),
                voucherTypes: vouchers.map(v => ({ name: v.name, parent: v.parent }))
            }
        };

        console.log('\n🎉 Dashboard Data Successfully Generated!');
        console.log('\n📊 Summary Statistics:');
        console.log(`- Companies: ${summary.totalCompanies}`);
        console.log(`- Ledgers: ${summary.totalLedgers}`);
        console.log(`- Stock Items: ${summary.totalStockItems}`);
        console.log(`- Voucher Types: ${summary.totalVouchers}`);

        console.log('\n💰 Financial Overview:');
        console.log(`- Creditors: ${financialSummary.creditors}`);
        console.log(`- Debtors: ${financialSummary.debtors}`);
        console.log(`- Bank Accounts: ${financialSummary.bankAccounts}`);
        console.log(`- Cash Accounts: ${financialSummary.cashAccounts}`);
        console.log(`- Total Opening Balance: ₹${financialSummary.totalOpeningBalance}`);
        console.log(`- Total Closing Balance: ₹${financialSummary.totalClosingBalance}`);

        console.log('\n📋 Recent Ledgers:');
        recentLedgers.forEach((ledger, index) => {
            console.log(`${index + 1}. ${ledger.name} (${ledger.parent}) - ₹${ledger.closingBalance}`);
        });

        console.log('\n📦 Top Stock Items:');
        topStockItems.forEach((item, index) => {
            console.log(`${index + 1}. ${item.name} - ${item.qty} ${item.unit} (₹${item.value})`);
        });

        console.log('\n✅ All Tally integration tests PASSED!');
        console.log('🔗 Dashboard is ready to display live Tally data');
        
        return dashboardData;

    } catch (error) {
        console.error('❌ Dashboard data test failed:', error.message);
        throw error;
    }
}

testDashboardData();
