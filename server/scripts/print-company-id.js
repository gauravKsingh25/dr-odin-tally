/**
 * Print Logged-In Company ID Script
 *
 * This script prints the company ObjectId for the currently logged-in profile/user.
 * It fetches the user from the database using the username or email set in the .env file.
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../models/user.model');

async function printCompanyId() {
    try {
        mongoose.set('strictQuery', false);
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB');

        // Use username or email from .env (customize as needed)
        const username = process.env.USERNAME;
        const email = process.env.EMAIL;

        let user;
        if (username) {
            user = await User.findOne({ username });
        } else if (email) {
            user = await User.findOne({ email });
        } else {
            console.log('❌ USERNAME or EMAIL not set in .env');
            process.exit(1);
        }

        if (user) {
            console.log(`Company/User ObjectId: ${user._id}`);
        } else {
            console.log('❌ User not found. Check your .env USERNAME or EMAIL.');
        }

        await mongoose.disconnect();
        console.log('📝 Disconnected from MongoDB');
    } catch (error) {
        console.error('❌ Error printing company id:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    printCompanyId();
}

module.exports = printCompanyId;
