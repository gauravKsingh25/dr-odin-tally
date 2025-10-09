const mongoose = require('mongoose');
require('dotenv').config();

// Import all necessary models
const EmployeeInfo = require('../models/employeeinfo.model');
const Designation = require('../models/designation.model');
const User = require('../models/user.model');
const Zone = require('../models/zone.model');
const City = require('../models/city.model');
const State = require('../models/state.model');

// Quick script to get just the list of employees with placeholder parties
async function getPlaceholderEmployeesList() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('🔍 Fetching employees with placeholder parties...\n');

        // Find employees with problematic party fields
        const employees = await EmployeeInfo.find({
            $or: [
                { party: { $exists: false } },  // Field doesn't exist
                { party: null },                // Field is null
                { party: [] },                  // Empty array
                { party: { $elemMatch: { $regex: /^$/ } } }, // Contains empty strings
                { party: { $elemMatch: { $regex: /placeholder|temp|test|dummy|sample|default|tbd|pending|not.assigned|n\/a|na|xxx|yyy|abc|undefined|null/i } } }
            ]
        }).select('empId empName status party designation companyid')
          .populate('designation', 'designation')
          .populate('companyid', 'username')
          .lean();

        console.log(`📊 Found ${employees.length} employees with placeholder parties:\n`);

        // Simple list format
        employees.forEach((emp, index) => {
            const partyStatus = !emp.party ? 'No party field' : 
                               emp.party.length === 0 ? 'Empty party array' : 
                               `${emp.party.length} parties: [${emp.party.join(', ')}]`;
            
            console.log(`${index + 1}. ${emp.empName} (${emp.empId}) - ${emp.status ? 'Active' : 'Inactive'}`);
            console.log(`   Party: ${partyStatus}`);
            console.log(`   Designation: ${emp.designation?.designation || 'N/A'}`);
            console.log(`   Company: ${emp.companyid?.username || 'N/A'}\n`);
        });

        // Just the IDs for easy copying
        console.log('📋 Employee IDs only:');
        console.log(employees.map(emp => emp.empId).join(', '));

        console.log('\n📋 Employee Names only:');
        employees.forEach(emp => console.log(`- ${emp.empName}`));

        return employees.map(emp => ({
            empId: emp.empId,
            empName: emp.empName,
            status: emp.status,
            parties: emp.party || []
        }));

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
    getPlaceholderEmployeesList()
        .then(() => {
            console.log('✅ Complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Failed:', error.message);
            process.exit(1);
        });
}

module.exports = { getPlaceholderEmployeesList };