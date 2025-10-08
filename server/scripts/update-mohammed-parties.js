const mongoose = require('mongoose');
const EmployeeInfo = require('../models/employeeinfo.model');

// Parties found for HANEES BHATT (J&K) to assign to Mohammed Haness Bhatt (EMPMOH19122022)
const haneesParties = [
  "BLUE BIRD PHARMACEUTICALS",
  "F SONS PHARMACEUTICAL DISTRIBUTORS", 
  "MAC  PHARMA PHARMACEUTICAL DISTRIBUTORS",
  "Maxim Enterprises  (SRINAGAR)",
  "NEW HIGHWAY PHARMA",
  "RESPIRE SURGICAL AND DISTRIBUTORS (Sri Nagar)",
  "S.WANI PHARMACEUTICAL DISTRIBUTORS"
];

async function updateMohammedHaneesParties() {
    try {
        console.log('🔄 Starting database update for Mohammed Haness Bhatt...\n');

        // Hardcoded MongoDB URI
        const mongoURI = 'mongodb+srv://gs8683921:123qwe@cluster0.m94ov.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

        console.log(`📡 Connecting to MongoDB Atlas...`);
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000
        });
        console.log('✅ Successfully connected to MongoDB Atlas!');

        // Show current parties for the employee (if exists)
        console.log('\n🔍 Checking current employee data...');
        const currentEmployee = await EmployeeInfo.findOne({ empId: 'EMPMOH19122022' });
        
        if (currentEmployee) {
            console.log(`   Employee found: ${currentEmployee.empName}`);
            console.log(`   Employee ID: ${currentEmployee.empId}`);
            console.log(`   Current parties count: ${currentEmployee.party ? currentEmployee.party.length : 0}`);
            
            if (currentEmployee.party && currentEmployee.party.length > 0) {
                console.log('   Current parties:');
                currentEmployee.party.forEach((party, index) => {
                    console.log(`     ${index + 1}. ${party}`);
                });
            } else {
                console.log('   Current parties: None (empty array)');
            }
        } else {
            console.log('   ❌ Employee not found in database');
            return { success: false, message: 'Employee not found' };
        }

        // Update with new parties
        console.log('\n🔄 Updating employee parties...');
        console.log('   New parties to assign:');
        haneesParties.forEach((party, index) => {
            console.log(`     ${index + 1}. ${party}`);
        });

        const updateResult = await EmployeeInfo.findOneAndUpdate(
            { empId: 'EMPMOH19122022' },
            { 
                $set: { 
                    party: haneesParties,
                    updatedAt: new Date()
                }
            },
            { new: true }
        );

        if (updateResult) {
            console.log('\n✅ SUCCESS! Employee parties updated successfully!');
            console.log(`   Employee: ${updateResult.empName}`);
            console.log(`   Employee ID: ${updateResult.empId}`);
            console.log(`   New party count: ${updateResult.party.length}`);
            console.log(`   Updated at: ${updateResult.updatedAt}`);
            
            console.log('\n📋 Final parties list for Mohammed Haness Bhatt:');
            updateResult.party.forEach((party, index) => {
                console.log(`     ${index + 1}. ${party}`);
            });

            return { 
                success: true, 
                employee: updateResult.empName,
                partiesCount: updateResult.party.length,
                parties: updateResult.party
            };
        } else {
            throw new Error('Update operation failed - employee not found');
        }

    } catch (error) {
        console.error('❌ Error updating database:', error.message);
        return { success: false, error: error.message };
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.close();
            console.log('\n📴 Database connection closed');
        }
    }
}

// Run the script
if (require.main === module) {
    updateMohammedHaneesParties()
        .then((result) => {
            if (result.success) {
                console.log(`\n🎉 COMPLETE! Successfully updated ${result.employee} with ${result.partiesCount} parties!`);
                process.exit(0);
            } else {
                console.log(`\n💥 FAILED: ${result.error || result.message}`);
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error('💥 Script failed:', error.message);
            process.exit(1);
        });
}

module.exports = { updateMohammedHaneesParties, haneesParties };