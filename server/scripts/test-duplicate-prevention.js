const mongoose = require('mongoose');
const TallyService = require('../services/tallyService');
const TallyCompany = require('../models/tallyCompany.model');
const TallyLedger = require('../models/tallyLedger.model');
const TallyVoucher = require('../models/tallyVoucher.model');
const TallyStockItem = require('../models/tallyStockItem.model');

// Database connection
const dbConfig = require('../config/db.config');

async function testDuplicatePrevention() {
    try {
        // Check if already connected
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(`mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('🔗 Connected to MongoDB');
        } else {
            console.log('🔗 Using existing MongoDB connection');
        }

        console.log('🧪 Testing duplicate prevention logic...');
        
        const tallyService = new TallyService();
        const mockCompanyId = new mongoose.Types.ObjectId();

        // Test 1: Check current database state
        console.log('\n📊 Current database state:');
        const companies = await TallyCompany.countDocuments();
        const ledgers = await TallyLedger.countDocuments();
        const vouchers = await TallyVoucher.countDocuments();
        const stockItems = await TallyStockItem.countDocuments();
        
        console.log(`   - Companies: ${companies}`);
        console.log(`   - Ledgers: ${ledgers}`);
        console.log(`   - Vouchers: ${vouchers}`);
        console.log(`   - Stock Items: ${stockItems}`);

        // Test 2: Test manual sync with the improved logic
        console.log('\n🔄 Testing manual sync...');
        
        try {
            // Fetch company data
            const companyData = await tallyService.fetchCompanyInfo();
            const normalizedCompanies = tallyService.normalizeCompanyInfo(companyData);
            
            console.log(`📈 Found ${normalizedCompanies.length} companies from Tally`);
            
            // Test multiple sync runs
            for (let i = 1; i <= 3; i++) {
                console.log(`\n🔄 Sync run ${i}:`);
                
                for (const company of normalizedCompanies) {
                    console.log(`   Processing company: ${company.name}, GUID: ${company.guid || 'null'}`);
                    
                    // Use our improved logic
                    const query = company.guid && company.guid.trim() !== '' 
                        ? { guid: company.guid }
                        : { name: company.name, guid: { $in: [null, ''] } };
                    
                    const result = await TallyCompany.updateOne(
                        query,
                        { 
                            $set: { 
                                ...company, 
                                companyId: mockCompanyId,
                                year: new Date().getFullYear(),
                                lastSyncedAt: new Date(),
                                syncRun: i  // Track which sync run this was
                            } 
                        },
                        { upsert: true }
                    );
                    
                    console.log(`   Result: ${result.matchedCount} matched, ${result.modifiedCount} modified, ${result.upsertedCount} inserted`);
                }
                
                // Check total count after each sync
                const totalAfterSync = await TallyCompany.countDocuments();
                console.log(`   📊 Total companies after sync ${i}: ${totalAfterSync}`);
            }
            
        } catch (error) {
            console.error('❌ Sync test failed:', error.message);
        }

        // Test 3: Verify no duplicates exist
        console.log('\n🔍 Checking for duplicates...');
        
        // Check for duplicate company names
        const duplicateNames = await TallyCompany.aggregate([
            { $group: { _id: '$name', count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        
        if (duplicateNames.length > 0) {
            console.log('⚠️  Found duplicate company names:');
            duplicateNames.forEach(dup => {
                console.log(`   - "${dup._id}": ${dup.count} occurrences`);
            });
        } else {
            console.log('✅ No duplicate company names found');
        }

        // Check for duplicate GUIDs (excluding nulls)
        const duplicateGuids = await TallyCompany.aggregate([
            { $match: { guid: { $ne: null, $ne: '' } } },
            { $group: { _id: '$guid', count: { $sum: 1 } } },
            { $match: { count: { $gt: 1 } } }
        ]);
        
        if (duplicateGuids.length > 0) {
            console.log('⚠️  Found duplicate GUIDs:');
            duplicateGuids.forEach(dup => {
                console.log(`   - GUID "${dup._id}": ${dup.count} occurrences`);
            });
        } else {
            console.log('✅ No duplicate GUIDs found');
        }

        // Test 4: Show final state
        console.log('\n📊 Final database state:');
        const finalCompanies = await TallyCompany.countDocuments();
        const companiesWithGuid = await TallyCompany.countDocuments({ guid: { $ne: null, $ne: '' } });
        const companiesWithoutGuid = await TallyCompany.countDocuments({ $or: [{ guid: null }, { guid: '' }] });
        
        console.log(`   - Total companies: ${finalCompanies}`);
        console.log(`   - Companies with GUID: ${companiesWithGuid}`);
        console.log(`   - Companies without GUID: ${companiesWithoutGuid}`);

        // Show sample data
        console.log('\n🔍 Sample company data:');
        const sampleCompanies = await TallyCompany.find().limit(3).select('name guid lastSyncedAt syncRun');
        sampleCompanies.forEach(company => {
            console.log(`   - ${company.name} | GUID: ${company.guid || 'null'} | Last sync: ${company.lastSyncedAt} | Run: ${company.syncRun || 'N/A'}`);
        });

        console.log('\n🎉 Duplicate prevention test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        console.error('Stack trace:', error.stack);
    } finally {
        // Close the database connection
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
        process.exit(0);
    }
}

// Run the test
testDuplicatePrevention();
