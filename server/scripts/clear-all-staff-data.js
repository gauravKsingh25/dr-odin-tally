/**
 * Clear All Staff-Related Data Script
 *
 * This script deletes all documents from employeeInfo, State, Zone, and City collections in MongoDB.
 * Use this to reset all staff-related data before a fresh import or cleanup.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const EmployeeInfo = require('../models/employeeinfo.model');
const State = require('../models/state.model');
const Zone = require('../models/zone.model');
const City = require('../models/city.model');

async function clearAllStaffData() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        const collections = [
            { name: 'employeeInfo', model: EmployeeInfo },
            { name: 'State', model: State },
            { name: 'Zone', model: Zone },
            { name: 'City', model: City }
        ];

        for (const { name, model } of collections) {
            const result = await model.deleteMany({});
            console.log(`🗑️ Cleared ${result.deletedCount} documents from ${name}`);
        }

        await mongoose.disconnect();
        console.log('📝 Disconnected from MongoDB');
        console.log('🎉 All staff-related data cleared successfully!');
    } catch (error) {
        console.error('❌ Error clearing staff data:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    clearAllStaffData();
}

module.exports = clearAllStaffData;
