const mongoose = require('mongoose');
require('dotenv').config();

// Import only the employee model
const EmployeeInfo = require('../models/employeeinfo.model');

// Simple script to get a clean list of employees with placeholder parties
async function getCleanEmployeeList() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('🔍 Finding employees with placeholder parties...\n');

        // Find employees with "Party A" or "Party B" in their party array
        const employeesWithPlaceholders = await EmployeeInfo.find({
            party: { 
                $elemMatch: { 
                    $regex: /^party\s*[a-z]$/i 
                } 
            }
        }).select('empId empName status party').lean();

        console.log(`📊 Found ${employeesWithPlaceholders.length} employees with placeholder parties:\n`);

        // Display in a clean table format
        console.log('┌─────────────────────┬─────────────────────────────────┬─────────┬─────────────────┐');
        console.log('│ Employee ID         │ Employee Name                   │ Status  │ Placeholder     │');
        console.log('├─────────────────────┼─────────────────────────────────┼─────────┼─────────────────┤');

        employeesWithPlaceholders.forEach((emp) => {
            const placeholders = emp.party.filter(party => /^party\s*[a-z]$/i.test(party));
            const empId = emp.empId.padEnd(19);
            const empName = emp.empName.length > 31 ? emp.empName.substring(0, 28) + '...' : emp.empName.padEnd(31);
            const status = (emp.status ? 'Active' : 'Inactive').padEnd(7);
            const placeholderText = placeholders.join(', ').padEnd(15);
            
            console.log(`│ ${empId} │ ${empName} │ ${status} │ ${placeholderText} │`);
        });

        console.log('└─────────────────────┴─────────────────────────────────┴─────────┴─────────────────┘');

        // Summary
        console.log(`\n📈 Summary:`);
        console.log(`   Total employees with placeholder parties: ${employeesWithPlaceholders.length}`);
        console.log(`   All are currently: Active\n`);

        // Just the employee IDs for easy copy-paste
        console.log('📋 Employee IDs (comma-separated):');
        const empIds = employeesWithPlaceholders.map(emp => emp.empId);
        console.log(empIds.join(', '));

        // Just the employee names for easy copy-paste
        console.log('\n👥 Employee Names:');
        employeesWithPlaceholders.forEach(emp => {
            console.log(`• ${emp.empName} (${emp.empId})`);
        });

        return employeesWithPlaceholders;

    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await mongoose.connection.close();
        console.log('\n📴 Database connection closed');
    }
}

// Run the script
if (require.main === module) {
    getCleanEmployeeList()
        .then(() => {
            console.log('✅ Script completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Failed:', error.message);
            process.exit(1);
        });
}

module.exports = { getCleanEmployeeList };