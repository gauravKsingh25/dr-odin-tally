/**
 * Delete Zones Except Top 4 Script
 *
 * This script deletes all Zone documents in MongoDB except the top 4 (by creation order).
 * The top 4 zones (oldest) will be kept, all others will be deleted.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Zone = require('../models/zone.model');

async function deleteZonesExceptTop4() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Find the top 4 zones by creation order (oldest)
        const topZones = await Zone.find({}).sort({ _id: 1 }).limit(4);
        const topZoneIds = topZones.map(z => z._id);

        // Delete all zones except the top 4
        const result = await Zone.deleteMany({ _id: { $nin: topZoneIds } });
        console.log(`🗑️ Deleted ${result.deletedCount} zones (kept top 4)`);

        await mongoose.disconnect();
        console.log('📝 Disconnected from MongoDB');
        console.log('🎉 Zone cleanup completed!');
    } catch (error) {
        console.error('❌ Error deleting zones:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    deleteZonesExceptTop4();
}

module.exports = deleteZonesExceptTop4;
