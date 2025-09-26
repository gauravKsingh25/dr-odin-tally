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

// Function to extract all staff names and their parties from JSON files
async function extractAllStaffFromJson() {
    console.log('📂 EXTRACTING ALL STAFF FROM JSON FILES');
    console.log('======================================');
    
    const jsonFiles = ['excel1.json', 'excel2.json', 'excel3.json', 'excel4.json'];
    const jsonDirectory = path.join(__dirname, 'converted');
    const staffPartyMap = new Map(); // staff name -> Set of parties
    
    for (const jsonFile of jsonFiles) {
        const jsonPath = path.join(jsonDirectory, jsonFile);
        
        if (!fs.existsSync(jsonPath)) {
            console.log(`⚠️  ${jsonFile} not found, skipping...`);
            continue;
        }
        
        console.log(`\n📄 Processing ${jsonFile}...`);
        
        try {
            const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            const validVouchers = jsonData.filter(v => v && v.Details && Array.isArray(v.Details));
            
            let staffEntries = 0;
            
            for (const voucher of validVouchers) {
                const party = (voucher.Party || '').trim();
                if (!party) continue;
                
                for (const detail of voucher.Details) {
                    if (detail.Staff && detail.Staff.trim()) {
                        const staffName = detail.Staff.trim();
                        
                        // Initialize staff if not exists
                        if (!staffPartyMap.has(staffName)) {
                            staffPartyMap.set(staffName, new Set());
                        }
                        
                        // Add party to staff's set (Set automatically handles uniqueness)
                        staffPartyMap.get(staffName).add(party);
                        staffEntries++;
                    }
                }
            }
            
            console.log(`   📊 Processed ${staffEntries} staff entries from ${validVouchers.length} vouchers`);
            
        } catch (error) {
            console.error(`❌ Error processing ${jsonFile}:`, error.message);
        }
    }
    
    // Convert Map to array for easier processing
    const staffData = Array.from(staffPartyMap.entries()).map(([name, parties]) => ({
        name,
        parties: Array.from(parties).sort(), // Convert Set to sorted array
        partyCount: parties.size
    }));
    
    // Sort by party count (most active first)
    staffData.sort((a, b) => b.partyCount - a.partyCount);
    
    console.log(`\n📊 EXTRACTION SUMMARY:`);
    console.log(`   Total unique staff found: ${staffData.length}`);
    console.log(`   Total party assignments: ${staffData.reduce((sum, staff) => sum + staff.partyCount, 0)}`);
    
    // Show top 10 most active staff
    console.log(`\n🌟 TOP 10 MOST ACTIVE STAFF:`);
    console.log('===========================');
    staffData.slice(0, 10).forEach((staff, index) => {
        console.log(`${(index + 1).toString().padStart(2, ' ')}. ${staff.name.padEnd(25)} | ${staff.partyCount.toString().padStart(3, ' ')} parties | ${staff.parties.slice(0, 2).join(', ')}${staff.partyCount > 2 ? '...' : ''}`);
    });
    
    return staffData;
}

