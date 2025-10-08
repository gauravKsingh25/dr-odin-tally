const mongoose = require('mongoose');
require('dotenv').config();

// Import only the employee model
const EmployeeInfo = require('../models/employeeinfo.model');

// Simple script to find employees with placeholder parties
async function findPlaceholderEmployees() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('✅ Connected to MongoDB database\n');
        console.log('🔍 Searching for employees with placeholder parties...\n');

        // Get all employees - no population to avoid schema errors
        const allEmployees = await EmployeeInfo.find({}).lean();

        console.log(`📊 Total employees in database: ${allEmployees.length}\n`);

        const employeesWithPlaceholders = [];
        let count = 0;

        // Common placeholder patterns based on what I can see in your database
        const placeholderPatterns = [
            /^party\s*[a-z]$/i,      // "Party A", "Party B", etc.
            /^placeholder/i,          // "placeholder"
            /^temp/i,                 // "temp"
            /^test/i,                 // "test"
            /^dummy/i,                // "dummy"
            /^sample/i,               // "sample"
            /^default/i,              // "default"
            /^tbd$/i,                 // "tbd"
            /^pending$/i,             // "pending"
            /^not.assigned/i,         // "not assigned"
            /^n\/a$/i,                // "n/a"
            /^na$/i,                  // "na"
            /^xxx+$/i,                // "xxx", "xxxx"
            /^yyy+$/i,                // "yyy", "yyyy"
            /^abc$/i,                 // "abc"
            /^$/,                     // empty strings
            /^undefined$/i,           // "undefined"
            /^null$/i                 // "null"
        ];

        allEmployees.forEach((employee) => {
            let hasPlaceholder = false;
            let placeholderDetails = [];

            // Check if party field exists and is an array
            if (!employee.party || !Array.isArray(employee.party)) {
                hasPlaceholder = true;
                placeholderDetails.push('No party field or not an array');
            } 
            // Check if party array is empty
            else if (employee.party.length === 0) {
                hasPlaceholder = true;
                placeholderDetails.push('Empty party array');
            }
            // Check each party in the array
            else {
                employee.party.forEach((party, index) => {
                    if (!party || typeof party !== 'string') {
                        hasPlaceholder = true;
                        placeholderDetails.push(`Party[${index}] is null/undefined`);
                    } else {
                        const partyTrimmed = party.trim();
                        if (partyTrimmed === '') {
                            hasPlaceholder = true;
                            placeholderDetails.push(`Party[${index}] is empty string`);
                        } else {
                            // Check against placeholder patterns
                            const isPlaceholder = placeholderPatterns.some(pattern => 
                                pattern.test(partyTrimmed)
                            );
                            if (isPlaceholder) {
                                hasPlaceholder = true;
                                placeholderDetails.push(`Party[${index}] is placeholder: "${partyTrimmed}"`);
                            }
                        }
                    }
                });
            }

            if (hasPlaceholder) {
                count++;
                employeesWithPlaceholders.push({
                    _id: employee._id,
                    empId: employee.empId,
                    empName: employee.empName,
                    status: employee.status,
                    party: employee.party,
                    issues: placeholderDetails,
                    createdAt: employee.createdAt,
                    updatedAt: employee.updatedAt
                });

                console.log(`${count}. 👤 ${employee.empName} (ID: ${employee.empId})`);
                console.log(`   ⚡ Status: ${employee.status ? 'Active' : 'Inactive'}`);
                console.log(`   🎭 Party Field: ${JSON.stringify(employee.party)}`);
                console.log(`   ⚠️  Issues: ${placeholderDetails.join(', ')}`);
                console.log(`   📅 Created: ${new Date(employee.createdAt).toLocaleDateString()}`);
                console.log(`   📅 Updated: ${new Date(employee.updatedAt).toLocaleDateString()}`);
                console.log('   ' + '─'.repeat(60));
            }
        });

        // Summary
        console.log('\n' + '='.repeat(80));
        console.log('📈 SUMMARY REPORT');
        console.log('='.repeat(80));
        console.log(`👥 Total employees: ${allEmployees.length}`);
        console.log(`🚨 Employees with placeholder parties: ${employeesWithPlaceholders.length}`);
        console.log(`✅ Employees with proper parties: ${allEmployees.length - employeesWithPlaceholders.length}`);
        
        if (allEmployees.length > 0) {
            console.log(`📊 Percentage with placeholder issues: ${((employeesWithPlaceholders.length / allEmployees.length) * 100).toFixed(2)}%`);
        }

        // Active vs Inactive breakdown
        const activeWithPlaceholders = employeesWithPlaceholders.filter(emp => emp.status).length;
        const inactiveWithPlaceholders = employeesWithPlaceholders.length - activeWithPlaceholders;
        
        console.log(`\n📊 Status Breakdown:`);
        console.log(`   ✅ Active employees with placeholder parties: ${activeWithPlaceholders}`);
        console.log(`   ❌ Inactive employees with placeholder parties: ${inactiveWithPlaceholders}`);

        // Quick reference lists
        if (employeesWithPlaceholders.length > 0) {
            console.log('\n📋 EMPLOYEE IDs WITH PLACEHOLDER PARTIES:');
            console.log(employeesWithPlaceholders.map(emp => emp.empId).join(', '));

            console.log('\n👥 EMPLOYEE NAMES WITH PLACEHOLDER PARTIES:');
            employeesWithPlaceholders.forEach(emp => {
                console.log(`   • ${emp.empName} (${emp.empId}) - ${emp.status ? 'Active' : 'Inactive'}`);
            });

            console.log('\n🔍 SPECIFIC PLACEHOLDER VALUES FOUND:');
            const placeholderValues = new Set();
            employeesWithPlaceholders.forEach(emp => {
                if (Array.isArray(emp.party)) {
                    emp.party.forEach(party => {
                        if (party && typeof party === 'string') {
                            placeholderValues.add(party.trim());
                        }
                    });
                }
            });
            Array.from(placeholderValues).forEach(value => {
                console.log(`   • "${value}"`);
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
    findPlaceholderEmployees()
        .then((results) => {
            console.log('\n✅ Script completed successfully!');
            console.log(`Found ${results.length} employees with placeholder parties.`);
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Script failed:', error.message);
            process.exit(1);
        });
}

module.exports = { findPlaceholderEmployees };