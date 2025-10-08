const mongoose = require('mongoose');
const EmployeeInfo = require('../models/employeeinfo.model');

// Parties found for SHUBHAM (CHD) to assign to SHUBHAM TANDEL
const shubhamParties = [
  "AASTHA MEDICOSE AND SURGICALS",
  "ASHISH ENTERPRISES (AMBALA)",
  "ASHISH TRADING CO. (HISAR)",
  "CONMED INDIA",
  "CRONUS SURGICALS AND MEDICALS",
  "DEV MEDICAL AGENCY (PANIPAT)",
  "J.K SURGICALS OF INDIA(OLD)",
  "KANHA SURGICALS (JIND)",
  "KRISHNA MEDICAL AGENCY (HISAR)",
  "LOVELY SURGICAL & MEDICALS (KAITHAL)",
  "MUNJAL SURGICAL & MEDICINI TRADERS",
  "SCIENCE SURGICO",
  "SHEENA SURGICAL (SIRSA)",
  "Tandon Surgical   ( Ambala)",
  "YADAV SURGICALS"
];

async function updateShubhamTandelParties() {
    try {
        console.log('🔄 Starting database update for SHUBHAM TANDEL...\n');

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
        
        // First, let's find the employee by name since we don't have the exact empId
        const currentEmployee = await EmployeeInfo.findOne({ 
            empName: { $regex: /SHUBHAM TANDEL/i }
        });
        
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
            console.log('   ❌ Employee with name SHUBHAM TANDEL not found in database');
            
            // Let's try to find similar names
            console.log('\n🔍 Searching for similar names...');
            const similarEmployees = await EmployeeInfo.find({ 
                empName: { $regex: /SHUBHAM/i }
            });
            
            if (similarEmployees.length > 0) {
                console.log('   Found employees with similar names:');
                similarEmployees.forEach((emp, index) => {
                    console.log(`     ${index + 1}. ${emp.empName} (ID: ${emp.empId})`);
                });
            }
            
            return { success: false, message: 'Employee not found' };
        }

        // Update with new parties
        console.log('\n🔄 Updating employee parties...');
        console.log('   New parties to assign:');
        shubhamParties.forEach((party, index) => {
            console.log(`     ${index + 1}. ${party}`);
        });

        const updateResult = await EmployeeInfo.findOneAndUpdate(
            { empName: { $regex: /SHUBHAM TANDEL/i } },
            { 
                $set: { 
                    party: shubhamParties,
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
            
            console.log('\n📋 Final parties list for SHUBHAM TANDEL:');
            updateResult.party.forEach((party, index) => {
                console.log(`     ${index + 1}. ${party}`);
            });

            return { 
                success: true, 
                employee: updateResult.empName,
                employeeId: updateResult.empId,
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
    updateShubhamTandelParties()
        .then((result) => {
            if (result.success) {
                console.log(`\n🎉 COMPLETE! Successfully updated ${result.employee} (${result.employeeId}) with ${result.partiesCount} parties!`);
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

module.exports = { updateShubhamTandelParties, shubhamParties };