// Function to match staff with database and update parties
async function matchStaffAndUpdateParties(jsonStaffData) {
    console.log('\n🔍 MATCHING STAFF WITH DATABASE');
    console.log('===============================');
    
    try {
        // Get all staff from database
        const dbStaff = await EmployeeInfo.find({})
            .select('empName party empId designation')
            .lean();
        
        console.log(`📊 Database staff count: ${dbStaff.length}`);
        
        const matched = [];
        const notInDatabase = [];
        const updates = [];
        
        // Create a map of database staff for quick lookup (case-insensitive)
        const dbStaffMap = new Map();
        dbStaff.forEach(staff => {
            if (staff.empName) {
                const nameLower = staff.empName.toLowerCase().trim();
                dbStaffMap.set(nameLower, staff);
            }
        });
        
        // Match JSON staff with database staff
        for (const jsonStaff of jsonStaffData) {
            const jsonNameLower = jsonStaff.name.toLowerCase().trim();
            let matchedDbStaff = null;
            
            // Direct name match
            if (dbStaffMap.has(jsonNameLower)) {
                matchedDbStaff = dbStaffMap.get(jsonNameLower);
            } else {
                // Fuzzy matching - check if any part of the name matches
                for (const [dbName, dbStaffRecord] of dbStaffMap.entries()) {
                    // Split names and check for common parts
                    const jsonNameParts = jsonNameLower.split(/\s+/).filter(part => part.length > 2);
                    const dbNameParts = dbName.split(/\s+/).filter(part => part.length > 2);
                    
                    // Check if majority of parts match
                    const matchingParts = jsonNameParts.filter(part => 
                        dbNameParts.some(dbPart => dbPart.includes(part) || part.includes(dbPart))
                    );
                    
                    if (matchingParts.length >= Math.min(2, jsonNameParts.length, dbNameParts.length)) {
                        matchedDbStaff = dbStaffRecord;
                        break;
                    }
                }
            }
            
            if (matchedDbStaff) {
                // Staff found in database
                const currentParties = Array.isArray(matchedDbStaff.party) ? matchedDbStaff.party : [];
                const currentPartiesSet = new Set(currentParties.map(p => p.trim().toLowerCase()));
                
                // Find new unique parties to add
                const newParties = jsonStaff.parties.filter(party => {
                    const partyLower = party.trim().toLowerCase();
                    return !currentPartiesSet.has(partyLower) && partyLower !== 'party a' && partyLower !== 'party b';
                });
                
                if (newParties.length > 0) {
                    // Combine existing parties with new unique parties
                    const updatedParties = [...currentParties, ...newParties];
                    
                    matched.push({
                        jsonStaff,
                        dbStaff: matchedDbStaff,
                        existingParties: currentParties.length,
                        newParties: newParties.length,
                        totalParties: updatedParties.length
                    });
                    
                    // Prepare update
                    updates.push({
                        filter: { _id: matchedDbStaff._id },
                        update: {
                            $set: {
                                party: updatedParties,
                                lastUpdated: new Date()
                            }
                        }
                    });
                } else {
                    // No new parties to add
                    matched.push({
                        jsonStaff,
                        dbStaff: matchedDbStaff,
                        existingParties: currentParties.length,
                        newParties: 0,
                        totalParties: currentParties.length,
                        noNewParties: true
                    });
                }
            } else {
                // Staff not found in database
                notInDatabase.push(jsonStaff);
            }
        }
        
        console.log(`\n📊 MATCHING RESULTS:`);
        console.log(`   ✅ Found in database: ${matched.length}`);
        console.log(`   ❌ Not in database: ${notInDatabase.length}`);
        console.log(`   🔄 Will be updated: ${updates.length}`);
        
        return { matched, notInDatabase, updates };
        
    } catch (error) {
        console.error('❌ Error matching staff:', error.message);
        return { matched: [], notInDatabase: jsonStaffData, updates: [] };
    }
}

// Function to execute updates
async function executeUpdates(updates) {
    if (updates.length === 0) {
        console.log('\n✅ No updates needed - all staff already have their parties or no matches found');
        return;
    }
    
    console.log(`\n🔄 UPDATING ${updates.length} STAFF RECORDS`);
    console.log('========================================');
    
    try {
        const bulkOps = updates.map(update => ({
            updateOne: update
        }));
        
        const result = await EmployeeInfo.bulkWrite(bulkOps);
        console.log(`✅ Successfully updated ${result.modifiedCount} staff records`);
        
    } catch (error) {
        console.error('❌ Error executing updates:', error.message);
    }
}

