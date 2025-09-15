const fs = require('fs');
const path = require('path');
const TallyServiceClass = require('../services/tallyService');

// Hardcode the Tally URL for testing
const TALLY_URL = 'http://192.168.0.183:9000/';

class TallyService extends TallyServiceClass {
    constructor() {
        super();
        this.tallyUrl = TALLY_URL;
    }
}

async function main() {
    const tallyService = new TallyService();

    // 1. Fetch all companies
    const companyData = await tallyService.fetchCompanyInfo();
    const companies = tallyService.normalizeCompanyInfo(companyData);

    // 2. Find DR ODIN company (case-insensitive, matches "odin")
    const odinCompany = companies.find(c =>
        (c.name || '').toLowerCase().includes('odin')
    );
    if (!odinCompany) {
        console.error('DR ODIN company not found');
        process.exit(1);
    }
    console.log('Found DR ODIN company:', odinCompany.name);

    // 3. Fetch all vouchers
    let vouchersData = await tallyService.fetchVouchers(null, null);
    let vouchers = tallyService.normalizeVouchers(vouchersData);

    // 4. Filter vouchers where party/company name includes "odin" (case-insensitive)
    const odinVouchers = vouchers.filter(v =>
        (v.party && v.party.toLowerCase().includes('odin')) ||
        (v.company && v.company.toLowerCase().includes('odin'))
    );

    // 5. Output to JSON file
    const outputPath = path.join(__dirname, 'dr-odin-vouchers.json');
    fs.writeFileSync(outputPath, JSON.stringify(odinVouchers, null, 2), 'utf-8');
    console.log(`Exported ${odinVouchers.length} vouchers for DR ODIN to ${outputPath}`);
}

main().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
