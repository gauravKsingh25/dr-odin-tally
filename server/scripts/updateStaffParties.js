const mongoose = require('mongoose');
const fs = require('fs');
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

// Function to find staff with placeholder parties
async function findStaffWithPlaceholderParties() {
    console.log('🔍 FINDING STAFF WITH PLACEHOLDER PARTIES');
    console.log('========================================');
    
    try {
        const placeholderParties = await EmployeeInfo.find({
            $or: [
                { party: { $in: ['Party A', 'Party B', 'party a', 'party b'] } },
                { party: { $elemMatch: { $regex: /^Party [AB]$/i } } }
            ]
        }).select('empName party designation').lean();
        
        console.log(`📊 Found ${placeholderParties.length} staff with placeholder parties:`);
        console.log('===========================================================');
        
        if (placeholderParties.length > 0) {
            placeholderParties.forEach((staff, index) => {
                const partyStr = Array.isArray(staff.party) ? staff.party.join(', ') : (staff.party || 'No party');
                console.log(`${(index + 1).toString().padStart(3, ' ')}. ${(staff.empName || 'No name').padEnd(25)} | ${partyStr.padEnd(15)} | ${staff.designation || 'No designation'}`);
            });
        }
        
        return placeholderParties;
        
    } catch (error) {
        console.error('❌ Error finding placeholder parties:', error.message);
        return [];
    }
}

