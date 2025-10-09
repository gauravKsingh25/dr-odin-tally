const mongoose = require('mongoose');
require('dotenv').config();

// Import all necessary models
const EmployeeInfo = require('../models/employeeinfo.model');
const Designation = require('../models/designation.model');
const User = require('../models/user.model');
const Zone = require('../models/zone.model');
const City = require('../models/city.model');
const State = require('../models/state.model');

// Database connection
const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.set('strictQuery', false);

async function findPlaceholderParties() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI, connectionParams);
        console.log('✅ Connected to MongoDB database\n');

        console.log('🔍 Searching for employees with placeholder parties...\n');

        // Get all employees and check their party fields
        const allEmployees = await EmployeeInfo.find({})
            .populate('designation', 'designation')
            .populate('companyid', 'username')
            .lean();

        console.log(`📊 Total employees in database: ${allEmployees.length}\n`);

        const employeesWithPlaceholders = [];
        let issueCount = 0;

        // Common placeholder indicators
        const placeholderKeywords = [
            'placeholder', 'temp', 'test', 'dummy', 'sample', 'default', 
            'tbd', 'pending', 'not assigned', 'n/a', 'na', 'xxx', 'yyy', 
            'abc', 'undefined', 'null', 'empty', 'todo'
        ];

        allEmployees.forEach((employee, index) => {
            let hasPlaceholder = false;
            let issueDetails = [];

            // Check if party field exists
            if (!employee.party) {
                hasPlaceholder = true;
                issueDetails.push('Party field is missing/null');
            } 
            // Check if party is an empty array
            else if (Array.isArray(employee.party) && employee.party.length === 0) {
                hasPlaceholder = true;
                issueDetails.push('Party array is empty');
            }
            // Check if party contains placeholder values
            else if (Array.isArray(employee.party)) {
                employee.party.forEach((party, partyIndex) => {
                    if (!party || party.trim() === '') {
                        hasPlaceholder = true;
                        issueDetails.push(`Party[${partyIndex}] is empty string`);
                    } else {
                        // Check against placeholder keywords
                        const partyLower = party.toLowerCase().trim();
                        const foundPlaceholder = placeholderKeywords.find(keyword => 
                            partyLower.includes(keyword)
                        );
                        if (foundPlaceholder) {
                            hasPlaceholder = true;
                            issueDetails.push(`Party[${partyIndex}] contains placeholder: "${party}"`);
                        }
                    }
                });
            }

            if (hasPlaceholder) {
                issueCount++;
                employeesWithPlaceholders.push({
                    empId: employee.empId,
                    empName: employee.empName,
                    designation: employee.designation?.designation || 'N/A',
                    company: employee.companyid?.username || 'N/A',
                    status: employee.status ? 'Active' : 'Inactive',
                    partyField: employee.party,
                    issues: issueDetails,
                    createdAt: employee.createdAt,
                    updatedAt: employee.updatedAt
                });

                console.log(`${issueCount}. 👤 ${employee.empName} (ID: ${employee.empId})`);
                console.log(`   💼 Designation: ${employee.designation?.designation || 'N/A'}`);
                console.log(`   🏢 Company: ${employee.companyid?.username || 'N/A'}`);
                console.log(`   ⚡ Status: ${employee.status ? 'Active' : 'Inactive'}`);
                console.log(`   🎭 Party Field: ${JSON.stringify(employee.party)}`);
                console.log(`   ⚠️  Issues: ${issueDetails.join(', ')}`);
                console.log(`   📅 Last Updated: ${new Date(employee.updatedAt).toLocaleDateString()}`);
                console.log('   ' + '─'.repeat(50));
            }
        });

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📈 SUMMARY REPORT');
        console.log('='.repeat(60));
        console.log(`👥 Total employees checked: ${allEmployees.length}`);
        console.log(`🚨 Employees with placeholder parties: ${employeesWithPlaceholders.length}`);
        console.log(`✅ Employees with proper parties: ${allEmployees.length - employeesWithPlaceholders.length}`);
        console.log(`📊 Percentage with issues: ${((employeesWithPlaceholders.length / allEmployees.length) * 100).toFixed(2)}%`);

        // Breakdown by issue type
        let nullFields = 0;
        let emptyArrays = 0;
        let placeholderValues = 0;
        let emptyStrings = 0;

        employeesWithPlaceholders.forEach(emp => {
            emp.issues.forEach(issue => {
                if (issue.includes('missing/null')) nullFields++;
                else if (issue.includes('empty array')) emptyArrays++;
                else if (issue.includes('placeholder')) placeholderValues++;
                else if (issue.includes('empty string')) emptyStrings++;
            });
        });

        console.log('\n📋 Issue Breakdown:');
        console.log(`   🚫 Missing/null party fields: ${nullFields}`);
        console.log(`   📝 Empty party arrays: ${emptyArrays}`);
        console.log(`   🎭 Contains placeholder values: ${placeholderValues}`);
        console.log(`   📄 Empty string values: ${emptyStrings}`);

        // List of employee IDs for easy reference
        if (employeesWithPlaceholders.length > 0) {
            console.log('\n📋 Employee IDs with placeholder parties:');
            const empIds = employeesWithPlaceholders.map(emp => emp.empId);
            console.log(empIds.join(', '));

            console.log('\n👥 Employee Names with placeholder parties:');
            employeesWithPlaceholders.forEach(emp => {
                console.log(`   • ${emp.empName} (${emp.empId}) - ${emp.status}`);
            });
        }

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
    findPlaceholderParties()
        .then((results) => {
            console.log('\n✅ Script completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error.message);
            process.exit(1);
        });
}

module.exports = { findPlaceholderParties };