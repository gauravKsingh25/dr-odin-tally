const mongoose = require('mongoose');
const EmployeeInfo = require('../models/employeeinfo.model');

// Parties found for MANI VANNAN to assign to MANIVANAN VC
const maniVannanParties = [
  "ARCHER HEALTH CARE (THANJAVUR)",
  "ARUN SURGICAL AND HOME WELLNESS(KUMBAKONAM)",
  "BASH HEAL HOME HEALTH CARE SERVICES PRIVATE LIMITED",
  "BHARATH ENTERPRISES (CHENNAI)",
  "CAPITAL SURGICAL DEVICES",
  "CHANDANA PHARMA (SHIVMOGA)",
  "CHIDANVI SURGICALS  ( HASSAN )",
  "EVERSHINE PHARMA",
  "G.R SURGICAL (NAGERCOIL)",
  "GANESH PHARMA DISTRIBUTORS ( MADURAI )",
  "GIRIJA HEALTHCARE AND SURGICALS (UDUPI)",
  "GLOBAL MEDI SURG",
  "GOOBERZ MEDICAL DISTRIBUTOR (TUMAKURU)",
  "HI -TECH NAMANA SURGICAL (HASSAN)",
  "HIGE SURGICALS (OLD)",
  "HITWIN HEALTHCARE PVT LTD",
  "HR SURGICAL MART  (DHARMAPURI)",
  "IDEAL SURGICAL COMPANY (CHENNAI)",
  "J R ENTERPRISES  (CHENNAI)",
  "J.S. PHARMA (SALEM)",
  "JANANI MEDICO SURGICAL ENTERPRISES",
  "JEEVAN SURGICALS ( SALEM )",
  "JGM HEALTH CARE PHARMACEUTICALS",
  "Jain Surgical(Chennai)  Old",
  "Jain Surgicals   (Chennai)",
  "KANNAN PHARMACEUTICALS  (SALEM)",
  "KARTHIK PHARMA (BENGALURU)",
  "KARUR SCIENTIFIC SERVICES   [ KARUR ]",
  "KP ASSOCIATES  (Mangalore)",
  "Kb . Lakshmi",
  "LEEBANON PHARMA ( NAGERCOIL )",
  "LIFECARE SURGICAL",
  "LUCKY PHARMA (KARUR)",
  "M. RATAN AGENCIES  (BENGALURU)",
  "MAHAVEER SURGICALS ( Chamarajpet )",
  "MANRIK HEALTH CARE PRIVATE LIMITED",
  "MANU SURGICALS AND SCIENTIFIC SUPPLIES (SHIVMOGA)",
  "MARUTI PHARMA (BANGALORE)",
  "MASTER SURGICALS & PHARMACEUTICALS",
  "MEDI SMART SURGICALS",
  "MEDINOVA SURGICALS AND PHARMACEUTICALS (SHIVAMOGGA)",
  "MITRA SURGICALS (Nagercoil)",
  "MUTHUMEENA SURGICALS ( Trichy )",
  "NATIONAL HOSPITAL SUPPLIERS (DINDIGUL)",
  "NAYAK DISTRIBUTORS (MANGALURU)",
  "NIRMAL SURGICALS & PHARMA  (KANDAPURA)",
  "New Venkateshwara Surgicals   [Hubli ]",
  "PATEL MEDICALS (PADMANABHANAGAR)",
  "PENTA SURGICALS",
  "PLASMA SCIENTIFIC PRIVATE LIMITED   [Coimbatore]OLD",
  "PLASMA SCIENTIFIC PVT LTD (COIMBATORE)",
  "RADHA MEDICALS DENTAL & SURGICAL DIVISION",
  "RAMDEV PHARMA (HASSAN)",
  "RECEIPE PHARMA (TIRUPPUR)",
  "REDDY PHARMACEUTICAL DISTRIBUTORS  (BANGALORE)",
  "ROYAL PHARMA (BIDAR)",
  "S.L.N ENTERPRISES   (BENGLORE)",
  "SAAMIPYA HOME HEALTH PRIVATE LIMITED",
  "SAAR MEDITEC",
  "SABERWAL SURGICO INSTRUMENTS COMPANY   [COIMBATORE]",
  "SAI SOORYA SURGICALS AND PHARMA (MANGLORE)",
  "SAI SPARSHA SURGICAL  (Udupi )",
  "SALAI SURGICALS (PUDUKKOTTAI)",
  "SARASWATHY AGENCY (TRIVANDRUM)",
  "SASTHA HEALTH CARE (NAGERCOIL)",
  "SHIFA PHARMA SURGICALS",
  "SREE GURU SURGICALS",
  "SREE SAI PHARMA (PUDUKKOTTAI)",
  "SREE VENKATESHWARA AGENCY ( TAMILNADU )",
  "SRI AMMAN TRADERS (NAMAKKAL)",
  "SRI ANDAVAR SURGICALS  ( SALEM )",
  "SRI PATEL MEDICAL(GUBBALALA)",
  "SRI SAI SANTHOSH SURGICALS",
  "SRI THIRUMALAI SURGICALS ( ERODE )",
  "SRI VINAYAGA SURGICALS  ( TRICHY )",
  "SUBBU AGENCIES  (OLD)",
  "SUBBU AGENCIES (PALLADAM)",
  "SURYA SPECIALITY PHARMA  (BOMMASANDRA)",
  "SURYA SPECIALITY PHARMA  (KUMARSAWMY LAYOUT)",
  "SUVARNA ENTERPRISES (UDUPI)",
  "SWASTI HEALTH CARE ( BANGALORE )",
  "TAMILNADU MEDICAL AGENCIES",
  "TEAM SURGICALS ( Trichy )",
  "THE ROYAL SURGICALS (ERODE)",
  "THE SURGICAL CENTER (MANGLORE)",
  "THE SURGICAL SHOPEE (BELAGAVI)",
  "UP2DATE DRUGS & SURGICALS",
  "VIJAY MEDICAL AGENCIES (ILLUPUR)",
  "VISHWAS SCIENTIFIC CO.,",
  "WIFFY HEALTH CARE    ( KARUR  )",
  "YASHNA PHARMA (TRICHY)"
];