// Function to extract all staff names from JSON files
async function extractStaffFromJsonFiles() {
    console.log('\n📂 EXTRACTING STAFF FROM JSON FILES');
    console.log('===================================');
    
    const jsonFiles = ['excel1.json', 'excel2.json', 'excel3.json', 'excel4.json'];
    const jsonDirectory = path.join(__dirname, 'converted');
    const allStaffData = new Map(); // Map to store staff name -> party assignments
    
    for (const jsonFile of jsonFiles) {
        const jsonPath = path.join(jsonDirectory, jsonFile);
        
        if (!fs.existsSync(jsonPath)) {
            console.log(`⚠️  ${jsonFile} not found, skipping...`);
            continue;
        }
        
        console.log(`\n📄 Processing ${jsonFile}:`);
        
        try {
            const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            const validVouchers = jsonData.filter(v => v && v.Details && Array.isArray(v.Details));
            
            let staffCount = 0;
            const fileStaffData = new Map();
            
            for (const voucher of validVouchers) {
                for (const detail of voucher.Details) {
                    if (detail.Staff && detail.Staff.trim()) {
                        const staffName = detail.Staff.trim();
                        const party = voucher.Party || 'Unknown Party';
                        
                        // Store staff -> party mapping
                        if (!fileStaffData.has(staffName)) {
                            fileStaffData.set(staffName, new Set());
                        }
                        fileStaffData.get(staffName).add(party);
                        
                        // Add to global map
                        if (!allStaffData.has(staffName)) {
                            allStaffData.set(staffName, new Set());
                        }
                        allStaffData.get(staffName).add(party);
                        
                        staffCount++;
                    }
                }
            }
            
            console.log(`   📊 Found ${fileStaffData.size} unique staff names (${staffCount} total entries)`);
            
            // Show top 10 staff in this file
            const sortedStaff = Array.from(fileStaffData.entries())
                .map(([name, parties]) => ({ name, parties: Array.from(parties), count: parties.size }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            
            console.log('   📋 Top 10 staff by party diversity:');
            sortedStaff.forEach((staff, index) => {
                const partiesStr = staff.parties.slice(0, 2).join(', ') + (staff.parties.length > 2 ? '...' : '');
                console.log(`      ${(index + 1).toString().padStart(2, ' ')}. ${staff.name.padEnd(25)} | ${staff.count} parties | ${partiesStr}`);
            });
            
        } catch (error) {
            console.error(`❌ Error processing ${jsonFile}:`, error.message);
        }
    }
    
    console.log(`\n📊 OVERALL SUMMARY:`);
    console.log(`   Total unique staff names: ${allStaffData.size}`);
    
    return allStaffData;
}

// Function to match and update staff parties
async function matchAndUpdateStaffParties(placeholderStaff, jsonStaffData) {
    console.log('\n🔄 MATCHING AND UPDATING STAFF PARTIES');
    console.log('======================================');
    
    const matched = [];
    const unmatched = [];
    const updates = [];
    
    try {
        // Match staff names (case-insensitive and fuzzy matching)
        for (const staff of placeholderStaff) {
            const staffName = (staff.empName || '').trim();
            let matchedJsonStaff = null;
            
            if (!staffName) continue; // Skip if no name
            
            // Direct match first
            for (const [jsonStaffName, parties] of jsonStaffData.entries()) {
                if (staffName.toLowerCase() === jsonStaffName.toLowerCase()) {
                    matchedJsonStaff = { name: jsonStaffName, parties: Array.from(parties) };
                    break;
                }
            }
            
            // Fuzzy match if no direct match
            if (!matchedJsonStaff) {
                const staffNameParts = staffName.toLowerCase().split(/\s+/);
                
                for (const [jsonStaffName, parties] of jsonStaffData.entries()) {
                    const jsonNameLower = jsonStaffName.toLowerCase();
                    
                    // Check if all parts of staff name are in JSON name or vice versa
                    const allPartsMatch = staffNameParts.every(part => 
                        jsonNameLower.includes(part) || part.length < 3
                    );
                    
                    const jsonNameParts = jsonNameLower.split(/\s+/);
                    const mostJsonPartsMatch = jsonNameParts.filter(part => 
                        staffName.toLowerCase().includes(part) && part.length >= 3
                    ).length >= Math.min(2, jsonNameParts.length);
                    
                    if (allPartsMatch || mostJsonPartsMatch) {
                        matchedJsonStaff = { name: jsonStaffName, parties: Array.from(parties) };
                        break;
                    }
                }
            }
            
            if (matchedJsonStaff) {
                matched.push({
                    dbStaff: staff,
                    jsonStaff: matchedJsonStaff
                });
                
                // Prepare update - replace party array with new parties
                updates.push({
                    filter: { _id: staff._id },
                    update: {
                        $set: {
                            party: matchedJsonStaff.parties,
                            lastUpdated: new Date()
                        }
                    }
                });
            } else {
                unmatched.push(staff);
            }
        }
        
        console.log(`📊 MATCHING RESULTS:`);
        console.log(`   ✅ Matched: ${matched.length}`);
        console.log(`   ❌ Unmatched: ${unmatched.length}`);
        
        // Show matched staff
        if (matched.length > 0) {
            console.log(`\n✅ MATCHED STAFF (will be updated):`);
            console.log('===================================');
            matched.forEach((match, index) => {
                const oldParty = Array.isArray(match.dbStaff.party) ? match.dbStaff.party.join(', ') : (match.dbStaff.party || 'No party');
                const newParties = match.jsonStaff.parties.join(', ').substring(0, 50) + (match.jsonStaff.parties.join(', ').length > 50 ? '...' : '');
                console.log(`${(index + 1).toString().padStart(3, ' ')}. ${(match.dbStaff.empName || 'No name').padEnd(25)} | Old: ${oldParty.substring(0, 10).padEnd(10)} | New: ${newParties}`);
            });
        }
        
        // Show unmatched staff
        if (unmatched.length > 0) {
            console.log(`\n❌ UNMATCHED STAFF (keeping placeholder parties):`);
            console.log('===============================================');
            unmatched.forEach((staff, index) => {
                const partyStr = Array.isArray(staff.party) ? staff.party.join(', ') : (staff.party || 'No party');
                console.log(`${(index + 1).toString().padStart(3, ' ')}. ${(staff.empName || 'No name').padEnd(25)} | ${partyStr} | ${staff.designation || 'No designation'}`);
            });
        }
        
        // Execute updates
        if (updates.length > 0) {
            console.log(`\n🔄 EXECUTING UPDATES...`);
            
            const bulkOps = updates.map(update => ({
                updateOne: update
            }));
            
            const result = await EmployeeInfo.bulkWrite(bulkOps);
            console.log(`✅ Updated ${result.modifiedCount} staff records`);
        }
        
        return { matched, unmatched, updates };
        
    } catch (error) {
        console.error('❌ Error matching and updating staff:', error.message);
        return { matched: [], unmatched: placeholderStaff, updates: [] };
    }
}

// Function to find remaining unmatched JSON staff
async function findRemainingJsonStaff(jsonStaffData, matchedStaff) {
    console.log('\n📋 REMAINING UNMATCHED JSON STAFF');
    console.log('=================================');
    
    const matchedJsonNames = new Set(
        matchedStaff.map(match => match.jsonStaff.name.toLowerCase())
    );
    
    const remainingStaff = [];
    
    for (const [staffName, parties] of jsonStaffData.entries()) {
        if (!matchedJsonNames.has(staffName.toLowerCase())) {
            remainingStaff.push({
                name: staffName,
                parties: Array.from(parties),
                partyCount: parties.size
            });
        }
    }
    
    // Sort by party count (most diverse first)
    remainingStaff.sort((a, b) => b.partyCount - a.partyCount);
    
    console.log(`📊 Found ${remainingStaff.length} staff in JSON not matched to database:`);
    console.log('================================================================');
    
    // Show top 50 or all if less than 50
    const showCount = Math.min(50, remainingStaff.length);
    remainingStaff.slice(0, showCount).forEach((staff, index) => {
        const partiesStr = staff.parties.slice(0, 3).join(', ') + (staff.parties.length > 3 ? '...' : '');
        console.log(`${(index + 1).toString().padStart(3, ' ')}. ${staff.name.padEnd(30)} | ${staff.partyCount.toString().padStart(2, ' ')} parties | ${partiesStr}`);
    });
    
    if (remainingStaff.length > showCount) {
        console.log(`... and ${remainingStaff.length - showCount} more staff`);
    }
    
    return remainingStaff;
}

// Function to generate summary report
async function generateSummaryReport(results) {
    console.log('\n📊 FINAL SUMMARY REPORT');
    console.log('=======================');
    
    const { matched, unmatched, remainingJsonStaff } = results;
    
    console.log('🎯 STAFF PARTY UPDATE RESULTS:');
    console.log(`   ✅ Successfully updated: ${matched.length} staff`);
    console.log(`   ❌ Could not match: ${unmatched.length} staff (keeping placeholder parties)`);
    console.log(`   📋 JSON staff not in database: ${remainingJsonStaff.length} staff`);
    
    // Check if we need to add new staff to database
    if (remainingJsonStaff.length > 0) {
        console.log('\n💡 RECOMMENDATIONS:');
        console.log('===================');
        console.log('1. Review the remaining JSON staff list above');
        console.log('2. Consider adding missing staff to the employeeinfo collection');
        console.log('3. Some names might be variations of existing staff (check manually)');
        
        // Find staff with most party diversity (potential key staff)
        const topStaff = remainingJsonStaff.slice(0, 10);
        if (topStaff.length > 0) {
            console.log('\n🌟 TOP 10 MOST ACTIVE REMAINING STAFF (by party count):');
            console.log('======================================================');
            topStaff.forEach((staff, index) => {
                console.log(`${(index + 1).toString().padStart(2, ' ')}. ${staff.name} - ${staff.partyCount} different parties`);
            });
        }
    }
    
    console.log('\n✅ STAFF PARTY UPDATE PROCESS COMPLETE!');
}

// Main function
async function updateStaffParties() {
    await connectDB();
    
    try {
        // Step 1: Find staff with placeholder parties
        const placeholderStaff = await findStaffWithPlaceholderParties();
        
        if (placeholderStaff.length === 0) {
            console.log('✅ No staff found with placeholder parties. Nothing to update!');
            return;
        }
        
        // Step 2: Extract staff from JSON files
        const jsonStaffData = await extractStaffFromJsonFiles();
        
        if (jsonStaffData.size === 0) {
            console.log('❌ No staff data found in JSON files.');
            return;
        }
        
        // Step 3: Match and update staff parties
        const { matched, unmatched } = await matchAndUpdateStaffParties(placeholderStaff, jsonStaffData);
        
        // Step 4: Find remaining unmatched JSON staff
        const remainingJsonStaff = await findRemainingJsonStaff(jsonStaffData, matched);
        
        // Step 5: Generate summary report
        await generateSummaryReport({ matched, unmatched, remainingJsonStaff });
        
    } catch (error) {
        console.error('❌ Error during staff party update process:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the staff party update
if (require.main === module) {
    updateStaffParties()
        .then(() => {
            console.log('\n✅ Staff party update process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Staff party update failed:', error);
            process.exit(1);
        });
}

module.exports = { updateStaffParties };