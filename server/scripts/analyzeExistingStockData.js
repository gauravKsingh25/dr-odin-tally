/**
 * Analyze Existing Stock Data in Database
 * This script will analyze what stock data we currently have and suggest improvements
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const TallyStockItem = require('../models/tallyStockItem.model');
const TallyVoucher = require('../models/tallyVoucher.model');

class ExistingStockAnalyzer {
    constructor() {
        console.log('🔍 Initializing Existing Stock Data Analyzer...\n');
    }

    async analyzeExistingStockData() {
        console.log('📊 Analyzing existing stock data in database...\n');
        
        try {
            // Get basic statistics
            const totalStockItems = await TallyStockItem.countDocuments();
            const activeStockItems = await TallyStockItem.countDocuments({ isActive: true });
            const stockItemsWithQty = await TallyStockItem.countDocuments({ closingQty: { $gt: 0 } });
            const stockItemsWithValue = await TallyStockItem.countDocuments({ closingValue: { $gt: 0 } });
            
            console.log('📈 BASIC STATISTICS:');
            console.log(`   Total Stock Items: ${totalStockItems}`);
            console.log(`   Active Stock Items: ${activeStockItems}`);
            console.log(`   Items with Quantity > 0: ${stockItemsWithQty}`);
            console.log(`   Items with Value > 0: ${stockItemsWithValue}\n`);
            
            if (totalStockItems === 0) {
                console.log('❌ No stock items found in database');
                console.log('💡 Need to sync data from Tally first\n');
                return null;
            }
            
            // Sample analysis of existing data
            const sampleItems = await TallyStockItem.find().limit(5).lean();
            
            console.log('🔬 SAMPLE DATA ANALYSIS:\n');
            console.log('='.repeat(80));
            
            const fieldAnalysis = {};
            
            sampleItems.forEach((item, index) => {
                console.log(`--- Stock Item ${index + 1}: ${item.name} ---`);
                
                Object.keys(item).forEach(field => {
                    if (field === '_id' || field === '__v') return;
                    
                    const value = item[field];
                    const hasValue = value !== null && value !== undefined && value !== '' && 
                                   (typeof value !== 'number' || value !== 0) &&
                                   (!Array.isArray(value) || value.length > 0) &&
                                   (typeof value !== 'object' || Object.keys(value).length > 0);
                    
                    if (!fieldAnalysis[field]) {
                        fieldAnalysis[field] = { total: 0, hasData: 0, sampleValues: [] };
                    }
                    
                    fieldAnalysis[field].total++;
                    if (hasValue) {
                        fieldAnalysis[field].hasData++;
                        if (fieldAnalysis[field].sampleValues.length < 2) {
                            fieldAnalysis[field].sampleValues.push(value);
                        }
                    }
                    
                    console.log(`  ${field}: ${typeof value} = ${JSON.stringify(value).substring(0, 100)}`);
                });
                console.log('');
            });
            
            // Field quality analysis
            console.log('📊 FIELD QUALITY ANALYSIS:\n');
            console.log('='.repeat(80));
            
            const sortedFields = Object.keys(fieldAnalysis).sort((a, b) => {
                const qualityA = (fieldAnalysis[a].hasData / fieldAnalysis[a].total) * 100;
                const qualityB = (fieldAnalysis[b].hasData / fieldAnalysis[b].total) * 100;
                return qualityB - qualityA;
            });
            
            const highQualityFields = [];
            const mediumQualityFields = [];
            const lowQualityFields = [];
            
            sortedFields.forEach(field => {
                const analysis = fieldAnalysis[field];
                const quality = Math.round((analysis.hasData / analysis.total) * 100);
                
                console.log(`${field.padEnd(25)} | ${quality}% data quality | Sample: ${JSON.stringify(analysis.sampleValues[0] || 'N/A').substring(0, 50)}`);
                
                if (quality >= 80) highQualityFields.push(field);
                else if (quality >= 40) mediumQualityFields.push(field);
                else lowQualityFields.push(field);
            });
            
            console.log('\n🎯 FIELD RECOMMENDATIONS:\n');
            console.log('🟢 HIGH QUALITY (Use in main UI):');
            highQualityFields.forEach(field => console.log(`   ✅ ${field}`));
            
            console.log('\n🟡 MEDIUM QUALITY (Use in detailed view):');
            mediumQualityFields.forEach(field => console.log(`   ⚠️ ${field}`));
            
            console.log('\n🔴 LOW QUALITY (Use only if necessary):');
            lowQualityFields.slice(0, 5).forEach(field => console.log(`   ❌ ${field}`));
            if (lowQualityFields.length > 5) {
                console.log(`   ... and ${lowQualityFields.length - 5} more`);
            }
            
            // Analyze stock status distribution
            const stockStatusDistribution = await TallyStockItem.aggregate([
                { $group: { _id: '$stockStatus', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            
            console.log('\n📊 STOCK STATUS DISTRIBUTION:');
            stockStatusDistribution.forEach(status => {
                console.log(`   ${status._id || 'Unknown'}: ${status.count} items`);
            });
            
            // Analyze top stock items by value and quantity
            const topByValue = await TallyStockItem.find({ closingValue: { $gt: 0 } })
                .sort({ closingValue: -1 })
                .limit(5)
                .select('name closingValue closingQty baseUnits')
                .lean();
            
            const topByQuantity = await TallyStockItem.find({ closingQty: { $gt: 0 } })
                .sort({ closingQty: -1 })
                .limit(5)
                .select('name closingValue closingQty baseUnits')
                .lean();
            
            console.log('\n💰 TOP 5 ITEMS BY VALUE:');
            topByValue.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.name} - ₹${item.closingValue.toLocaleString()} (Qty: ${item.closingQty} ${item.baseUnits || ''})`);
            });
            
            console.log('\n📦 TOP 5 ITEMS BY QUANTITY:');
            topByQuantity.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.name} - ${item.closingQty} ${item.baseUnits || ''} (Value: ₹${item.closingValue.toLocaleString()})`);
            });
            
            // Check for voucher data related to stocks
            const voucherCount = await TallyVoucher.countDocuments();
            const stockRelatedVouchers = await TallyVoucher.countDocuments({
                $or: [
                    { 'inventoryEntries.0': { $exists: true } },
                    { voucherType: { $in: ['Sales', 'Purchase', 'Stock Journal', 'Physical Stock'] } }
                ]
            });
            
            console.log('\n📋 VOUCHER ANALYSIS:');
            console.log(`   Total Vouchers: ${voucherCount}`);
            console.log(`   Stock-related Vouchers: ${stockRelatedVouchers}`);
            
            if (stockRelatedVouchers > 0) {
                const sampleVoucher = await TallyVoucher.findOne({
                    'inventoryEntries.0': { $exists: true }
                }).lean();
                
                if (sampleVoucher && sampleVoucher.inventoryEntries) {
                    console.log('\n📄 SAMPLE VOUCHER INVENTORY ENTRY:');
                    console.log(JSON.stringify(sampleVoucher.inventoryEntries[0], null, 2));
                }
            }
            
            return {
                statistics: {
                    totalStockItems,
                    activeStockItems,
                    stockItemsWithQty,
                    stockItemsWithValue,
                    voucherCount,
                    stockRelatedVouchers
                },
                fieldQuality: {
                    highQualityFields,
                    mediumQualityFields,
                    lowQualityFields
                },
                topItems: {
                    byValue: topByValue,
                    byQuantity: topByQuantity
                },
                stockStatusDistribution
            };
            
        } catch (error) {
            console.error('❌ Error analyzing existing stock data:', error);
            return null;
        }
    }

    async generateImprovedStockPayload() {
        console.log('\n🔧 Generating improved stock sync payload...\n');
        
        // Create a more targeted payload based on common Tally fields
        const improvedPayload = `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Enhanced Stock Items</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Enhanced Stock Items" ISMODIFY="No" ISFIXED="No">
                                <TYPE>StockItem</TYPE>
                                <CHILDOF>$$Owner</CHILDOF>
                                
                                <!-- Core Fields -->
                                <FETCH>Name, Parent, Alias, Category</FETCH>
                                <FETCH>BaseUnits, AdditionalUnits</FETCH>
                                <FETCH>OpeningBalance, OpeningQty, OpeningRate</FETCH>
                                <FETCH>ClosingBalance, ClosingQty, ClosingRate</FETCH>
                                
                                <!-- Pricing -->
                                <FETCH>StandardCostPrice, StandardSellingPrice</FETCH>
                                <FETCH>LastPurchaseRate, LastSalesRate</FETCH>
                                
                                <!-- Stock Control -->
                                <FETCH>ReorderLevel, MinimumOrderQty, MaximumOrderQty</FETCH>
                                
                                <!-- Classification -->
                                <FETCH>StockGroup, StockCategory</FETCH>
                                <FETCH>ItemCode, PartNo, Description</FETCH>
                                
                                <!-- Tax Info -->
                                <FETCH>GSTApplicable, HSNCode, GSTTypeOfSupply</FETCH>
                                
                                <!-- Flags -->
                                <FETCH>IsMaintainBatch, IsPerishableOn</FETCH>
                                
                                <!-- Dates -->
                                <FETCH>LastModified, LastStockDate</FETCH>
                                <FETCH>LastPurchaseDate, LastSalesDate</FETCH>
                                
                                <!-- System -->
                                <FETCH>GUID, MasterID, AlterID</FETCH>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
        
        console.log('✅ Generated improved stock sync payload');
        return improvedPayload;
    }

    async suggestUIImprovements() {
        console.log('\n💡 UI IMPROVEMENT SUGGESTIONS:\n');
        console.log('='.repeat(80));
        
        console.log('🎨 DASHBOARD IMPROVEMENTS:');
        console.log('   ✅ Add stock alerts for low/critical stock items');
        console.log('   ✅ Show top movers by value and quantity');
        console.log('   ✅ Add stock status distribution chart');
        console.log('   ✅ Display recent stock movements from vouchers');
        console.log('   ✅ Add quick search and filters');
        
        console.log('\n📊 MANAGE STOCKS IMPROVEMENTS:');
        console.log('   ✅ Expandable rows with detailed information');
        console.log('   ✅ Action buttons: Edit, View History, Set Alerts');
        console.log('   ✅ Bulk operations: Export, Update Status');
        console.log('   ✅ Advanced filtering: By group, category, status');
        console.log('   ✅ Sorting by value, quantity, last updated');
        console.log('   ✅ Stock movement tracking from vouchers');
        
        console.log('\n🔍 DETAILED VIEW ENHANCEMENTS:');
        console.log('   ✅ Stock movement history (from vouchers)');
        console.log('   ✅ Pricing trends and analysis');
        console.log('   ✅ Vendor/supplier information');
        console.log('   ✅ Batch/godown details if available');
        console.log('   ✅ Tax and compliance information');
        console.log('   ✅ Reorder suggestions based on history');
        
        console.log('\n📱 RESPONSIVE DESIGN:');
        console.log('   ✅ Mobile-friendly table design');
        console.log('   ✅ Touch-friendly action buttons');
        console.log('   ✅ Collapsible columns for smaller screens');
        
        return {
            dashboard: [
                'Stock alerts system',
                'Top movers display',
                'Status distribution chart',
                'Recent movements',
                'Quick search/filters'
            ],
            manageStocks: [
                'Expandable rows',
                'Action buttons',
                'Bulk operations',
                'Advanced filtering',
                'Movement tracking'
            ],
            detailedView: [
                'Movement history',
                'Pricing trends',
                'Vendor information',
                'Batch details',
                'Tax information',
                'Reorder suggestions'
            ]
        };
    }
}

// Main execution
async function main() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB\n');

        const analyzer = new ExistingStockAnalyzer();
        
        // Analyze existing data
        const analysisResults = await analyzer.analyzeExistingStockData();
        
        if (analysisResults) {
            // Generate improved payload
            const improvedPayload = await analyzer.generateImprovedStockPayload();
            
            // Suggest UI improvements
            const uiSuggestions = await analyzer.suggestUIImprovements();
            
            // Save results
            const fs = require('fs');
            const outputDir = path.join(__dirname, 'analysis-results');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const resultsFile = path.join(outputDir, `existing-stock-analysis-${timestamp}.json`);
            const payloadFile = path.join(outputDir, `improved-stock-payload-${timestamp}.xml`);
            
            const completeResults = {
                ...analysisResults,
                uiSuggestions,
                timestamp: new Date().toISOString()
            };
            
            fs.writeFileSync(resultsFile, JSON.stringify(completeResults, null, 2));
            if (improvedPayload) {
                fs.writeFileSync(payloadFile, improvedPayload);
            }
            
            console.log(`\n💾 Analysis results saved to: ${resultsFile}`);
            if (improvedPayload) {
                console.log(`💾 Improved payload saved to: ${payloadFile}`);
            }
        }
        
        console.log('\n🎉 Existing stock data analysis completed!');
        
    } catch (error) {
        console.error('❌ Analysis error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Export for use in other modules
module.exports = ExistingStockAnalyzer;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}