// Function to display results
async function displayResults(matched, notInDatabase) {
    console.log('\n📋 DETAILED RESULTS');
    console.log('===================');
    
    // Show matched staff with party updates
    if (matched.length > 0) {
        const staffWithUpdates = matched.filter(m => !m.noNewParties);
        const staffWithoutUpdates = matched.filter(m => m.noNewParties);
        
        if (staffWithUpdates.length > 0) {
            console.log(`\n✅ STAFF UPDATED WITH NEW PARTIES (${staffWithUpdates.length}):`);
            console.log('================================================');
            staffWithUpdates.forEach((match, index) => {
                console.log(`${(index + 1).toString().padStart(3, ' ')}. ${match.dbStaff.empName.padEnd(25)} | Had: ${match.existingParties.toString().padStart(2, ' ')} | Added: ${match.newParties.toString().padStart(2, ' ')} | Total: ${match.totalParties.toString().padStart(3, ' ')} parties`);
            });
        }
        
        if (staffWithoutUpdates.length > 0) {
            console.log(`\n✅ STAFF ALREADY UP-TO-DATE (${staffWithoutUpdates.length}):`);
            console.log('=========================================');
            staffWithoutUpdates.slice(0, 10).forEach((match, index) => {
                console.log(`${(index + 1).toString().padStart(3, ' ')}. ${match.dbStaff.empName.padEnd(25)} | Already has ${match.existingParties} parties`);
            });
            if (staffWithoutUpdates.length > 10) {
                console.log(`... and ${staffWithoutUpdates.length - 10} more staff already up-to-date`);
            }
        }
    }
    
    // Show staff not in database
    if (notInDatabase.length > 0) {
        console.log(`\n❌ STAFF NOT REGISTERED IN DATABASE (${notInDatabase.length}):`);
        console.log('==============================================');
        console.log('These staff members need to be added to the database:');
        console.log('');
        
        // Sort by party count (most active first)
        notInDatabase.sort((a, b) => b.partyCount - a.partyCount);
        
        notInDatabase.forEach((staff, index) => {
            const partiesPreview = staff.parties.slice(0, 3).join(', ') + (staff.partyCount > 3 ? '...' : '');
            console.log(`${(index + 1).toString().padStart(3, ' ')}. ${staff.name.padEnd(30)} | ${staff.partyCount.toString().padStart(3, ' ')} parties | ${partiesPreview}`);
        });
        
        // Show top 10 most active unregistered staff
        console.log(`\n🌟 TOP 10 MOST ACTIVE UNREGISTERED STAFF:`);
        console.log('========================================');
        notInDatabase.slice(0, 10).forEach((staff, index) => {
            console.log(`${(index + 1).toString().padStart(2, ' ')}. ${staff.name} - handles ${staff.partyCount} different parties`);
        });
    }
}

// Function to generate summary report
async function generateFinalReport(matched, notInDatabase, updates) {
    console.log('\n📊 FINAL SUMMARY REPORT');
    console.log('=======================');
    
    const staffWithNewParties = matched.filter(m => !m.noNewParties);
    const staffAlreadyUpdated = matched.filter(m => m.noNewParties);
    
    console.log('🎯 PARTY UPDATE RESULTS:');
    console.log(`   📈 Staff with new parties added: ${staffWithNewParties.length}`);
    console.log(`   ✅ Staff already up-to-date: ${staffAlreadyUpdated.length}`);
    console.log(`   📋 Total database updates: ${updates.length}`);
    
    console.log('\n🆕 STAFF REGISTRATION NEEDED:');
    console.log(`   ❌ Staff not in database: ${notInDatabase.length}`);
    
    if (notInDatabase.length > 0) {
        const totalPartiesForNewStaff = notInDatabase.reduce((sum, staff) => sum + staff.partyCount, 0);
        console.log(`   🏢 Total parties they handle: ${totalPartiesForNewStaff}`);
        console.log(`   📊 Average parties per new staff: ${(totalPartiesForNewStaff / notInDatabase.length).toFixed(1)}`);
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================');
    
    if (updates.length > 0) {
        console.log('✅ Party assignments have been updated for existing staff');
    }
    
    if (notInDatabase.length > 0) {
        console.log(`🔴 ${notInDatabase.length} staff members need to be registered in the database`);
        console.log('📋 Focus on the most active ones first (they handle the most parties)');
        console.log('🎯 Consider creating a batch registration process for these staff');
    } else {
        console.log('🎉 All JSON staff are already registered in the database!');
    }
}

// Main function
async function updateStaffPartiesFromJson() {
    await connectDB();
    
    try {
        console.log('🚀 STAFF PARTY SYNC FROM JSON FILES');
        console.log('===================================');
        
        // Step 1: Extract all staff from JSON files
        const jsonStaffData = await extractAllStaffFromJson();
        
        if (jsonStaffData.length === 0) {
            console.log('❌ No staff data found in JSON files');
            return;
        }
        
        // Step 2: Match staff with database and prepare updates
        const { matched, notInDatabase, updates } = await matchStaffAndUpdateParties(jsonStaffData);
        
        // Step 3: Execute updates
        await executeUpdates(updates);
        
        // Step 4: Display detailed results
        await displayResults(matched, notInDatabase);
        
        // Step 5: Generate final report
        await generateFinalReport(matched, notInDatabase, updates);
        
        console.log('\n🎉 STAFF PARTY SYNC COMPLETED SUCCESSFULLY!');
        
    } catch (error) {
        console.error('❌ Error during staff party sync:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the staff party sync
if (require.main === module) {
    updateStaffPartiesFromJson()
        .then(() => {
            console.log('\n✅ Staff party sync process completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Staff party sync failed:', error);
            process.exit(1);
        });
}

module.exports = { updateStaffPartiesFromJson };