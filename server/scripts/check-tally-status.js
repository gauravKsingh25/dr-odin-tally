const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import all Tally-related models
const TallyLedger = require('../models/tallyLedger.model');
const TallyVoucher = require('../models/tallyVoucher.model');
const TallyStockItem = require('../models/tallyStockItem.model');
const TallyCurrency = require('../models/tallyCurrency.model');
const TallyGroup = require('../models/tallyGroup.model');
const TallyCostCenter = require('../models/tallyCostCenter.model');
const TallyCompany = require('../models/tallyCompany.model');
const Tally = require('../models/tally.model');

const FALLBACK_MONGO_URI = 'mongodb+srv://gs8683921:123qwe@cluster0.m94ov.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0';

const TALLY_COLLECTIONS = [
    { name: 'TallyLedgers', model: TallyLedger, field: 'companyId', icon: '💰' },
    { name: 'TallyVouchers', model: TallyVoucher, field: 'companyId', icon: '📄' },
    { name: 'TallyStockItems', model: TallyStockItem, field: 'companyId', icon: '📦' },
    { name: 'TallyCurrencies', model: TallyCurrency, field: 'companyId', icon: '💱' },
    { name: 'TallyGroups', model: TallyGroup, field: 'companyId', icon: '🗂️' },
    { name: 'TallyCostCenters', model: TallyCostCenter, field: 'companyId', icon: '🏢' },
    { name: 'TallyCompanies', model: TallyCompany, field: 'companyId', icon: '🏭' },
    { name: 'TallyReports', model: Tally, field: 'companyid', icon: '📊' }
];

async function checkTallyCollectionsStatus() {
    try {
        const mongoUri = process.env.MONGO_URI || FALLBACK_MONGO_URI;
        mongoose.set('strictQuery', false);
        
        await mongoose.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('🔗 Connected to MongoDB');
        console.log('📋 Tally Collections Status Report');
        console.log('='.repeat(50));
        
        const TARGET_COMPANY_ID = '68b9755e578bec07fd1ca54d';
        
        for (const collection of TALLY_COLLECTIONS) {
            console.log(`\n${collection.icon} ${collection.name}:`);
            
            const total = await collection.model.countDocuments();
            const withCompanyId = await collection.model.countDocuments({ 
                [collection.field]: { $exists: true } 
            });
            const withTargetId = await collection.model.countDocuments({ 
                [collection.field]: TARGET_COMPANY_ID 
            });
            const withTargetIdAsObjectId = await collection.model.countDocuments({ 
                [collection.field]: new mongoose.Types.ObjectId(TARGET_COMPANY_ID) 
            });
            
            console.log(`   Total records: ${total}`);
            console.log(`   With company ID: ${withCompanyId}`);
            console.log(`   With target ID (string): ${withTargetId}`);
            console.log(`   With target ID (ObjectId): ${withTargetIdAsObjectId}`);
            
            if (withCompanyId > 0) {
                const distinctCompanyIds = await collection.model.distinct(collection.field);
                const validIds = distinctCompanyIds.filter(id => id != null);
                console.log(`   Unique company IDs: ${validIds.length}`);
                validIds.forEach(id => {
                    const matches = id.toString() === TARGET_COMPANY_ID;
                    console.log(`     - ${id} ${matches ? '✅' : ''}`);
                });
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\n🔌 Database connection closed');
        process.exit(0);
    }
}

console.log('🔍 Checking Tally Collections Status...');
checkTallyCollectionsStatus();