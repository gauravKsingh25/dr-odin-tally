const mongoose = require('mongoose');
const path = require('path');

// Load environment variables from the correct path
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import models
const Zone = require('../models/zone.model');
const City = require('../models/city.model'); 
const State = require('../models/state.model');
const EmployeeInfo = require('../models/employeeinfo.model');

// Target company ID to update to
const TARGET_COMPANY_ID = '68b9755e578bec07fd1ca54d';

// Hardcoded MongoDB URI as fallback
const FALLBACK_MONGO_URI = 'mongodb+srv://gs8683921:123qwe@cluster0.m94ov.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

async function updateCompanyIds() {
    try {
        // Determine which MongoDB URI to use
        const mongoUri = process.env.MONGO_URI || FALLBACK_MONGO_URI;
        
        if (!mongoUri) {
            throw new Error('MongoDB URI not found in environment variables or fallback');
        }
        
        console.log('🔗 Connecting to MongoDB...');
        console.log(`   Database: ${mongoUri.includes('cluster0') ? 'MongoDB Atlas Cluster' : 'Local/Other'}`);
        
        // Connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            // Set strictQuery to false to suppress the deprecation warning
            mongoose.set('strictQuery', false);
            
            await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('✅ Connected to MongoDB successfully');
        } else {
            console.log('🔗 Using existing MongoDB connection');
        }

        console.log('🔄 Starting Company ID update process...\n');
        console.log(`🎯 Target Company ID: ${TARGET_COMPANY_ID}\n`);

        // Validate target company ID format
        if (!mongoose.Types.ObjectId.isValid(TARGET_COMPANY_ID)) {
            throw new Error('Invalid target company ID format');
        }

        const targetObjectId = new mongoose.Types.ObjectId(TARGET_COMPANY_ID);

        // ===========================================
        // UPDATE ZONES COLLECTION
        // ===========================================
        console.log('📍 Processing Zones collection...');
        
        const zonesBeforeCount = await Zone.countDocuments();
        const zonesWithCompanyId = await Zone.countDocuments({ companyid: { $exists: true } });
        
        console.log(`   - Total zones: ${zonesBeforeCount}`);
        console.log(`   - Zones with company ID: ${zonesWithCompanyId}`);
        
        // Show current company IDs in zones
        const zoneCompanyIds = await Zone.distinct('companyid');
        console.log(`   - Unique company IDs in zones: ${zoneCompanyIds.length}`);
        zoneCompanyIds.forEach((id, index) => {
            if (id) console.log(`     ${index + 1}. ${id}`);
        });

        const zoneUpdateResult = await Zone.updateMany(
            { companyid: { $exists: true } },
            { $set: { companyid: targetObjectId } }
        );

        console.log(`   ✅ Zones updated: ${zoneUpdateResult.modifiedCount}\n`);

        // ===========================================
        // UPDATE STATES COLLECTION
        // ===========================================
        console.log('🗺️ Processing States collection...');
        
        const statesBeforeCount = await State.countDocuments();
        const statesWithCompanyId = await State.countDocuments({ companyid: { $exists: true } });
        
        console.log(`   - Total states: ${statesBeforeCount}`);
        console.log(`   - States with company ID: ${statesWithCompanyId}`);
        
        // Show current company IDs in states
        const stateCompanyIds = await State.distinct('companyid');
        console.log(`   - Unique company IDs in states: ${stateCompanyIds.length}`);
        stateCompanyIds.forEach((id, index) => {
            if (id) console.log(`     ${index + 1}. ${id}`);
        });

        const stateUpdateResult = await State.updateMany(
            { companyid: { $exists: true } },
            { $set: { companyid: targetObjectId } }
        );

        console.log(`   ✅ States updated: ${stateUpdateResult.modifiedCount}\n`);

        // ===========================================
        // UPDATE CITIES COLLECTION
        // ===========================================
        console.log('🏙️ Processing Cities collection...');
        
        const citiesBeforeCount = await City.countDocuments();
        const citiesWithCompanyId = await City.countDocuments({ companyid: { $exists: true } });
        
        console.log(`   - Total cities: ${citiesBeforeCount}`);
        console.log(`   - Cities with company ID: ${citiesWithCompanyId}`);
        
        // Show current company IDs in cities
        const cityCompanyIds = await City.distinct('companyid');
        console.log(`   - Unique company IDs in cities: ${cityCompanyIds.length}`);
        cityCompanyIds.forEach((id, index) => {
            if (id) console.log(`     ${index + 1}. ${id}`);
        });

        const cityUpdateResult = await City.updateMany(
            { companyid: { $exists: true } },
            { $set: { companyid: targetObjectId } }
        );

        console.log(`   ✅ Cities updated: ${cityUpdateResult.modifiedCount}\n`);

        // ===========================================
        // UPDATE EMPLOYEE INFO COLLECTION
        // ===========================================
        console.log('👥 Processing Employee Info collection...');
        
        const employeesBeforeCount = await EmployeeInfo.countDocuments();
        const employeesWithCompanyId = await EmployeeInfo.countDocuments({ companyid: { $exists: true } });
        
        console.log(`   - Total employees: ${employeesBeforeCount}`);
        console.log(`   - Employees with company ID: ${employeesWithCompanyId}`);
        
        // Show current company IDs in employee info
        const employeeCompanyIds = await EmployeeInfo.distinct('companyid');
        console.log(`   - Unique company IDs in employees: ${employeeCompanyIds.length}`);
        employeeCompanyIds.forEach((id, index) => {
            if (id) console.log(`     ${index + 1}. ${id}`);
        });

        // Show some sample employee data before update
        const sampleEmployees = await EmployeeInfo.find({ companyid: { $exists: true } })
            .limit(3)
            .select('empName empId companyid');
        
        console.log(`   - Sample employees before update:`);
        sampleEmployees.forEach((emp, index) => {
            console.log(`     ${index + 1}. ${emp.empName} (ID: ${emp.empId}) - Company: ${emp.companyid}`);
        });

        const employeeUpdateResult = await EmployeeInfo.updateMany(
            { companyid: { $exists: true } },
            { $set: { companyid: targetObjectId } }
        );

        console.log(`   ✅ Employees updated: ${employeeUpdateResult.modifiedCount}\n`);

        // ===========================================
        // VERIFICATION PHASE
        // ===========================================
        console.log('🔍 Verification Phase...\n');

        // Verify zones
        const zonesWithNewId = await Zone.countDocuments({ companyid: targetObjectId });
        const zonesWithOtherId = await Zone.countDocuments({ 
            companyid: { $exists: true, $ne: targetObjectId } 
        });
        console.log(`📍 Zones Verification:`);
        console.log(`   - With new company ID (${TARGET_COMPANY_ID}): ${zonesWithNewId}`);
        console.log(`   - With other company IDs: ${zonesWithOtherId}`);

        // Verify states
        const statesWithNewId = await State.countDocuments({ companyid: targetObjectId });
        const statesWithOtherId = await State.countDocuments({ 
            companyid: { $exists: true, $ne: targetObjectId } 
        });
        console.log(`🗺️ States Verification:`);
        console.log(`   - With new company ID (${TARGET_COMPANY_ID}): ${statesWithNewId}`);
        console.log(`   - With other company IDs: ${statesWithOtherId}`);

        // Verify cities
        const citiesWithNewId = await City.countDocuments({ companyid: targetObjectId });
        const citiesWithOtherId = await City.countDocuments({ 
            companyid: { $exists: true, $ne: targetObjectId } 
        });
        console.log(`🏙️ Cities Verification:`);
        console.log(`   - With new company ID (${TARGET_COMPANY_ID}): ${citiesWithNewId}`);
        console.log(`   - With other company IDs: ${citiesWithOtherId}`);

        // Verify employees
        const employeesWithNewId = await EmployeeInfo.countDocuments({ companyid: targetObjectId });
        const employeesWithOtherId = await EmployeeInfo.countDocuments({ 
            companyid: { $exists: true, $ne: targetObjectId } 
        });
        console.log(`👥 Employee Info Verification:`);
        console.log(`   - With new company ID (${TARGET_COMPANY_ID}): ${employeesWithNewId}`);
        console.log(`   - With other company IDs: ${employeesWithOtherId}`);

        // Show sample updated employee data
        const updatedSampleEmployees = await EmployeeInfo.find({ companyid: targetObjectId })
            .limit(3)
            .select('empName empId companyid');
        
        console.log(`\n   Sample employees after update:`);
        updatedSampleEmployees.forEach((emp, index) => {
            console.log(`     ${index + 1}. ${emp.empName} (ID: ${emp.empId}) - Company: ${emp.companyid}`);
        });

        // ===========================================
        // SUMMARY
        // ===========================================
        console.log('\n' + '='.repeat(50));
        console.log('📊 UPDATE SUMMARY');
        console.log('='.repeat(50));
        console.log(`🎯 Target Company ID: ${TARGET_COMPANY_ID}`);
        console.log(`📍 Zones updated: ${zoneUpdateResult.modifiedCount}`);
        console.log(`🗺️ States updated: ${stateUpdateResult.modifiedCount}`);
        console.log(`🏙️ Cities updated: ${cityUpdateResult.modifiedCount}`);
        console.log(`👥 Employees updated: ${employeeUpdateResult.modifiedCount}`);
        console.log(`📈 Total records updated: ${
            zoneUpdateResult.modifiedCount + 
            stateUpdateResult.modifiedCount + 
            cityUpdateResult.modifiedCount + 
            employeeUpdateResult.modifiedCount
        }`);

        console.log('\n🎉 Company ID update completed successfully!');

    } catch (error) {
        console.error('❌ Update failed:', error);
        console.error('Stack trace:', error.stack);
        
        // Log specific error details
        if (error.name === 'ValidationError') {
            console.error('Validation errors:');
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}: ${error.errors[key].message}`);
            });
        }
        
    } finally {
        // Close the database connection
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
            console.log('🔌 Database connection closed');
        }
        process.exit(0);
    }
}

// Add command line argument support
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
    console.log('🔄 Company ID Update Script');
    console.log('==========================');
    console.log('');
    console.log('This script updates the company ID in the following collections:');
    console.log('  - zones');
    console.log('  - states');
    console.log('  - cities');
    console.log('  - employeeinfo');
    console.log('');
    console.log(`Target Company ID: ${TARGET_COMPANY_ID}`);
    console.log('');
    console.log('Usage:');
    console.log('  node update-company-id.js         # Run the update');
    console.log('  node update-company-id.js --help  # Show this help');
    console.log('  node update-company-id.js --dry-run # Show what would be updated (NOT IMPLEMENTED YET)');
    console.log('');
    console.log('⚠️  WARNING: This script will modify your database!');
    console.log('   Make sure you have a backup before running this script.');
    process.exit(0);
}

// Check for dry run (future enhancement)
if (args.includes('--dry-run')) {
    console.log('❌ Dry run mode is not implemented yet.');
    console.log('   This feature will be added in a future version.');
    process.exit(1);
}

// Run the update
console.log('🚀 Starting Company ID Update Script');
console.log('=====================================\n');
console.log('⚠️  WARNING: This will modify your database!');
console.log('   Make sure you have a backup before proceeding.\n');

updateCompanyIds();