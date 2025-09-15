#!/usr/bin/env node

/**
 * Diagnostic Script: Cost Center Data Missing from Vouchers
 * 
 * This script helps identify why cost center data isn't being extracted
 * from Tally vouchers during sync operations.
 * 
 * Issues Found:
 * 1. TallyService.normalizeVouchers() doesn't extract COSTCENTREALLOCATIONS.LIST
 * 2. Voucher model has costCentreAllocations field but it's not being populated
 * 3. Cost center data exists in raw Tally response but gets lost during normalization
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const TallyVoucher = require('../models/tallyVoucher.model');
const TallyCostCenter = require('../models/tallyCostCenter.model');

// Import Tally service
const TallyService = require('../services/tallyService');

class CostCenterDiagnostic {
    constructor() {
        this.tallyService = new TallyService();
        this.results = {
            rawDataAnalysis: {},
            serviceAnalysis: {},
            databaseAnalysis: {},
            recommendations: []
        };
    }

    async connectDatabase() {
        try {
            await mongoose.connect(process.env.DB_URI || 'mongodb://localhost:27017/dr_odin_tally', {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
            console.log('✅ Connected to MongoDB');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async analyzeRawVoucherData() {
        console.log('\n🔍 Analyzing Raw Voucher Data...');
        
        try {
            const rawDataPath = path.join(__dirname, 'tally_vouchers_raw.json');
            
            if (!fs.existsSync(rawDataPath)) {
                console.log('❌ Raw voucher data file not found');
                return;
            }

            console.log('📁 Reading raw voucher data file...');
            const rawData = JSON.parse(fs.readFileSync(rawDataPath, 'utf8'));
            
            // Find vouchers with cost center allocations
            const vouchersWithCostCenters = [];
            let totalVouchers = 0;
            let vouchersWithCostCenterData = 0;

            const findVouchersWithCostCenters = (data, path = '') => {
                if (Array.isArray(data)) {
                    data.forEach((item, index) => findVouchersWithCostCenters(item, `${path}[${index}]`));
                } else if (data && typeof data === 'object') {
                    if (data.VOUCHER) {
                        const vouchers = Array.isArray(data.VOUCHER) ? data.VOUCHER : [data.VOUCHER];
                        totalVouchers += vouchers.length;
                        
                        vouchers.forEach((voucher, index) => {
                            if (this.hasCostCenterData(voucher)) {
                                vouchersWithCostCenterData++;
                                vouchersWithCostCenters.push({
                                    voucherNumber: voucher.VOUCHERNUMBER?._ || voucher.VOUCHERNUMBER || `Voucher-${index}`,
                                    voucherType: voucher.VOUCHERTYPENAME?._ || voucher.VOUCHERTYPENAME || 'Unknown',
                                    date: voucher.DATE?._ || voucher.DATE || 'Unknown',
                                    costCenterData: this.extractCostCenterData(voucher)
                                });
                            }
                        });
                    }
                    
                    Object.keys(data).forEach(key => {
                        findVouchersWithCostCenters(data[key], `${path}.${key}`);
                    });
                }
            };

            findVouchersWithCostCenters(rawData);

            this.results.rawDataAnalysis = {
                totalVouchers,
                vouchersWithCostCenterData,
                percentage: totalVouchers > 0 ? ((vouchersWithCostCenterData / totalVouchers) * 100).toFixed(2) : 0,
                sampleVouchers: vouchersWithCostCenters.slice(0, 5) // First 5 examples
            };

            console.log(`📊 Found ${totalVouchers} total vouchers`);
            console.log(`📊 Found ${vouchersWithCostCenterData} vouchers with cost center data (${this.results.rawDataAnalysis.percentage}%)`);
            
            if (vouchersWithCostCenterData > 0) {
                console.log('\n📋 Sample vouchers with cost center data:');
                this.results.rawDataAnalysis.sampleVouchers.forEach((voucher, index) => {
                    console.log(`  ${index + 1}. ${voucher.voucherNumber} (${voucher.voucherType}) - ${voucher.date}`);
                    voucher.costCenterData.forEach(cc => {
                        console.log(`     - ${cc.name}: ${cc.amount}`);
                    });
                });
            }

        } catch (error) {
            console.error('❌ Error analyzing raw data:', error.message);
            this.results.rawDataAnalysis.error = error.message;
        }
    }

    hasCostCenterData(voucher) {
        // Check if voucher has cost center allocations in ledger entries
        if (voucher.ALLLEDGERENTRIES?.LIST) {
            const entries = Array.isArray(voucher.ALLLEDGERENTRIES.LIST) 
                ? voucher.ALLLEDGERENTRIES.LIST 
                : [voucher.ALLLEDGERENTRIES.LIST];
            
            return entries.some(entry => entry['COSTCENTREALLOCATIONS.LIST']);
        }
        return false;
    }

    extractCostCenterData(voucher) {
        const costCenterData = [];
        
        if (voucher.ALLLEDGERENTRIES?.LIST) {
            const entries = Array.isArray(voucher.ALLLEDGERENTRIES.LIST) 
                ? voucher.ALLLEDGERENTRIES.LIST 
                : [voucher.ALLLEDGERENTRIES.LIST];
            
            entries.forEach(entry => {
                if (entry['COSTCENTREALLOCATIONS.LIST']) {
                    const ccAllocations = Array.isArray(entry['COSTCENTREALLOCATIONS.LIST'])
                        ? entry['COSTCENTREALLOCATIONS.LIST']
                        : [entry['COSTCENTREALLOCATIONS.LIST']];
                    
                    ccAllocations.forEach(cc => {
                        if (cc.NAME && cc.AMOUNT) {
                            costCenterData.push({
                                name: cc.NAME._ || cc.NAME,
                                amount: cc.AMOUNT._ || cc.AMOUNT,
                                ledgerName: entry.LEDGERNAME?._ || entry.LEDGERNAME || 'Unknown'
                            });
                        }
                    });
                }
            });
        }
        
        return costCenterData;
    }

    async analyzeTallyService() {
        console.log('\n🔍 Analyzing Tally Service Implementation...');
        
        try {
            // Check if TallyService has cost center extraction in normalizeVouchers
            const serviceCode = fs.readFileSync(path.join(__dirname, '../services/tallyService.js'), 'utf8');
            
            const hasCostCenterExtraction = serviceCode.includes('COSTCENTREALLOCATIONS') || 
                                          serviceCode.includes('costCentreAllocations') ||
                                          serviceCode.includes('costCenterAllocations');
            
            const hasCostCenterPayload = serviceCode.includes('getCostCentersPayload');
            
            this.results.serviceAnalysis = {
                hasCostCenterExtraction,
                hasCostCenterPayload,
                normalizeVouchersMethod: this.extractMethodCode(serviceCode, 'normalizeVouchers'),
                issues: []
            };

            if (!hasCostCenterExtraction) {
                this.results.serviceAnalysis.issues.push('normalizeVouchers() method does not extract COSTCENTREALLOCATIONS.LIST');
            }

            if (!hasCostCenterPayload) {
                this.results.serviceAnalysis.issues.push('No getCostCentersPayload() method found');
            }

            console.log(`📊 Cost center extraction in normalizeVouchers: ${hasCostCenterExtraction ? '✅' : '❌'}`);
            console.log(`📊 Cost center payload method: ${hasCostCenterPayload ? '✅' : '❌'}`);
            
            if (this.results.serviceAnalysis.issues.length > 0) {
                console.log('\n❌ Issues found in Tally Service:');
                this.results.serviceAnalysis.issues.forEach(issue => console.log(`  - ${issue}`));
            }

        } catch (error) {
            console.error('❌ Error analyzing Tally service:', error.message);
            this.results.serviceAnalysis.error = error.message;
        }
    }

    extractMethodCode(serviceCode, methodName) {
        const methodRegex = new RegExp(`${methodName}\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\}`, 'g');
        const match = serviceCode.match(methodRegex);
        return match ? match[0].substring(0, 500) + '...' : 'Method not found';
    }

    async analyzeDatabase() {
        console.log('\n🔍 Analyzing Database...');
        
        try {
            // Check voucher collection
            const totalVouchers = await TallyVoucher.countDocuments();
            const vouchersWithCostCenters = await TallyVoucher.countDocuments({
                'costCentreAllocations.0': { $exists: true }
            });

            // Check cost center collection
            const totalCostCenters = await TallyCostCenter.countDocuments();

            // Sample vouchers with cost center data
            const sampleVouchers = await TallyVoucher.find({
                'costCentreAllocations.0': { $exists: true }
            }).limit(3).select('voucherNumber voucherType costCentreAllocations');

            this.results.databaseAnalysis = {
                totalVouchers,
                vouchersWithCostCenters,
                percentage: totalVouchers > 0 ? ((vouchersWithCostCenters / totalVouchers) * 100).toFixed(2) : 0,
                totalCostCenters,
                sampleVouchers: sampleVouchers.map(v => ({
                    voucherNumber: v.voucherNumber,
                    voucherType: v.voucherType,
                    costCenterCount: v.costCentreAllocations?.length || 0
                }))
            };

            console.log(`📊 Database vouchers: ${totalVouchers} total, ${vouchersWithCostCenters} with cost centers (${this.results.databaseAnalysis.percentage}%)`);
            console.log(`📊 Cost centers in database: ${totalCostCenters}`);

        } catch (error) {
            console.error('❌ Error analyzing database:', error.message);
            this.results.databaseAnalysis.error = error.message;
        }
    }

    generateRecommendations() {
        console.log('\n💡 Generating Recommendations...');
        
        const recommendations = [];

        // Check if cost center data exists in raw data but not in database
        if (this.results.rawDataAnalysis.vouchersWithCostCenterData > 0 && 
            this.results.databaseAnalysis.vouchersWithCostCenters === 0) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'Cost center data exists in raw Tally response but not in database',
                solution: 'Update TallyService.normalizeVouchers() to extract COSTCENTREALLOCATIONS.LIST'
            });
        }

        // Check if Tally service is missing cost center extraction
        if (this.results.serviceAnalysis.issues.length > 0) {
            recommendations.push({
                priority: 'HIGH',
                issue: 'TallyService missing cost center extraction logic',
                solution: 'Add cost center extraction to normalizeVouchers() method'
            });
        }

        // Check if cost centers exist but vouchers don't reference them
        if (this.results.databaseAnalysis.totalCostCenters > 0 && 
            this.results.databaseAnalysis.vouchersWithCostCenters === 0) {
            recommendations.push({
                priority: 'MEDIUM',
                issue: 'Cost centers exist but vouchers not linked to them',
                solution: 'Verify voucher sync process includes cost center allocation extraction'
            });
        }

        this.results.recommendations = recommendations;

        if (recommendations.length > 0) {
            console.log('\n🎯 Recommendations:');
            recommendations.forEach((rec, index) => {
                console.log(`\n${index + 1}. [${rec.priority}] ${rec.issue}`);
                console.log(`   Solution: ${rec.solution}`);
            });
        } else {
            console.log('✅ No issues found - cost center data should be working correctly');
        }
    }

    async generateFixScript() {
        console.log('\n🛠️  Generating Fix Script...');
        
        const fixScript = `#!/usr/bin/env node

/**
 * Fix Script: Add Cost Center Extraction to Tally Service
 * 
 * This script updates the TallyService to properly extract cost center data
 * from voucher ledger entries.
 */

