/**
 * Test Enhanced Stock Extraction Service
 * Tests the new enhanced stock extraction and MongoDB sync functionality
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const EnhancedStockExtractionService = require('../services/enhancedStockExtractionService');
const TallyStockItem = require('../models/tallyStockItem.model');

class EnhancedStockTestRunner {
    constructor() {
        console.log('🧪 Initializing Enhanced Stock Test Runner...\n');
        this.extractionService = new EnhancedStockExtractionService();
        this.testCompanyId = '68b9755e578bec07fd1ca54d'; // Default company ID from analysis
    }

    async runFullTest() {
        console.log('🚀 Starting Full Enhanced Stock Extraction Test...\n');
        console.log('='.repeat(80));
        
        try {
            // Step 1: Test Tally Connection
            await this.testTallyConnection();
            
            // Step 2: Test Enhanced Extraction
            const extractionResult = await this.testEnhancedExtraction();
            
            // Step 3: Test MongoDB Sync
            if (extractionResult.success) {
                await this.testMongoDBSync();
            }
            
            // Step 4: Verify Data Quality
            await this.verifyDataQuality();
            
            // Step 5: Performance Analysis
            await this.performanceAnalysis();
            
            console.log('\n🎉 Full Enhanced Stock Test Completed Successfully!');
            
        } catch (error) {
            console.error('❌ Test failed:', error);
        }
    }

    async testTallyConnection() {
        console.log('🔗 STEP 1: Testing Tally Connection...\n');
        
        try {
            const connectionResult = await this.extractionService.testConnection();
            
            if (connectionResult.success) {
                console.log('✅ Tally connection successful');
                console.log(`📊 Connected to: ${connectionResult.data?.companyName || 'Unknown Company'}`);
                console.log(`🏢 Financial Year: ${connectionResult.data?.financialYear || 'Unknown'}\n`);
            } else {
                throw new Error(`Connection failed: ${connectionResult.message}`);
            }
        } catch (error) {
            console.error('❌ Tally connection test failed:', error);
            throw error;
        }
    }

    async testEnhancedExtraction() {
        console.log('📡 STEP 2: Testing Enhanced Stock Extraction...\n');
        
        try {
            const startTime = Date.now();
            const extractionResult = await this.extractionService.extractEnhancedStockItems();
            const extractionTime = Date.now() - startTime;
            
            if (extractionResult.success) {
                console.log('✅ Enhanced extraction successful');
                console.log(`📦 Extracted ${extractionResult.count} stock items`);
                console.log(`⏱️ Extraction time: ${extractionTime}ms`);
                console.log(`📊 Data timestamp: ${extractionResult.timestamp}\n`);
                
                // Analyze sample data
                if (extractionResult.data.length > 0) {
                    this.analyzeSampleData(extractionResult.data.slice(0, 3));
                }
                
                return extractionResult;
            } else {
                throw new Error(`Extraction failed: ${extractionResult.error}`);
            }
        } catch (error) {
            console.error('❌ Enhanced extraction test failed:', error);
            return { success: false, error: error.message };
        }
    }

    async testMongoDBSync() {
        console.log('🗄️ STEP 3: Testing MongoDB Sync...\n');
        
        try {
            const startTime = Date.now();
            const syncResult = await this.extractionService.syncEnhancedStockToMongoDB(this.testCompanyId);
            const syncTime = Date.now() - startTime;
            
            if (syncResult.success) {
                console.log('✅ MongoDB sync successful');
                console.log(`📊 Sync Statistics:`);
                console.log(`   Total items: ${syncResult.totalItems}`);
                console.log(`   Synced: ${syncResult.syncedCount}`);
                console.log(`   Created: ${syncResult.createdCount}`);
                console.log(`   Updated: ${syncResult.updatedCount}`);
                console.log(`   Errors: ${syncResult.errorCount}`);
                console.log(`   Success rate: ${syncResult.successRate}%`);
                console.log(`⏱️ Sync time: ${syncTime}ms\n`);
                
                return syncResult;
            } else {
                throw new Error(`Sync failed: ${syncResult.error}`);
            }
        } catch (error) {
            console.error('❌ MongoDB sync test failed:', error);
            return { success: false, error: error.message };
        }
    }

    async verifyDataQuality() {
        console.log('🔍 STEP 4: Verifying Data Quality...\n');
        
        try {
            // Get basic statistics
            const totalCount = await TallyStockItem.countDocuments({ companyId: this.testCompanyId });
            const withQuantity = await TallyStockItem.countDocuments({ 
                companyId: this.testCompanyId, 
                closingQty: { $gt: 0 } 
            });
            const withValue = await TallyStockItem.countDocuments({ 
                companyId: this.testCompanyId, 
                closingValue: { $gt: 0 } 
            });
            const withHSN = await TallyStockItem.countDocuments({ 
                companyId: this.testCompanyId, 
                hsnCode: { $exists: true, $ne: '' } 
            });
            
            // Status distribution
            const statusDistribution = await TallyStockItem.aggregate([
                { $match: { companyId: mongoose.Types.ObjectId(this.testCompanyId) } },
                { $group: { _id: '$stockStatus', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            
            // Top items by value
            const topValueItems = await TallyStockItem.find({ 
                companyId: this.testCompanyId,
                closingValue: { $gt: 0 }
            })
            .select('name closingValue closingQty baseUnits')
            .sort({ closingValue: -1 })
            .limit(5)
            .lean();
            
            console.log('📊 DATA QUALITY REPORT:');
            console.log('='.repeat(50));
            console.log(`Total items in database: ${totalCount}`);
            console.log(`Items with quantity > 0: ${withQuantity} (${((withQuantity/totalCount)*100).toFixed(1)}%)`);
            console.log(`Items with value > 0: ${withValue} (${((withValue/totalCount)*100).toFixed(1)}%)`);
            console.log(`Items with HSN Code: ${withHSN} (${((withHSN/totalCount)*100).toFixed(1)}%)`);
            
            console.log('\n📈 Stock Status Distribution:');
            statusDistribution.forEach(status => {
                console.log(`   ${status._id}: ${status.count} items`);
            });
            
            console.log('\n💰 Top 5 Items by Value:');
            topValueItems.forEach((item, index) => {
                console.log(`   ${index + 1}. ${item.name} - ₹${item.closingValue.toLocaleString()} (${item.closingQty} ${item.baseUnits || 'units'})`);
            });
            
            console.log('');
            
        } catch (error) {
            console.error('❌ Data quality verification failed:', error);
        }
    }

    async performanceAnalysis() {
        console.log('⚡ STEP 5: Performance Analysis...\n');
        
        try {
            // Database query performance tests
            const queries = [
                { name: 'Find all items', query: {} },
                { name: 'Find items in stock', query: { closingQty: { $gt: 0 } } },
                { name: 'Find critical stock', query: { stockStatus: 'Critical Stock' } },
                { name: 'Find items with HSN', query: { hsnCode: { $exists: true, $ne: '' } } },
                { name: 'Text search', query: { name: { $regex: 'DIGITAL', $options: 'i' } } }
            ];
            
            console.log('🏁 Query Performance Tests:');
            console.log('='.repeat(40));
            
            for (const test of queries) {
                const startTime = Date.now();
                const count = await TallyStockItem.countDocuments({ 
                    companyId: this.testCompanyId,
                    ...test.query 
                });
                const queryTime = Date.now() - startTime;
                
                console.log(`${test.name}: ${count} results in ${queryTime}ms`);
            }
            
            // Index analysis
            const indexStats = await TallyStockItem.collection.getIndexes();
            console.log(`\n📇 Database Indexes: ${Object.keys(indexStats).length} indexes`);
            Object.keys(indexStats).forEach(indexName => {
                console.log(`   ${indexName}: ${JSON.stringify(indexStats[indexName])}`);
            });
            
            console.log('');
            
        } catch (error) {
            console.error('❌ Performance analysis failed:', error);
        }
    }

    analyzeSampleData(sampleItems) {
        console.log('🔬 Sample Data Analysis:');
        console.log('='.repeat(40));
        
        sampleItems.forEach((item, index) => {
            console.log(`\nSample Item ${index + 1}: ${item.name}`);
            console.log(`   Quantity: ${item.closingQty} ${item.baseUnits || 'units'}`);
            console.log(`   Value: ₹${item.closingValue?.toLocaleString()}`);
            console.log(`   Status: ${item.stockStatus}`);
            console.log(`   Group: ${item.stockGroup || 'N/A'}`);
            console.log(`   HSN Code: ${item.hsnCode || 'N/A'}`);
            console.log(`   GST Applicable: ${item.gstApplicable || 'N/A'}`);
            console.log(`   Cost Price: ₹${item.costPrice?.toLocaleString() || '0'}`);
            console.log(`   Selling Price: ₹${item.sellingPrice?.toLocaleString() || '0'}`);
            console.log(`   Reorder Level: ${item.reorderLevel || 'Not set'}`);
            console.log(`   Batch Maintained: ${item.isMaintainBatch || 'No'}`);
            console.log(`   Last Updated: ${item.lastUpdated}`);
        });
        
        console.log('');
    }

    async quickTestExtraction() {
        console.log('⚡ Running Quick Test (Extraction Only)...\n');
        
        try {
            await this.testTallyConnection();
            await this.testEnhancedExtraction();
            
            console.log('✅ Quick test completed successfully!');
            
        } catch (error) {
            console.error('❌ Quick test failed:', error);
        }
    }

    async quickTestDatabase() {
        console.log('🗄️ Running Database Test (Existing Data)...\n');
        
        try {
            await this.verifyDataQuality();
            await this.performanceAnalysis();
            
            console.log('✅ Database test completed successfully!');
            
        } catch (error) {
            console.error('❌ Database test failed:', error);
        }
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

        const testRunner = new EnhancedStockTestRunner();
        
        // Check command line arguments
        const args = process.argv.slice(2);
        const testType = args[0] || 'full';
        
        switch (testType.toLowerCase()) {
            case 'extraction':
            case 'extract':
                await testRunner.quickTestExtraction();
                break;
            case 'database':
            case 'db':
                await testRunner.quickTestDatabase();
                break;
            case 'full':
            default:
                await testRunner.runFullTest();
                break;
        }
        
    } catch (error) {
        console.error('❌ Test execution error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

// Export for use in other modules
module.exports = EnhancedStockTestRunner;

// Run if called directly
if (require.main === module) {
    console.log('🎯 Enhanced Stock Extraction Test Suite');
    console.log('Arguments: node testEnhancedStock.js [full|extraction|database]');
    console.log('');
    main().catch(console.error);
}