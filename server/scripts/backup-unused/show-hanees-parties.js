const fs = require('fs');
const path = require('path');

async function showHaneesParties() {
    try {
        // Read the JSON files containing voucher data
        const vouchersPath = path.join(__dirname, 'converted', 'vouchers.json');
        const excel4Path = path.join(__dirname, 'converted', 'excel4.json');
        
        let allData = [];
        
        // Read vouchers.json
        if (fs.existsSync(vouchersPath)) {
            const vouchersData = JSON.parse(fs.readFileSync(vouchersPath, 'utf8'));
            allData = allData.concat(vouchersData);
            console.log(`📄 Loaded ${vouchersData.length} records from vouchers.json`);
        }
        
        // Read excel4.json
        if (fs.existsSync(excel4Path)) {
            const excel4Data = JSON.parse(fs.readFileSync(excel4Path, 'utf8'));
            allData = allData.concat(excel4Data);
            console.log(`📄 Loaded ${excel4Data.length} records from excel4.json`);
        }

        console.log(`📊 Total records loaded: ${allData.length}\n`);

        // Find all records where HANEES BHATT (J&K) appears in the Details array
        const haneesRecords = allData.filter(record => {
            if (record.Details && Array.isArray(record.Details)) {
                return record.Details.some(detail => 
                    (detail.Staff && detail.Staff.includes('HANEES BHATT (J&K)')) ||
                    (detail.Account && detail.Account.includes('HANEES BHATT (J&K)'))
                );
            }
            return false;
        });

        console.log(`🔍 Found ${haneesRecords.length} records for HANEES BHATT (J&K)\n`);

        // Extract unique parties
        const uniqueParties = new Set();
        
        haneesRecords.forEach(record => {
            if (record.Party && record.Party.trim() !== '') {
                uniqueParties.add(record.Party.trim());
            }
        });

        const partiesArray = Array.from(uniqueParties).sort();
        
        console.log(`🎭 Found ${partiesArray.length} unique parties for HANEES BHATT (J&K):\n`);
        
        partiesArray.forEach((party, index) => {
            console.log(`${index + 1}. ${party}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('📋 PARTIES TO ADD FOR MOHAMMED HANESS BHATT (EMPMOH19122022)');
        console.log('='.repeat(80));
        
        // Format for database update
        console.log('\n📝 Array format for database update:');
        console.log(JSON.stringify(partiesArray, null, 2));

        // Show some transaction details for verification
        console.log('\n📊 Sample transactions involving HANEES BHATT (J&K):');
        haneesRecords.slice(0, 10).forEach((record, index) => {
            console.log(`${index + 1}. ${record.Voucher_Number} | ${record.Date_iso} | ${record.Party} | ₹${record.Debit_Amount || record.Credit_Amount || 'N/A'}`);
        });

        console.log('\n✅ SUMMARY:');
        console.log(`   • Total voucher records processed: ${allData.length}`);
        console.log(`   • Records with HANEES BHATT (J&K): ${haneesRecords.length}`);
        console.log(`   • Unique parties identified: ${partiesArray.length}`);
        console.log(`   • Employee to update: Mohammed Haness Bhatt (EMPMOH19122022)`);

        return {
            totalRecords: allData.length,
            haneesRecords: haneesRecords.length,
            uniqueParties: partiesArray.length,
            parties: partiesArray
        };

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Run the script
if (require.main === module) {
    showHaneesParties()
        .then((result) => {
            console.log('\n🎯 Next step: Use these parties to update the database for Mohammed Haness Bhatt (EMPMOH19122022)');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error.message);
            process.exit(1);
        });
}

module.exports = { showHaneesParties };