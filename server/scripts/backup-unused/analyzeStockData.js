/**
 * Stock Data Analysis Script
 * Analyzes Tally stock item data structure to understand available fields
 */

const TallyService = require('../services/tallyService');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

class StockDataAnalyzer {
    constructor() {
        this.tallyService = new TallyService();
        // Hardcode Tally URL as requested
        this.tallyService.tallyUrl = 'http://192.168.0.191:9000';
        console.log(`🔗 Using hardcoded Tally URL: ${this.tallyService.tallyUrl}`);
    }

    // Enhanced stock payload to get ALL available data
    getComprehensiveStockPayload() {
        return `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Comprehensive Stock Analysis</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Comprehensive Stock Analysis" ISMODIFY="No">
                                <TYPE>StockItem</TYPE>
                                
                                <!-- Basic Information -->
                                <NATIVEMETHOD>NAME</NATIVEMETHOD>
                                <NATIVEMETHOD>ALIASNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENT</NATIVEMETHOD>
                                <NATIVEMETHOD>CATEGORY</NATIVEMETHOD>
                                <NATIVEMETHOD>STOCKGROUP</NATIVEMETHOD>
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                
                                <!-- Stock Quantities -->
                                <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGQTY</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGQTY</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGRATE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGRATE</NATIVEMETHOD>
                                
                                <!-- Units and Measurements -->
                                <NATIVEMETHOD>BASEUNITS</NATIVEMETHOD>
                                <NATIVEMETHOD>ADDITIONALUNITS</NATIVEMETHOD>
                                <NATIVEMETHOD>UNITS</NATIVEMETHOD>
                                <NATIVEMETHOD>DENOMINATOR</NATIVEMETHOD>
                                <NATIVEMETHOD>CONVERSION</NATIVEMETHOD>
                                
                                <!-- Stock Control -->
                                <NATIVEMETHOD>GODOWNNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>BATCHNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>REORDERLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>MINIMUMORDERQTY</NATIVEMETHOD>
                                <NATIVEMETHOD>MAXIMUMORDERQTY</NATIVEMETHOD>
                                <NATIVEMETHOD>REORDERQTY</NATIVEMETHOD>
                                
                                <!-- Sales Information -->
                                <NATIVEMETHOD>SELLINGPRICE</NATIVEMETHOD>
                                <NATIVEMETHOD>PURCHASEPRICE</NATIVEMETHOD>
                                <NATIVEMETHOD>MRP</NATIVEMETHOD>
                                <NATIVEMETHOD>COSTPRICE</NATIVEMETHOD>
                                <NATIVEMETHOD>STANDARDCOST</NATIVEMETHOD>
                                <NATIVEMETHOD>STANDARDPRICE</NATIVEMETHOD>
                                
                                <!-- Tax Information -->
                                <NATIVEMETHOD>GSTAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>HSNCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>HSNNO</NATIVEMETHOD>
                                <NATIVEMETHOD>TAXCLASSIFICATIONNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>VATDETAILS.LIST</NATIVEMETHOD>
                                
                                <!-- Inventory Entries and Movement -->
                                <NATIVEMETHOD>INVENTORYENTRIES.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>BATCHALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GODOWNENTRIES.LIST</NATIVEMETHOD>
                                
                                <!-- Manufacturing Information -->
                                <NATIVEMETHOD>BOMNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>BOMQTY</NATIVEMETHOD>
                                <NATIVEMETHOD>MANUFACTUREDBY</NATIVEMETHOD>
                                <NATIVEMETHOD>COSTOFPRODUCTION</NATIVEMETHOD>
                                
                                <!-- Vendor/Supplier Information -->
                                <NATIVEMETHOD>VENDORDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>PRIMARYVENDOR</NATIVEMETHOD>
                                <NATIVEMETHOD>SUPPLIERINFO</NATIVEMETHOD>
                                <NATIVEMETHOD>VENDORNAME</NATIVEMETHOD>
                                
                                <!-- Additional Details -->
                                <NATIVEMETHOD>DESCRIPTION</NATIVEMETHOD>
                                <NATIVEMETHOD>NARRATION</NATIVEMETHOD>
                                <NATIVEMETHOD>ITEMCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>BARCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>PARTNO</NATIVEMETHOD>
                                <NATIVEMETHOD>SERIALNO</NATIVEMETHOD>
                                <NATIVEMETHOD>BRANDNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>MODELNO</NATIVEMETHOD>
                                
                                <!-- Flags and Properties -->
                                <NATIVEMETHOD>ISMAINTAINBATCH</NATIVEMETHOD>
                                <NATIVEMETHOD>ISPERISHABLEON</NATIVEMETHOD>
                                <NATIVEMETHOD>ISUPDATINGTARGETID</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNOREPHYSICALDIFFERENCE</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNORENEGATIVESTOCK</NATIVEMETHOD>
                                <NATIVEMETHOD>TREATSALESASMANUFACTURED</NATIVEMETHOD>
                                <NATIVEMETHOD>TREATPURCHASESASCONSUMED</NATIVEMETHOD>
                                <NATIVEMETHOD>TREATREJECTSASSCRAP</NATIVEMETHOD>
                                
                                <!-- Date Information -->
                                <NATIVEMETHOD>LASTMODIFIED</NATIVEMETHOD>
                                <NATIVEMETHOD>CREATED</NATIVEMETHOD>
                                <NATIVEMETHOD>LASTSTOCKDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>LASTPURCHASEDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>LASTSALEDATE</NATIVEMETHOD>
                                
                                <!-- Additional Lists -->
                                <NATIVEMETHOD>LANGUAGENAME.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>PRICEDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>STOCKITEMUNITDETAILS.LIST</NATIVEMETHOD>
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    // Analyze raw stock data structure
    async analyzeStockStructure() {
        console.log('🔍 Starting comprehensive stock data analysis...\n');
        
        try {
            // Fetch raw stock data
            console.log('📡 Fetching comprehensive stock data from Tally...');
            const stockPayload = this.getComprehensiveStockPayload();
            const rawResponse = await this.tallyService.sendRequest(stockPayload, 0, 2);
            
            console.log('✅ Raw stock data received');
            console.log(`📊 Raw response size: ${JSON.stringify(rawResponse).length} characters\n`);
            
            // Parse and analyze structure
            const collection = this.findCollection(rawResponse);
            if (!collection) {
                console.log('❌ No collection found in response');
                return null;
            }
            
            // Get stock items
            let stockItems = collection.STOCKITEM ?? collection.StockItem ?? collection.stockitem ?? null;
            if (!stockItems && Array.isArray(collection)) {
                stockItems = collection;
            }
            
            if (!stockItems) {
                console.log('❌ No stock items found in collection');
                console.log('📋 Available collection keys:', Object.keys(collection));
                return null;
            }
            
            if (!Array.isArray(stockItems)) stockItems = [stockItems];
            
            console.log(`📦 Found ${stockItems.length} stock items to analyze\n`);
            
            // Analyze first few items in detail
            const analysisResults = {
                totalItems: stockItems.length,
                sampleSize: Math.min(5, stockItems.length),
                fieldAnalysis: {},
                dataQuality: {},
                uniqueValues: {},
                recommendations: []
            };
            
            console.log('🔬 Detailed analysis of sample stock items:\n');
            
            for (let i = 0; i < analysisResults.sampleSize; i++) {
                const item = stockItems[i];
                console.log(`--- Stock Item ${i + 1}: ${item.NAME || 'Unknown'} ---`);
                
                // Analyze all fields
                Object.keys(item).forEach(key => {
                    const value = item[key];
                    const valueType = typeof value;
                    const hasValue = value !== null && value !== undefined && value !== '';
                    
                    if (!analysisResults.fieldAnalysis[key]) {
                        analysisResults.fieldAnalysis[key] = {
                            found: 0,
                            types: new Set(),
                            sampleValues: [],
                            hasData: 0
                        };
                    }
                    
                    analysisResults.fieldAnalysis[key].found++;
                    analysisResults.fieldAnalysis[key].types.add(valueType);
                    
                    if (hasValue) {
                        analysisResults.fieldAnalysis[key].hasData++;
                        if (analysisResults.fieldAnalysis[key].sampleValues.length < 3) {
                            analysisResults.fieldAnalysis[key].sampleValues.push(value);
                        }
                    }
                    
                    console.log(`  ${key}: ${valueType} = ${JSON.stringify(value).substring(0, 100)}${JSON.stringify(value).length > 100 ? '...' : ''}`);
                });
                
                console.log(''); // Empty line between items
            }
            
            // Generate field summary
            console.log('📊 FIELD ANALYSIS SUMMARY:\n');
            console.log('='.repeat(80));
            
            const sortedFields = Object.keys(analysisResults.fieldAnalysis).sort();
            
            sortedFields.forEach(field => {
                const analysis = analysisResults.fieldAnalysis[field];
                const dataQuality = Math.round((analysis.hasData / analysis.found) * 100);
                const types = Array.from(analysis.types).join(', ');
                
                console.log(`Field: ${field}`);
                console.log(`  Data Quality: ${dataQuality}% (${analysis.hasData}/${analysis.found} items have data)`);
                console.log(`  Data Types: ${types}`);
                if (analysis.sampleValues.length > 0) {
                    console.log(`  Sample Values: ${analysis.sampleValues.map(v => JSON.stringify(v)).join(', ')}`);
                }
                console.log('');
                
                // Store for recommendations
                analysisResults.dataQuality[field] = dataQuality;
            });
            
            // Generate recommendations
            console.log('💡 RECOMMENDATIONS:\n');
            console.log('='.repeat(80));
            
            // High-value fields (>80% data quality)
            const highValueFields = Object.keys(analysisResults.dataQuality)
                .filter(field => analysisResults.dataQuality[field] >= 80)
                .sort((a, b) => analysisResults.dataQuality[b] - analysisResults.dataQuality[a]);
            
            console.log('🟢 HIGH-VALUE FIELDS (Use in UI):');
            highValueFields.forEach(field => {
                console.log(`  ✅ ${field} (${analysisResults.dataQuality[field]}% data quality)`);
            });
            
            // Medium-value fields (50-79% data quality)
            const mediumValueFields = Object.keys(analysisResults.dataQuality)
                .filter(field => analysisResults.dataQuality[field] >= 50 && analysisResults.dataQuality[field] < 80)
                .sort((a, b) => analysisResults.dataQuality[b] - analysisResults.dataQuality[a]);
            
            console.log('\n🟡 MEDIUM-VALUE FIELDS (Use with fallbacks):');
            mediumValueFields.forEach(field => {
                console.log(`  ⚠️ ${field} (${analysisResults.dataQuality[field]}% data quality)`);
            });
            
            // Low-value fields (<50% data quality)
            const lowValueFields = Object.keys(analysisResults.dataQuality)
                .filter(field => analysisResults.dataQuality[field] < 50)
                .sort((a, b) => analysisResults.dataQuality[b] - analysisResults.dataQuality[a]);
            
            console.log('\n🔴 LOW-VALUE FIELDS (Use only if needed):');
            lowValueFields.slice(0, 10).forEach(field => {
                console.log(`  ❌ ${field} (${analysisResults.dataQuality[field]}% data quality)`);
            });
            if (lowValueFields.length > 10) {
                console.log(`  ... and ${lowValueFields.length - 10} more low-value fields`);
            }
            
            // Generate specific recommendations
            console.log('\n🎯 SPECIFIC RECOMMENDATIONS FOR UI:\n');
            
            const recommendations = [];
            
            // Essential fields for stock management
            const essentialFields = ['NAME', 'CLOSINGQTY', 'CLOSINGVALUE', 'BASEUNITS', 'OPENINGQTY', 'OPENINGVALUE'];
            const missingEssential = essentialFields.filter(field => !highValueFields.includes(field));
            
            if (missingEssential.length === 0) {
                recommendations.push('✅ All essential stock fields have high-quality data');
            } else {
                recommendations.push(`⚠️ Essential fields with low data quality: ${missingEssential.join(', ')}`);
            }
            
            // Sales/vendor information
            const salesFields = ['SELLINGPRICE', 'PURCHASEPRICE', 'MRP', 'VENDORNAME', 'PRIMARYVENDOR'];
            const availableSalesFields = salesFields.filter(field => highValueFields.includes(field));
            
            if (availableSalesFields.length > 0) {
                recommendations.push(`💰 Sales info available: ${availableSalesFields.join(', ')}`);
            } else {
                recommendations.push('❌ Limited sales/vendor information available');
            }
            
            // Tax information
            const taxFields = ['HSNCODE', 'GSTAPPLICABLE', 'TAXCLASSIFICATIONNAME'];
            const availableTaxFields = taxFields.filter(field => highValueFields.includes(field));
            
            if (availableTaxFields.length > 0) {
                recommendations.push(`📋 Tax info available: ${availableTaxFields.join(', ')}`);
            }
            
            // Stock control
            const controlFields = ['REORDERLEVEL', 'MINIMUMORDERQTY', 'MAXIMUMORDERQTY'];
            const availableControlFields = controlFields.filter(field => highValueFields.includes(field));
            
            if (availableControlFields.length > 0) {
                recommendations.push(`⚙️ Stock control available: ${availableControlFields.join(', ')}`);
            }
            
            recommendations.forEach(rec => console.log(rec));
            
            console.log('\n📝 IMPLEMENTATION NOTES:\n');
            console.log('1. Focus on HIGH-VALUE fields for main UI display');
            console.log('2. Use MEDIUM-VALUE fields in detailed/expanded views');
            console.log('3. Implement fallback logic for missing data');
            console.log('4. Consider field combinations for better UX');
            console.log('5. Update stock model schema based on available fields');
            
            return analysisResults;
            
        } catch (error) {
            console.error('❌ Error analyzing stock structure:', error.message);
            console.error('Full error:', error);
            return null;
        }
    }

    // Helper method to find collection in parsed data
    findCollection(parsed) {
        const envelope = parsed?.ENVELOPE ?? parsed;
        const body = envelope?.BODY ?? envelope?.Body ?? envelope?.body;
        if (!body) return null;
        
        const data = body?.DATA ?? body?.Data ?? body?.data ?? null;
        if (!data) return null;
        
        const collection = Array.isArray(data) 
            ? (data[0]?.COLLECTION ?? data[0]?.Collection) 
            : (data.COLLECTION ?? data.Collection);
        
        return collection;
    }

    // Generate enhanced stock payload based on analysis
    generateOptimizedStockPayload(analysisResults) {
        console.log('\n🔧 Generating optimized stock payload based on analysis...\n');
        
        if (!analysisResults) {
            console.log('❌ No analysis results provided');
            return null;
        }
        
        // Get high and medium value fields
        const highValueFields = Object.keys(analysisResults.dataQuality)
            .filter(field => analysisResults.dataQuality[field] >= 80);
        
        const mediumValueFields = Object.keys(analysisResults.dataQuality)
            .filter(field => analysisResults.dataQuality[field] >= 50 && analysisResults.dataQuality[field] < 80);
        
        const recommendedFields = [...highValueFields, ...mediumValueFields.slice(0, 10)]; // Top 10 medium fields
        
        console.log(`📋 Including ${recommendedFields.length} high-quality fields in optimized payload`);
        
        const nativeMethods = recommendedFields.map(field => `                                <NATIVEMETHOD>${field}</NATIVEMETHOD>`).join('\n');
        
        const optimizedPayload = `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Optimized Stock Items</ID>
            </HEADER>
            <BODY>
                <DESC>
                    <STATICVARIABLES>
                        <SVEXPORTFORMAT>XML</SVEXPORTFORMAT>
                    </STATICVARIABLES>
                    <TDL>
                        <TDLMESSAGE>
                            <COLLECTION NAME="Optimized Stock Items" ISMODIFY="No">
                                <TYPE>StockItem</TYPE>
${nativeMethods}
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
        
        console.log('✅ Optimized payload generated');
        return optimizedPayload;
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

        // Initialize analyzer
        const analyzer = new StockDataAnalyzer();
        
        // Run comprehensive analysis
        const results = await analyzer.analyzeStockStructure();
        
        if (results) {
            // Generate optimized payload
            const optimizedPayload = analyzer.generateOptimizedStockPayload(results);
            
            // Save results to file for future reference
            const fs = require('fs');
            const path = require('path');
            
            const outputDir = path.join(__dirname, 'stock-analysis-results');
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir);
            }
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const resultsFile = path.join(outputDir, `stock-analysis-${timestamp}.json`);
            const payloadFile = path.join(outputDir, `optimized-payload-${timestamp}.xml`);
            
            fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
            if (optimizedPayload) {
                fs.writeFileSync(payloadFile, optimizedPayload);
            }
            
            console.log(`\n💾 Analysis results saved to: ${resultsFile}`);
            if (optimizedPayload) {
                console.log(`💾 Optimized payload saved to: ${payloadFile}`);
            }
        }
        
        console.log('\n🎉 Stock data analysis completed!');
        
    } catch (error) {
        console.error('❌ Main execution error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Export for use in other modules
module.exports = StockDataAnalyzer;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}
