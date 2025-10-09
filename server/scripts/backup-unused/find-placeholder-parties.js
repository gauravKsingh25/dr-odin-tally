const mongoose = require('mongoose');
require('dotenv').config();

// Import the employee model
const EmployeeInfo = require('../models/employeeinfo.model');

// Database connection
const connectionParams = {
    useNewUrlParser: true,
    useUnifiedTopology: true
};

mongoose.set('strictQuery', false);

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI, connectionParams);
        console.log('✅ Connected to MongoDB database');
    } catch (error) {
        console.error('❌ Error connecting to database:', error.message);
        process.exit(1);
    }
}

async function findEmployeesWithPlaceholderParties() {
    try {
        console.log('🔍 Searching for employees with placeholder parties...\n');

        // Define common placeholder patterns
        const placeholderPatterns = [
            /placeholder/i,
            /temp/i,
            /test/i,
            /dummy/i,
            /sample/i,
            /default/i,
            /tbd/i,
            /pending/i,
            /not.assigned/i,
            /n\/a/i,
            /na/i,
            /xxx/i,
            /yyy/i,
            /abc/i,
            /^$/,  // Empty strings
            /undefined/i,
            /null/i
        ];

        // Build MongoDB query to find employees with placeholder parties
        const query = {
            $or: [
                // Check if party array exists and has elements matching placeholder patterns
                {
                    party: {
                        $elemMatch: {
                            $or: placeholderPatterns.map(pattern => ({
                                $regex: pattern
                            }))
                        }
                    }
                },
                // Check for empty party arrays
                { party: { $size: 0 } },
                // Check for null or undefined party field
                { party: { $exists: false } },
                { party: null }
            ]
        };

        // Find employees matching the criteria
        const employeesWithPlaceholders = await EmployeeInfo.find(query)
            .populate('designation', 'designation')
            .populate('zoneId', 'zonename')
            .populate('city', 'cityName')
            .populate('state', 'stateName')
            .populate('companyid', 'username')
            .lean();

        console.log(`📊 Found ${employeesWithPlaceholders.length} employees with placeholder parties:\n`);

        if (employeesWithPlaceholders.length === 0) {
            console.log('✅ No employees found with placeholder parties!');
            return [];
        }

        // Display detailed information about each employee
        let detailedResults = [];
        
        employeesWithPlaceholders.forEach((employee, index) => {
            console.log(`${index + 1}. Employee Details:`);
            console.log(`   📋 ID: ${employee.empId}`);
            console.log(`   👤 Name: ${employee.empName}`);
            console.log(`   💼 Designation: ${employee.designation?.designation || 'N/A'}`);
            console.log(`   🌍 Zone: ${employee.zoneId?.zonename || 'N/A'}`);
            console.log(`   🏙️  City: ${employee.city?.cityName || 'N/A'}`);
            console.log(`   📍 State: ${employee.state?.stateName || 'N/A'}`);
            console.log(`   🏢 Company: ${employee.companyid?.username || 'N/A'}`);
            console.log(`   ⚡ Status: ${employee.status ? 'Active' : 'Inactive'}`);
            
            // Check party field status
            let partyStatus = '';
            if (!employee.party || employee.party === null) {
                partyStatus = 'Party field is null/undefined';
            } else if (Array.isArray(employee.party) && employee.party.length === 0) {
                partyStatus = 'Party array is empty';
            } else if (Array.isArray(employee.party)) {
                const placeholders = employee.party.filter(party => 
                    placeholderPatterns.some(pattern => pattern.test(party))
                );
                partyStatus = `Contains ${placeholders.length} placeholder parties: [${placeholders.join(', ')}]`;
            }
            
            console.log(`   🎭 Party Status: ${partyStatus}`);
            console.log(`   📅 Date Joined: ${employee.doj || 'N/A'}`);
            console.log(`   📅 Created: ${new Date(employee.createdAt).toLocaleDateString()}`);
            console.log(`   📅 Updated: ${new Date(employee.updatedAt).toLocaleDateString()}`);
            console.log('   ' + '─'.repeat(60));

            // Add to detailed results
            detailedResults.push({
                empId: employee.empId,
                empName: employee.empName,
                designation: employee.designation?.designation || 'N/A',
                zone: employee.zoneId?.zonename || 'N/A',
                city: employee.city?.cityName || 'N/A',
                state: employee.state?.stateName || 'N/A',
                company: employee.companyid?.username || 'N/A',
                status: employee.status ? 'Active' : 'Inactive',
                partyField: employee.party,
                partyStatus: partyStatus,
                dateJoined: employee.doj || 'N/A',
                createdAt: employee.createdAt,
                updatedAt: employee.updatedAt
            });
        });

        // Summary statistics
        console.log('\n📈 Summary Statistics:');
        const activeCount = employeesWithPlaceholders.filter(emp => emp.status).length;
        const inactiveCount = employeesWithPlaceholders.length - activeCount;
        const nullPartyCount = employeesWithPlaceholders.filter(emp => !emp.party || emp.party === null).length;
        const emptyPartyCount = employeesWithPlaceholders.filter(emp => Array.isArray(emp.party) && emp.party.length === 0).length;
        const placeholderPartyCount = employeesWithPlaceholders.filter(emp => 
            Array.isArray(emp.party) && emp.party.length > 0 && 
            emp.party.some(party => placeholderPatterns.some(pattern => pattern.test(party)))
        ).length;

        console.log(`   👥 Total employees with issues: ${employeesWithPlaceholders.length}`);
        console.log(`   ✅ Active employees: ${activeCount}`);
        console.log(`   ❌ Inactive employees: ${inactiveCount}`);
        console.log(`   🚫 Null/undefined party field: ${nullPartyCount}`);
        console.log(`   📝 Empty party arrays: ${emptyPartyCount}`);
        console.log(`   🎭 Contains placeholder parties: ${placeholderPartyCount}`);

        return detailedResults;

    } catch (error) {
        console.error('❌ Error finding employees with placeholder parties:', error.message);
        throw error;
    }
}

