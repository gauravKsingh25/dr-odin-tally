// Fetch all raw data from Tally and save to JSON files
const fs = require('fs');
const path = require('path');
const TallyService = require('../services/tallyService');

(async () => {
  const tallyService = new TallyService();
  try {
    console.log('Fetching company info...');
    const companyData = await tallyService.fetchCompanyInfo();
    fs.writeFileSync(path.join(__dirname, 'tally_company_raw.json'), JSON.stringify(companyData, null, 2));

    console.log('Fetching ledgers...');
    const ledgersData = await tallyService.fetchLedgers();
    fs.writeFileSync(path.join(__dirname, 'tally_ledgers_raw.json'), JSON.stringify(ledgersData, null, 2));

    console.log('Fetching stock items...');
    const stockItemsData = await tallyService.fetchStockItems();
    fs.writeFileSync(path.join(__dirname, 'tally_stockitems_raw.json'), JSON.stringify(stockItemsData, null, 2));

    console.log('Fetching cost centers...');
    const costCentersData = await tallyService.fetchCostCenters();
    fs.writeFileSync(path.join(__dirname, 'tally_costcenters_raw.json'), JSON.stringify(costCentersData, null, 2));

    console.log('Fetching currencies...');
    const currenciesData = await tallyService.fetchCurrencies();
    fs.writeFileSync(path.join(__dirname, 'tally_currencies_raw.json'), JSON.stringify(currenciesData, null, 2));

    console.log('Fetching groups...');
    const groupsData = await tallyService.fetchGroups();
    fs.writeFileSync(path.join(__dirname, 'tally_groups_raw.json'), JSON.stringify(groupsData, null, 2));

    // Fetch vouchers for last 30 days in one go (can batch if needed)
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const toDate = new Date();
    const fromYMD = fromDate.toISOString().split('T')[0].replace(/-/g, '');
    const toYMD = toDate.toISOString().split('T')[0].replace(/-/g, '');
    console.log('Fetching vouchers...');
    const vouchersData = await tallyService.fetchVouchers(fromYMD, toYMD);
    fs.writeFileSync(path.join(__dirname, 'tally_vouchers_raw.json'), JSON.stringify(vouchersData, null, 2));

    console.log('All Tally data fetched and saved as raw JSON.');
  } catch (err) {
    console.error('Error fetching Tally data:', err.message);
  }
})();
