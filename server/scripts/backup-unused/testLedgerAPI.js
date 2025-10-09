const mongoose = require('mongoose');
const path = require('path');
const axios = require('axios');

// Load environment variables from parent directory
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import the TallyLedger model
const TallyLedger = require('../models/tallyLedger.model.js');

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dr-odin-tally', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// Function to test ledgers API endpoint
async function testLedgerAPI() {
    console.log('🧪 TESTING LEDGER API ENDPOINT');
    console.log('==============================');
    
    // Test different scenarios
    const testCases = [
        {
            name: 'Basic API call (no filters)',
            params: { page: 1, limit: 10 }
        },
        {
            name: 'Search filter test',
            params: { page: 1, limit: 10, search: 'HEALTHCARE' }
        },
        {
            name: 'Group filter test', 
            params: { page: 1, limit: 10, group: 'Sundry Debtors' }
        },
        {
            name: 'Balance filter test (positive)',
            params: { page: 1, limit: 10, balance: 'positive' }
        },
        {
            name: 'Balance filter test (negative)',
            params: { page: 1, limit: 10, balance: 'negative' }
        }
    ];
    
    // You'll need to provide a valid token for testing
    const testToken = 'YOUR_JWT_TOKEN_HERE'; // Replace with actual token
    const apiUrl = 'http://localhost:7010/api/tally/ledgers';
    
    for (const testCase of testCases) {
        console.log(`\n🔍 Testing: ${testCase.name}`);
        console.log(`   Parameters: ${JSON.stringify(testCase.params)}`);
        
        try {
            const params = new URLSearchParams(testCase.params).toString();
            const response = await axios.get(`${apiUrl}?${params}`, {
                headers: { 
                    Authorization: `Bearer ${testToken}`,
                    'Content-Type': 'application/json'
                },
                timeout: 10000
            });
            
            if (response.data.status === 200) {
                const data = response.data.data;
                console.log(`   ✅ Success: ${data.ledgers.length} ledgers returned`);
                console.log(`   📊 Total: ${data.total}, Pages: ${data.pagination.totalPages}`);
                
                if (data.ledgers.length > 0) {
                    const sample = data.ledgers[0];
                    console.log(`   📋 Sample: "${sample.name}" | Parent: "${sample.parent}" | Balance: ${sample.closingBalance}`);
                }
            } else {
                console.log(`   ❌ API returned status: ${response.data.status}`);
                console.log(`   Message: ${response.data.message}`);
            }
            
        } catch (error) {
            if (error.response) {
                console.log(`   ❌ API Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
            } else if (error.code === 'ECONNREFUSED') {
                console.log(`   ❌ Connection refused - server might not be running`);
            } else {
                console.log(`   ❌ Request failed: ${error.message}`);
            }
        }
    }
}

// Function to test ledger data directly from database
async function testLedgerDatabase() {
    await connectDB();
    
    console.log('\n📊 TESTING LEDGER DATABASE DIRECTLY');
    console.log('===================================');
    
    try {
        const correctCompanyId = "68b9755e578bec07fd1ca54d";
        const currentYear = new Date().getFullYear();
        
        // Test the exact query that the API uses
        console.log('\n🔍 Testing API query logic:');
        const apiQuery = {
            companyId: mongoose.Types.ObjectId(correctCompanyId),
            year: currentYear
        };
        
        const totalResults = await TallyLedger.countDocuments(apiQuery);
        console.log(`   Total ledgers matching API query: ${totalResults}`);
        
        if (totalResults > 0) {
            // Get sample data exactly like the API
            const sampleLedgers = await TallyLedger.find(apiQuery)
                .sort({ name: 1 })
                .limit(5)
                .select('name parent aliasName openingBalance closingBalance lastUpdated guid masterId gstin addressList contactPerson creditLimit');
            
            console.log('\n📋 Sample ledgers (API format):');
            sampleLedgers.forEach((ledger, index) => {
                console.log(`   ${index + 1}. "${ledger.name}"`);
                console.log(`      Parent: "${ledger.parent}"`);
                console.log(`      Opening: ${ledger.openingBalance} | Closing: ${ledger.closingBalance}`);
                console.log(`      GUID: ${ledger.guid || 'N/A'}`);
                console.log(`      Contact: ${ledger.contactPerson || 'N/A'}`);
                console.log('');
            });
            
            // Test pagination like the API
            console.log('🔄 Testing pagination:');
            const page1 = await TallyLedger.find(apiQuery)
                .sort({ name: 1 })
                .skip(0)
                .limit(20);
            console.log(`   Page 1: ${page1.length} results`);
            
            const page2 = await TallyLedger.find(apiQuery)
                .sort({ name: 1 })
                .skip(20)
                .limit(20);
            console.log(`   Page 2: ${page2.length} results`);
            
            // Test search functionality
            console.log('\n🔍 Testing search functionality:');
            const searchResults = await TallyLedger.find({
                ...apiQuery,
                $or: [
                    { name: { $regex: 'HEALTHCARE', $options: 'i' } },
                    { parent: { $regex: 'HEALTHCARE', $options: 'i' } },
                    { aliasName: { $regex: 'HEALTHCARE', $options: 'i' } }
                ]
            });
            console.log(`   Search for 'HEALTHCARE': ${searchResults.length} results`);
            
            // Test group filter
            console.log('\n📂 Testing group filter:');
            const groupResults = await TallyLedger.find({
                ...apiQuery,
                parent: { $regex: 'Sundry Debtors', $options: 'i' }
            });
            console.log(`   'Sundry Debtors' group: ${groupResults.length} results`);
            
            // Test balance filters
            console.log('\n💰 Testing balance filters:');
            const positiveBalance = await TallyLedger.countDocuments({
                ...apiQuery,
                closingBalance: { $gt: 0 }
            });
            console.log(`   Positive balance: ${positiveBalance} ledgers`);
            
            const negativeBalance = await TallyLedger.countDocuments({
                ...apiQuery,
                closingBalance: { $lt: 0 }
            });
            console.log(`   Negative balance: ${negativeBalance} ledgers`);
            
            const zeroBalance = await TallyLedger.countDocuments({
                ...apiQuery,
                closingBalance: 0
            });
            console.log(`   Zero balance: ${zeroBalance} ledgers`);
            
        } else {
            console.log('❌ No ledgers found with API query - this explains the empty results!');
            
            // Debug the issue
            console.log('\n🔧 Debugging query components:');
            
            const companyOnly = await TallyLedger.countDocuments({
                companyId: mongoose.Types.ObjectId(correctCompanyId)
            });
            console.log(`   Company ID only: ${companyOnly} ledgers`);
            
            const yearOnly = await TallyLedger.countDocuments({
                year: currentYear
            });
            console.log(`   Year only: ${yearOnly} ledgers`);
            
            const noFilters = await TallyLedger.countDocuments({});
            console.log(`   No filters: ${noFilters} ledgers`);
            
            // Check what company IDs and years actually exist
            const companyStats = await TallyLedger.aggregate([
                { $group: { _id: '$companyId', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            console.log('\n📊 Actual company IDs in database:');
            companyStats.forEach(stat => {
                console.log(`   ${stat._id}: ${stat.count} ledgers`);
            });
            
            const yearStats = await TallyLedger.aggregate([
                { $group: { _id: '$year', count: { $sum: 1 } } },
                { $sort: { _id: -1 } }
            ]);
            console.log('\n📅 Actual years in database:');
            yearStats.forEach(stat => {
                console.log(`   ${stat._id}: ${stat.count} ledgers`);
            });
        }
        
    } catch (error) {
        console.error('❌ Database test error:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Function to generate mock API response for frontend testing
async function generateMockAPIResponse() {
    await connectDB();
    
    console.log('\n🎭 GENERATING MOCK API RESPONSE');
    console.log('==============================');
    
    try {
        // Get real data to create proper mock
        const sampleLedgers = await TallyLedger.find({})
            .limit(20)
            .select('name parent aliasName openingBalance closingBalance lastUpdated guid masterId gstin addressList contactPerson creditLimit');
        
        const mockResponse = {
            status: 200,
            data: {
                ledgers: sampleLedgers,
                total: sampleLedgers.length,
                pagination: {
                    currentPage: 1,
                    totalPages: Math.ceil(sampleLedgers.length / 20),
                    total: sampleLedgers.length,
                    limit: 20
                }
            },
            message: `Successfully fetched ${sampleLedgers.length} ledgers`
        };
        
        console.log('📄 Mock API Response (first 3 ledgers):');
        console.log(JSON.stringify({
            ...mockResponse,
            data: {
                ...mockResponse.data,
                ledgers: mockResponse.data.ledgers.slice(0, 3)
            }
        }, null, 2));
        
        console.log(`\n✅ Generated mock response with ${sampleLedgers.length} ledgers`);
        
    } catch (error) {
        console.error('❌ Mock generation error:', error.message);
    }
    
    await mongoose.connection.close();
}

// Main test function
async function runLedgerTests() {
    console.log('🚀 COMPREHENSIVE LEDGER API TEST');
    console.log('================================');
    console.log(`📅 Test Date: ${new Date().toISOString()}`);
    console.log(`🏢 Expected Company ID: 68b9755e578bec07fd1ca54d`);
    console.log(`📊 Expected Year: ${new Date().getFullYear()}`);
    
    // Test 1: Database direct access
    await testLedgerDatabase();
    
    // Test 2: Generate mock response for frontend
    await generateMockAPIResponse();
    
    // Test 3: API endpoint (if token provided)
    console.log('\n⚠️  API Endpoint Test:');
    console.log('   To test the actual API endpoint, update the testToken variable');
    console.log('   in this script with a valid JWT token and uncomment the line below:');
    console.log('   // await testLedgerAPI();');
    
    console.log('\n🎯 RECOMMENDATIONS:');
    console.log('===================');
    console.log('1. ✅ Check database query results above');
    console.log('2. 🔧 If no results found, check company ID and year filters');
    console.log('3. 🌐 Test actual API endpoint with valid token');
    console.log('4. 🔍 Check browser network tab for API errors');
    console.log('5. 📱 Verify frontend error handling');
    
    console.log('\n✅ Ledger test completed!');
}

// Run the test if this script is called directly
if (require.main === module) {
    runLedgerTests()
        .then(() => {
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Test failed:', error);
            process.exit(1);
        });
}

module.exports = { runLedgerTests, testLedgerDatabase, generateMockAPIResponse };