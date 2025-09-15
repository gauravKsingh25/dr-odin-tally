const fs = require('fs');
const path = require('path');
const TallyServiceClass = require('../services/tallyService');

// Hardcoded Tally URL for direct testing
const TALLY_URL = 'http://192.168.0.183:9000/';

class TallyService extends TallyServiceClass {
    constructor() {
        super();
        this.tallyUrl = TALLY_URL;
    }
}

async function main() {
    const tallyService = new TallyService();

    // Fetch all companies
    const companyData = await tallyService.fetchCompanyInfo();
    const companies = tallyService.normalizeCompanyInfo(companyData);

    // Find ODIN company (case-insensitive)
    const odinCompany = companies.find(c =>
        (c.name || '').toLowerCase().includes('odin')
    );
    if (!odinCompany) {
        console.error('No company found with name containing "odin"');
        process.exit(1);
    }
    console.log('Found ODIN company:', odinCompany);

    // Fetch all vouchers (for all companies, Tally API usually returns all)
    let vouchersData = await tallyService.fetchVouchers();
    let vouchers = tallyService.normalizeVouchers(vouchersData);

    // Filter only vouchers for ODIN company and type "Sales"
    const odinVouchers = vouchers.filter(v =>
        v.voucherType &&
        v.voucherType.toLowerCase() === 'sales' &&
        v.party &&
        v.party.toLowerCase().includes('odin')
    );

    // Output to JSON file
    const outputPath = path.join(__dirname, 'odin-sales-vouchers.json');
    fs.writeFileSync(outputPath, JSON.stringify(odinVouchers, null, 2), 'utf-8');
    console.log(`Exported ${odinVouchers.length} ODIN sales vouchers to ${outputPath}`);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