async function updateManiVananVcParties() {
    try {
        console.log('🔄 Starting database update for MANIVANAN VC...\n');

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
        
        // First, let's find the employee by name since we need to find MANIVANAN VC
        const currentEmployee = await EmployeeInfo.findOne({ 
            empName: { $regex: /MANIVANAN VC/i }
        });
        
        if (currentEmployee) {
            console.log(`   Employee found: ${currentEmployee.empName}`);
            console.log(`   Employee ID: ${currentEmployee.empId}`);
            console.log(`   Current parties count: ${currentEmployee.party ? currentEmployee.party.length : 0}`);
            
            if (currentEmployee.party && currentEmployee.party.length > 0) {
                console.log('   Current parties (showing first 10):');
                currentEmployee.party.slice(0, 10).forEach((party, index) => {
                    console.log(`     ${index + 1}. ${party}`);
                });
                if (currentEmployee.party.length > 10) {
                    console.log(`     ... and ${currentEmployee.party.length - 10} more parties`);
                }
            } else {
                console.log('   Current parties: None (empty array)');
            }
        } else {
            console.log('   ❌ Employee with name MANIVANAN VC not found in database');
            
            // Let's try to find similar names
            console.log('\n🔍 Searching for similar names...');
            const similarEmployees = await EmployeeInfo.find({ 
                empName: { $regex: /MANI/i }
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
        console.log(`   New parties to assign: ${maniVannanParties.length} parties`);
        console.log('   Sample parties (showing first 10):');
        maniVannanParties.slice(0, 10).forEach((party, index) => {
            console.log(`     ${index + 1}. ${party}`);
        });
        console.log(`     ... and ${maniVannanParties.length - 10} more parties`);

        const updateResult = await EmployeeInfo.findOneAndUpdate(
            { empName: { $regex: /MANIVANAN VC/i } },
            { 
                $set: { 
                    party: maniVannanParties,
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
            
            console.log('\n📋 Final parties list for MANIVANAN VC (showing first 15):');
            updateResult.party.slice(0, 15).forEach((party, index) => {
                console.log(`     ${index + 1}. ${party}`);
            });
            if (updateResult.party.length > 15) {
                console.log(`     ... and ${updateResult.party.length - 15} more parties`);
            }

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
    updateManiVananVcParties()
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

module.exports = { updateManiVananVcParties, maniVannanParties };