const fs = require('fs');
const path = require('path');

// Read the current TallyService
const servicePath = path.join(__dirname, '../services/tallyService.js');
let serviceCode = fs.readFileSync(servicePath, 'utf8');

// Find the normalizeVouchers method and add cost center extraction
const methodStart = serviceCode.indexOf('normalizeVouchers(parsed) {');
if (methodStart === -1) {
    console.error('❌ Could not find normalizeVouchers method');
    process.exit(1);
}

// Find the end of the method (look for the closing brace)
let braceCount = 0;
let methodEnd = methodStart;
let inMethod = false;

for (let i = methodStart; i < serviceCode.length; i++) {
    if (serviceCode[i] === '{') {
        braceCount++;
        inMethod = true;
    } else if (serviceCode[i] === '}') {
        braceCount--;
        if (inMethod && braceCount === 0) {
            methodEnd = i + 1;
            break;
        }
    }
}

// Extract the method content
const methodContent = serviceCode.substring(methodStart, methodEnd);

// Check if cost center extraction already exists
if (methodContent.includes('COSTCENTREALLOCATIONS')) {
    console.log('✅ Cost center extraction already exists in normalizeVouchers method');
    process.exit(0);
}

// Find where to insert the cost center extraction (before the return statement)
const returnIndex = methodContent.lastIndexOf('return {');
if (returnIndex === -1) {
    console.error('❌ Could not find return statement in normalizeVouchers method');
    process.exit(1);
}

