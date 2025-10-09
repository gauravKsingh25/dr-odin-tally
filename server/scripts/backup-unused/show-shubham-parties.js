const fs = require('fs');
const path = require('path');

async function showShubhamParties() {
    try {
        // Read all JSON files containing voucher data
        const excel1Path = path.join(__dirname, 'converted', 'excel1.json');
        const vouchersPath = path.join(__dirname, 'converted', 'vouchers.json');
        const excel4Path = path.join(__dirname, 'converted', 'excel4.json');
        
        let allData = [];
        
        // Read excel1.json
        if (fs.existsSync(excel1Path)) {
            const excel1Data = JSON.parse(fs.readFileSync(excel1Path, 'utf8'));
            allData = allData.concat(excel1Data);
            console.log(`📄 Loaded ${excel1Data.length} records from excel1.json`);
        }
        
        // Read vouchers.json
        if (fs.existsSync(vouchersPath)) {
            const vouchersData = JSON.parse(fs.readFileSync(vouchersPath, 'utf8'));
            allData = allData.concat(vouchersData);
            console.log(`📄 Loaded ${vouchersData.length} records from vouchers.json`);
        }
        
        // Read excel4.json (in case there are any SHUBHAM entries there too)
        if (fs.existsSync(excel4Path)) {
            const excel4Data = JSON.parse(fs.readFileSync(excel4Path, 'utf8'));
            allData = allData.concat(excel4Data);
            console.log(`📄 Loaded ${excel4Data.length} records from excel4.json`);
        }

        console.log(`📊 Total records loaded: ${allData.length}\n`);

        // Find all records where SHUBHAM (CHD) appears in the Details array
        const shubhamRecords = allData.filter(record => {
            if (record.Details && Array.isArray(record.Details)) {
                return record.Details.some(detail => 
                    (detail.Staff && detail.Staff.includes('SHUBHAM (CHD)')) ||
                    (detail.Account && detail.Account.includes('SHUBHAM (CHD)'))
                );
            }
            return false;
        });

        console.log(`🔍 Found ${shubhamRecords.length} records for SHUBHAM (CHD)\n`);

        // Extract unique parties
        const uniqueParties = new Set();
        
        shubhamRecords.forEach(record => {
            if (record.Party && record.Party.trim() !== '') {
                uniqueParties.add(record.Party.trim());
            }
        });

        const partiesArray = Array.from(uniqueParties).sort();
        
        console.log(`🎭 Found ${partiesArray.length} unique parties for SHUBHAM (CHD):\n`);
        
        partiesArray.forEach((party, index) => {
            console.log(`${index + 1}. ${party}`);
        });

        console.log('\n' + '='.repeat(80));
        console.log('📋 PARTIES TO ADD FOR SHUBHAM TANDEL');
        console.log('='.repeat(80));
        
        // Format for database update
        console.log('\n📝 Array format for database update:');
        console.log(JSON.stringify(partiesArray, null, 2));

        // Show some transaction details for verification
        console.log('\n📊 Sample transactions involving SHUBHAM (CHD):');
        shubhamRecords.slice(0, 10).forEach((record, index) => {
            console.log(`${index + 1}. ${record.Voucher_Number} | ${record.Date_iso} | ${record.Party} | ₹${record.Debit_Amount || record.Credit_Amount || 'N/A'}`);
        });

        console.log('\n✅ SUMMARY:');
        console.log(`   • Total voucher records processed: ${allData.length}`);
        console.log(`   • Records with SHUBHAM (CHD): ${shubhamRecords.length}`);
        console.log(`   • Unique parties identified: ${partiesArray.length}`);
        console.log(`   • Employee to update: SHUBHAM TANDEL`);

        return {
            totalRecords: allData.length,
            shubhamRecords: shubhamRecords.length,
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
    showShubhamParties()
        .then((result) => {
            console.log('\n🎯 Next step: Use these parties to update the database for SHUBHAM TANDEL');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error.message);
            process.exit(1);
        });
}

module.exports = { showShubhamParties };