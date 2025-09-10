/**
 * Add Standard Zones Script
 *
 * This script adds the following zones to the MongoDB Zone collection if they do not already exist:
 * north, south, east, west, northEast, central, northwest
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Zone = require('../models/zone.model');

const ZONES = [
    'north',
    'south',
    'east',
    'west',
    'northEast',
    'central',
    'northwest'
];

async function addStandardZones() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        for (const zoneName of ZONES) {
            const exists = await Zone.findOne({ zone: zoneName });
            if (!exists) {
                await Zone.create({ zone: zoneName });
                console.log(`➕ Added zone: ${zoneName}`);
            } else {
                console.log(`ℹ️ Zone already exists: ${zoneName}`);
            }
        }

        await mongoose.disconnect();
        console.log('📝 Disconnected from MongoDB');
        console.log('🎉 Zone addition completed!');
    } catch (error) {
        console.error('❌ Error adding zones:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    addStandardZones();
}

module.exports = addStandardZones;