// Create the cost center extraction code
const costCenterExtractionCode = \`
            // Extract cost center allocations from ledger entries
            let costCentreAllocations = [];
            if (voucher.ALLLEDGERENTRIES?.LIST) {
                const entries = Array.isArray(voucher.ALLLEDGERENTRIES.LIST) 
                    ? voucher.ALLLEDGERENTRIES.LIST 
                    : [voucher.ALLLEDGERENTRIES.LIST];
                
                entries.forEach(entry => {
                    if (entry['COSTCENTREALLOCATIONS.LIST']) {
                        const ccAllocations = Array.isArray(entry['COSTCENTREALLOCATIONS.LIST'])
                            ? entry['COSTCENTREALLOCATIONS.LIST']
                            : [entry['COSTCENTREALLOCATIONS.LIST']];
                        
                        ccAllocations.forEach(cc => {
                            if (cc.NAME && cc.AMOUNT) {
                                costCentreAllocations.push({
                                    costCentre: this.safeString(cc.NAME._ || cc.NAME),
                                    amount: this.safeNumber(cc.AMOUNT._ || cc.AMOUNT),
                                    percentage: 0 // Calculate if needed
                                });
                            }
                        });
                    }
                });
            }
\`;

// Insert the cost center extraction code before the return statement
const newMethodContent = methodContent.substring(0, returnIndex) + 
                        costCenterExtractionCode + 
                        methodContent.substring(returnIndex);

// Add costCentreAllocations to the return object
const updatedMethodContent = newMethodContent.replace(
    'ledgerEntries,',
    'ledgerEntries,\\n                costCentreAllocations,'
);

// Replace the method in the service code
const newServiceCode = serviceCode.substring(0, methodStart) + 
                      updatedMethodContent + 
                      serviceCode.substring(methodEnd);

// Write the updated service code
fs.writeFileSync(servicePath, newServiceCode);

console.log('✅ Successfully updated TallyService to extract cost center data');
console.log('📝 Changes made:');
console.log('   - Added cost center extraction logic to normalizeVouchers()');
console.log('   - Added costCentreAllocations to voucher return object');
console.log('\\n🔄 Next steps:');
console.log('   1. Restart your server');
console.log('   2. Re-sync vouchers from Tally');
console.log('   3. Verify cost center data is now present in database');
`;

        const fixScriptPath = path.join(__dirname, 'fix-costcenter-extraction.js');
        fs.writeFileSync(fixScriptPath, fixScript);
        console.log(`📝 Fix script created: ${fixScriptPath}`);
    }

    async run() {
        console.log('🚀 Starting Cost Center Diagnostic...\n');
        
        try {
            await this.connectDatabase();
            await this.analyzeRawVoucherData();
            await this.analyzeTallyService();
            await this.analyzeDatabase();
            this.generateRecommendations();
            await this.generateFixScript();
            
            console.log('\n📊 Diagnostic Summary:');
            console.log('====================');
            console.log(`Raw Data: ${this.results.rawDataAnalysis.vouchersWithCostCenterData || 0} vouchers with cost centers`);
            console.log(`Database: ${this.results.databaseAnalysis.vouchersWithCostCenters || 0} vouchers with cost centers`);
            console.log(`Service Issues: ${this.results.serviceAnalysis.issues?.length || 0}`);
            console.log(`Recommendations: ${this.results.recommendations?.length || 0}`);
            
            // Save results to file
            const resultsPath = path.join(__dirname, 'costcenter-diagnostic-results.json');
            fs.writeFileSync(resultsPath, JSON.stringify(this.results, null, 2));
            console.log(`\n💾 Results saved to: ${resultsPath}`);
            
        } catch (error) {
            console.error('❌ Diagnostic failed:', error.message);
        } finally {
            await mongoose.disconnect();
            console.log('\n✅ Diagnostic completed');
        }
    }
}

// Run the diagnostic
if (require.main === module) {
    const diagnostic = new CostCenterDiagnostic();
    diagnostic.run().catch(console.error);
}

module.exports = CostCenterDiagnostic;
