const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import models
const EmployeeInfo = require('../models/employeeinfo.model.js');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

async function checkEmployeeData() {
    await connectDB();
    
    try {
        // Check total count
        const totalCount = await EmployeeInfo.countDocuments();
        console.log(`📊 Total employees in database: ${totalCount}`);
        
        if (totalCount === 0) {
            console.log('❌ No employees found in database');
            return;
        }
        
        // Get sample records
        const sampleEmployees = await EmployeeInfo.find({})
            .limit(10)
            .select('empName party designation empId')
            .lean();
        
        console.log('\n📋 Sample employee records:');
        console.log('============================');
        
        sampleEmployees.forEach((emp, index) => {
            const partyStr = Array.isArray(emp.party) ? emp.party.join(', ') : (emp.party || 'No party');
            console.log(`${(index + 1).toString().padStart(2, ' ')}. ${(emp.empName || 'No name').padEnd(25)} | ${(emp.empId || 'No ID').padEnd(10)} | ${partyStr}`);
        });
        
        // Check for placeholder parties
        const placeholderCount = await EmployeeInfo.countDocuments({
            $or: [
                { party: { $in: ['Party A', 'Party B', 'party a', 'party b'] } },
                { party: { $elemMatch: { $regex: /^Party [AB]$/i } } }
            ]
        });
        
        console.log(`\n📊 Employees with placeholder parties: ${placeholderCount}`);
        
        // Check for empty or null parties
        const emptyPartyCount = await EmployeeInfo.countDocuments({
            $or: [
                { party: { $exists: false } },
                { party: null },
                { party: [] }
            ]
        });
        
        console.log(`📊 Employees with empty/null parties: ${emptyPartyCount}`);
        
        // Show party distribution
        const partyDistribution = await EmployeeInfo.aggregate([
            {
                $unwind: { path: '$party', preserveNullAndEmptyArrays: true }
            },
            {
                $group: {
                    _id: '$party',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);
        
        console.log('\n📊 Top 10 party distributions:');
        console.log('==============================');
        partyDistribution.forEach((dist, index) => {
            const partyName = dist._id || 'No party/null';
            console.log(`${(index + 1).toString().padStart(2, ' ')}. ${partyName.padEnd(25)} | ${dist.count} employees`);
        });
        
    } catch (error) {
        console.error('❌ Error checking employee data:', error.message);
    }
    
    await mongoose.connection.close();
}

checkEmployeeData();