async function generateCSVReport(employees) {
    if (employees.length === 0) {
        console.log('\n📝 No data to export');
        return;
    }

    const fs = require('fs');
    const path = require('path');

    try {
        // Create CSV content
        const csvHeaders = [
            'Employee ID',
            'Employee Name', 
            'Designation',
            'Zone',
            'City',
            'State',
            'Company',
            'Status',
            'Party Status',
            'Date Joined',
            'Created Date',
            'Updated Date'
        ];

        const csvRows = employees.map(emp => [
            emp.empId,
            emp.empName,
            emp.designation,
            emp.zone,
            emp.city,
            emp.state,
            emp.company,
            emp.status,
            emp.partyStatus.replace(/,/g, ';'), // Replace commas to avoid CSV issues
            emp.dateJoined,
            new Date(emp.createdAt).toLocaleDateString(),
            new Date(emp.updatedAt).toLocaleDateString()
        ]);

        const csvContent = [
            csvHeaders.join(','),
            ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
        ].join('\n');

        // Write to file
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `employees-with-placeholder-parties-${timestamp}.csv`;
        const filepath = path.join(__dirname, filename);

        fs.writeFileSync(filepath, csvContent, 'utf8');
        console.log(`\n📄 CSV report generated: ${filepath}`);

    } catch (error) {
        console.error('❌ Error generating CSV report:', error.message);
    }
}

async function main() {
    try {
        // Connect to database
        await connectToDatabase();

        // Find employees with placeholder parties
        const results = await findEmployeesWithPlaceholderParties();

        // Generate CSV report
        if (results.length > 0) {
            await generateCSVReport(results);
        }

        console.log('\n✅ Script completed successfully!');

    } catch (error) {
        console.error('💥 Script failed:', error.message);
    } finally {
        // Close database connection
        await mongoose.connection.close();
        console.log('📴 Database connection closed');
        process.exit(0);
    }
}

// Run the script
if (require.main === module) {
    main();
}

module.exports = {
    findEmployeesWithPlaceholderParties,
    connectToDatabase
};