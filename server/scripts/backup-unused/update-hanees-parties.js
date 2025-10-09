const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import the employee model
const EmployeeInfo = require('../models/employeeinfo.model');

// Set the MongoDB URI directly (fallback if env variable not available)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dr_odin_tally';

async function extractHaneesPartiesAndUpdate() {
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
        console.log('📋 PARTIES LIST FOR MOHAMMED HANESS BHATT (EMPMOH19122022)');
        console.log('='.repeat(80));
        
        // Format for database update
        console.log('\n📝 Array format for database update:');
        console.log(JSON.stringify(partiesArray, null, 2));

        // Now update the database
        console.log('\n🔄 Connecting to database to update employee record...');
        console.log(`📡 Using MongoDB URI: ${MONGO_URI.replace(/\/\/.*:.*@/, '//***:***@')}`);
        
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB database');

        // Find and update Mohammed Haness Bhatt's record
        const updateResult = await EmployeeInfo.findOneAndUpdate(
            { empId: 'EMPMOH19122022' },
            { 
                $set: { 
                    party: partiesArray,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (updateResult) {
            console.log(`✅ Successfully updated Mohammed Haness Bhatt's party list!`);
            console.log(`   Employee: ${updateResult.empName}`);
            console.log(`   Employee ID: ${updateResult.empId}`);
            console.log(`   New party count: ${updateResult.party.length}`);
            console.log(`   Updated at: ${updateResult.updatedAt}`);
        } else {
            console.log('❌ Employee with ID EMPMOH19122022 not found in database');
        }

        // Show some transaction details for verification
        console.log('\n📊 Sample transactions:');
        haneesRecords.slice(0, 5).forEach((record, index) => {
            console.log(`${index + 1}. ${record.Voucher_Number} | ${record.Date_iso} | ${record.Party} | ₹${record.Debit_Amount}`);
        });

        return {
            totalRecords: allData.length,
            haneesRecords: haneesRecords.length,
            uniqueParties: partiesArray.length,
            parties: partiesArray,
            updateResult: updateResult ? 'Success' : 'Failed'
        };

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n📴 Database connection closed');
        }
    }
}

// Run the script
if (require.main === module) {
    extractHaneesPartiesAndUpdate()
        .then((result) => {
            console.log('\n✅ Script completed successfully!');
            console.log(`📊 Summary: ${result.uniqueParties} parties found and database ${result.updateResult.toLowerCase()}`);
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error.message);
            process.exit(1);
        });
}

module.exports = { extractHaneesPartiesAndUpdate };