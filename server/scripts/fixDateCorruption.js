const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import the TallyVoucher model
const TallyVoucher = require('../models/tallyVoucher.model.js');

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

// Function to fix corrupted dates
async function fixCorruptedDates() {
    console.log('🔧 FIXING CORRUPTED DATES IN DATABASE');
    console.log('====================================');
    
    try {
        // Files with corrupted dates
        const corruptedFiles = ['excel1.json', 'excel3.json'];
        const jsonDirectory = path.join(__dirname, 'converted');
        
        let totalFixed = 0;
        
        for (const jsonFile of corruptedFiles) {
            const jsonPath = path.join(jsonDirectory, jsonFile);
            
            if (!fs.existsSync(jsonPath)) {
                console.log(`⚠️  ${jsonFile} not found, skipping...`);
                continue;
            }
            
            console.log(`\n🔧 FIXING DATES FROM ${jsonFile.toUpperCase()}:`);
            console.log('='.repeat(35 + jsonFile.length));
            
            // Read JSON file
            const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
            const validVouchers = jsonData.filter(v => v && v.Voucher_Number && v.Date_iso);
            
            console.log(`📄 Found ${validVouchers.length} valid vouchers in ${jsonFile}`);
            
            let fixedCount = 0;
            let notFoundCount = 0;
            let alreadyCorrectCount = 0;
            
            // Process in batches to avoid memory issues
            const batchSize = 100;
            for (let i = 0; i < validVouchers.length; i += batchSize) {
                const batch = validVouchers.slice(i, i + batchSize);
                const voucherNumbers = batch.map(v => v.Voucher_Number);
                
                // Get current database vouchers
                const dbVouchers = await TallyVoucher.find({
                    voucherNumber: { $in: voucherNumbers }
                }).select('voucherNumber date').lean();
                
                const dbMap = {};
                dbVouchers.forEach(voucher => {
                    dbMap[voucher.voucherNumber] = voucher;
                });
                
                // Prepare bulk update operations
                const bulkOps = [];
                
                for (const jsonVoucher of batch) {
                    const dbVoucher = dbMap[jsonVoucher.Voucher_Number];
                    
                    if (!dbVoucher) {
                        notFoundCount++;
                        continue;
                    }
                    
                    const correctDate = new Date(jsonVoucher.Date_iso);
                    const currentDbDate = dbVoucher.date;
                    
                    // Check if dates are different (allowing for timezone differences)
                    const currentDbDateStr = currentDbDate.toISOString().split('T')[0];
                    const correctDateStr = correctDate.toISOString().split('T')[0];
                    
                    if (currentDbDateStr !== correctDateStr) {
                        bulkOps.push({
                            updateOne: {
                                filter: { voucherNumber: jsonVoucher.Voucher_Number },
                                update: {
                                    $set: {
                                        date: correctDate,
                                        voucherDate: correctDate,
                                        effectiveDate: correctDate,
                                        basicvoucherdate: correctDate,
                                        year: correctDate.getFullYear(),
                                        lastUpdated: new Date(),
                                        'rawData.Date_iso': jsonVoucher.Date_iso
                                    }
                                }
                            }
                        });
                        fixedCount++;
                    } else {
                        alreadyCorrectCount++;
                    }
                }
                
                // Execute bulk update if there are operations
                if (bulkOps.length > 0) {
                    const result = await TallyVoucher.bulkWrite(bulkOps);
                    console.log(`   ✅ Batch ${Math.floor(i/batchSize) + 1}: Updated ${result.modifiedCount} vouchers`);
                }
                
                // Progress indicator
                if (i % (batchSize * 10) === 0 && i > 0) {
                    console.log(`   📊 Progress: ${i}/${validVouchers.length} vouchers processed...`);
                }
            }
            
            console.log(`\n📊 Results for ${jsonFile}:`);
            console.log(`   Fixed: ${fixedCount}`);
            console.log(`   Already correct: ${alreadyCorrectCount}`);
            console.log(`   Not found in DB: ${notFoundCount}`);
            
            totalFixed += fixedCount;
        }
        
        console.log(`\n🎉 TOTAL VOUCHERS FIXED: ${totalFixed}`);
        
    } catch (error) {
        console.error('❌ Error fixing corrupted dates:', error.message);
    }
}

// Function to verify the fix
async function verifyFix() {
    console.log('\n✅ VERIFYING THE FIX');
    console.log('====================');
    
    try {
        // Check the most recent vouchers now
        const recentVouchers = await TallyVoucher.find({})
            .sort({ date: -1 })
            .limit(20)
            .select('voucherNumber date party rawData.Date_iso')
            .lean();
        
        console.log('📊 TOP 20 MOST RECENT VOUCHERS AFTER FIX:');
        console.log('=========================================');
        
        const dateGroups = {};
        recentVouchers.forEach(voucher => {
            const dateKey = voucher.date.toISOString().split('T')[0];
            if (!dateGroups[dateKey]) {
                dateGroups[dateKey] = [];
            }
            dateGroups[dateKey].push(voucher);
        });
        
        let counter = 1;
        Object.keys(dateGroups).sort().reverse().forEach(date => {
            const vouchers = dateGroups[date];
            console.log(`\n📅 ${date} (${vouchers.length} vouchers):`);
            vouchers.slice(0, 5).forEach(voucher => {
                const rawDate = voucher.rawData?.Date_iso || 'No raw';
                const match = voucher.date.toISOString().split('T')[0] === rawDate ? '✅' : '⚠️';
                console.log(`   ${counter.toString().padStart(2, ' ')}. ${voucher.voucherNumber.padEnd(12)} | ${voucher.party.substring(0, 30).padEnd(30)} | Raw: ${rawDate} ${match}`);
                counter++;
            });
            if (vouchers.length > 5) {
                console.log(`   ... and ${vouchers.length - 5} more on this date`);
            }
        });
        
        // Check date distribution
        const dateDistribution = await TallyVoucher.aggregate([
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$date"
                        }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id": -1 }
            },
            {
                $limit: 10
            }
        ]);
        
        console.log('\n📊 TOP 10 DATE DISTRIBUTIONS AFTER FIX:');
        console.log('=======================================');
        dateDistribution.forEach((dist, index) => {
            const percentage = ((dist.count / 7154) * 100).toFixed(1);
            console.log(`${(index + 1).toString().padStart(2, ' ')}. ${dist._id} | Count: ${dist.count.toString().padStart(4, ' ')} (${percentage}%)`);
        });
        
        if (dateDistribution.length > 0 && dateDistribution[0].count < 200) {
            console.log('\n🎉 SUCCESS! Date distribution is now much more balanced!');
            console.log('✅ The sorting should now show proper date variety!');
        } else {
            console.log('\n⚠️  Still seeing high concentration on single dates - may need further investigation');
        }
        
    } catch (error) {
        console.error('❌ Error verifying fix:', error.message);
    }
}

// Main function
async function fixDateCorruption() {
    await connectDB();
    
    try {
        await fixCorruptedDates();
        await verifyFix();
        
        console.log('\n🎯 DATE FIX COMPLETE!');
        console.log('=====================');
        console.log('The voucher sorting should now show proper date variety!');
        console.log('Recent vouchers will now reflect their true dates from the Excel files.');
        
    } catch (error) {
        console.error('❌ Error during date fix:', error.message);
    }
    
    await mongoose.connection.close();
    console.log('\n🔐 Database connection closed');
}

// Run the fix
if (require.main === module) {
    fixDateCorruption()
        .then(() => {
            console.log('\n✅ Date corruption fix completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Date fix failed:', error);
            process.exit(1);
        });
}

module.exports = { fixDateCorruption };