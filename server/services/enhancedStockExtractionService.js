const TallyService = require('./tallyService');
const TallyStockItem = require('../models/tallyStockItem.model');
const mongoose = require('mongoose');

/**
 * Enhanced Stock Extraction Service
 * Provides advanced stock data extraction and synchronization from Tally
 */
class EnhancedStockExtractionService extends TallyService {
    constructor() {
        super();
        this.batchSize = 100; // Process in batches to prevent memory issues
        this.maxRetries = 3;
    }

    /**
     * Enhanced stock extraction payload with optimized fields based on analysis
     */
    getEnhancedStockItemsPayload() {
        return `
        <ENVELOPE>
            <HEADER>
                <VERSION>1</VERSION>
                <TALLYREQUEST>Export</TALLYREQUEST>
                <TYPE>Collection</TYPE>
                <ID>Enhanced Stock Items Extraction</ID>
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
                                
                                <!-- Core Stock Information (High Priority) -->
                                <NATIVEMETHOD>NAME</NATIVEMETHOD>
                                <NATIVEMETHOD>ALIASNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARENT</NATIVEMETHOD>
                                <NATIVEMETHOD>CATEGORY</NATIVEMETHOD>
                                <NATIVEMETHOD>STOCKGROUP</NATIVEMETHOD>
                                
                                <!-- Quantity and Value Fields -->
                                <NATIVEMETHOD>CLOSINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCEQTY</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGBALANCEVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>CLOSINGRATE</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGBALANCE</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGBALANCEQTY</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGBALANCEVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>OPENINGRATE</NATIVEMETHOD>
                                
                                <!-- Units and Measurement -->
                                <NATIVEMETHOD>BASEUNITS</NATIVEMETHOD>
                                <NATIVEMETHOD>ADDITIONALUNITS</NATIVEMETHOD>
                                <NATIVEMETHOD>DENOMINATOR</NATIVEMETHOD>
                                <NATIVEMETHOD>CONVERSION</NATIVEMETHOD>
                                
                                <!-- Pricing Information -->
                                <NATIVEMETHOD>STANDARDCOSTPRICE</NATIVEMETHOD>
                                <NATIVEMETHOD>STANDARDSELLINGPRICE</NATIVEMETHOD>
                                <NATIVEMETHOD>LASTPURCHASERATE</NATIVEMETHOD>
                                <NATIVEMETHOD>LASTSALESRATE</NATIVEMETHOD>
                                <NATIVEMETHOD>MRP</NATIVEMETHOD>
                                
                                <!-- Stock Control -->
                                <NATIVEMETHOD>REORDERLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>MINLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>MAXLEVEL</NATIVEMETHOD>
                                <NATIVEMETHOD>REORDERBASE</NATIVEMETHOD>
                                <NATIVEMETHOD>REORDERQTY</NATIVEMETHOD>
                                
                                <!-- Classification and Codes -->
                                <NATIVEMETHOD>STOCKITEMCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>DESCRIPTION</NATIVEMETHOD>
                                <NATIVEMETHOD>NARRATION</NATIVEMETHOD>
                                <NATIVEMETHOD>HSNCODE</NATIVEMETHOD>
                                <NATIVEMETHOD>HSNMASTERNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>PARTNO</NATIVEMETHOD>
                                <NATIVEMETHOD>MODELNO</NATIVEMETHOD>
                                <NATIVEMETHOD>BRANDNAME</NATIVEMETHOD>
                                
                                <!-- Tax and GST Information -->
                                <NATIVEMETHOD>GSTAPPLICABLE</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTTYPEOFSUPPLY</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTGOODSORSRVCTYPE</NATIVEMETHOD>
                                <NATIVEMETHOD>TAXCLASSIFICATIONNAME</NATIVEMETHOD>
                                <NATIVEMETHOD>VATCOMMODITY</NATIVEMETHOD>
                                <NATIVEMETHOD>VATCOMMODITYCODE</NATIVEMETHOD>
                                
                                <!-- Costing and Valuation -->
                                <NATIVEMETHOD>COSTINGMETHOD</NATIVEMETHOD>
                                <NATIVEMETHOD>VALUATIONMETHOD</NATIVEMETHOD>
                                <NATIVEMETHOD>AFFECTSSTOCKVALUE</NATIVEMETHOD>
                                <NATIVEMETHOD>COSTPERCENT</NATIVEMETHOD>
                                
                                <!-- Batch and Godown Information -->
                                <NATIVEMETHOD>ISMAINTAINBATCH</NATIVEMETHOD>
                                <NATIVEMETHOD>ISPERISHABLEON</NATIVEMETHOD>
                                <NATIVEMETHOD>HASMFGDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>ALLOWUSEOFEXPIREDITEMS</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNOREBATCHES</NATIVEMETHOD>
                                <NATIVEMETHOD>IGNOREGODOWNS</NATIVEMETHOD>
                                
                                <!-- Manufacturing and Purchase Flags -->
                                <NATIVEMETHOD>FORPURCHASE</NATIVEMETHOD>
                                <NATIVEMETHOD>FORSALES</NATIVEMETHOD>
                                <NATIVEMETHOD>FORPRODUCTION</NATIVEMETHOD>
                                <NATIVEMETHOD>TREATSALESASMANUFACTURED</NATIVEMETHOD>
                                <NATIVEMETHOD>TREATPURCHASESASCONSUMED</NATIVEMETHOD>
                                <NATIVEMETHOD>TREATREJECTSASSCRAP</NATIVEMETHOD>
                                
                                <!-- System Fields -->
                                <NATIVEMETHOD>GUID</NATIVEMETHOD>
                                <NATIVEMETHOD>MASTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>ALTERID</NATIVEMETHOD>
                                <NATIVEMETHOD>LASTMODIFIED</NATIVEMETHOD>
                                <NATIVEMETHOD>CREATED</NATIVEMETHOD>
                                
                                <!-- Date Information -->
                                <NATIVEMETHOD>LASTSTOCKDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>LASTPURCHASEDATE</NATIVEMETHOD>
                                <NATIVEMETHOD>LASTSALEDATE</NATIVEMETHOD>
                                
                                <!-- Complex Lists (if supported) -->
                                <NATIVEMETHOD>BATCHALLOCATIONS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GODOWNBALANCE.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>STANDARDCOSTLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>STANDARDPRICELIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>GSTCLASSIFICATION.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>VATCLASSIFICATIONLIST.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>PRICEDETAILS.LIST</NATIVEMETHOD>
                                <NATIVEMETHOD>ADDITIONALUNITS.LIST</NATIVEMETHOD>
                                
                            </COLLECTION>
                        </TDLMESSAGE>
                    </TDL>
                </DESC>
            </BODY>
        </ENVELOPE>`;
    }

    /**
     * Enhanced stock normalization with better data processing
     */
    normalizeEnhancedStockItems(parsed) {
        const collection = this.findCollection(parsed);
        if (!collection) {
            console.log('❌ No collection found in response');
            return [];
        }

        let items = collection.STOCKITEM ?? collection.StockItem ?? null;
        if (!items && Array.isArray(collection)) {
            items = collection;
        }
        
        if (!items) {
            console.log('❌ No stock items found in collection');
            console.log('📋 Available collection keys:', Object.keys(collection));
            return [];
        }
        
        if (!Array.isArray(items)) items = [items];

        console.log(`📦 Processing ${items.length} stock items...`);

        return items.map((item, index) => {
            try {
                // Core information
                const name = this.safeString(item.NAME ?? item.STOCKITEMNAME ?? '');
                const aliasName = this.safeString(item.ALIASNAME ?? '');
                const description = this.safeString(item.DESCRIPTION ?? item.NARRATION ?? '');
                
                // Enhanced quantity and value parsing
                const closingValue = this.safeNumber(item.CLOSINGBALANCEVALUE ?? item.CLOSINGVALUE ?? item.CLOSINGBALANCE ?? 0);
                const closingQty = this.safeNumber(item.CLOSINGBALANCEQTY ?? item.CLOSINGQTY ?? item.CLOSINGBALANCE ?? 0);
                const openingValue = this.safeNumber(item.OPENINGBALANCEVALUE ?? item.OPENINGVALUE ?? item.OPENINGBALANCE ?? 0);
                const openingQty = this.safeNumber(item.OPENINGBALANCEQTY ?? item.OPENINGQTY ?? item.OPENINGBALANCE ?? 0);
                
                // Rate calculations
                const closingRate = this.safeNumber(item.CLOSINGRATE ?? (closingQty > 0 ? closingValue / closingQty : 0));
                const openingRate = this.safeNumber(item.OPENINGRATE ?? (openingQty > 0 ? openingValue / openingQty : 0));
                
                // Units and conversion
                const baseUnits = this.safeString(item.BASEUNITS ?? item.UNITS ?? '');
                const additionalUnits = this.safeString(item.ADDITIONALUNITS ?? '');
                const denominator = this.safeNumber(item.DENOMINATOR ?? 1);
                const conversion = this.safeNumber(item.CONVERSION ?? 1);
                
                // Enhanced pricing information
                const standardCostPrice = this.safeNumber(item.STANDARDCOSTPRICE ?? 0);
                const standardSellingPrice = this.safeNumber(item.STANDARDSELLINGPRICE ?? 0);
                const lastPurchaseRate = this.safeNumber(item.LASTPURCHASERATE ?? 0);
                const lastSalesRate = this.safeNumber(item.LASTSALESRATE ?? 0);
                const mrp = this.safeNumber(item.MRP ?? 0);
                
                // Stock control levels
                const reorderLevel = this.safeNumber(item.REORDERLEVEL ?? 0);
                const minLevel = this.safeNumber(item.MINLEVEL ?? 0);
                const maxLevel = this.safeNumber(item.MAXLEVEL ?? 0);
                const reorderQty = this.safeNumber(item.REORDERQTY ?? 0);
                
                // Categories and grouping
                const parent = this.safeString(item.PARENT ?? '');
                const category = this.safeString(item.CATEGORY ?? '');
                const stockGroup = this.safeString(item.STOCKGROUP ?? parent ?? category ?? '');
                
                // Identifiers and codes
                const guid = this.safeString(item.GUID ?? '');
                const masterId = this.safeString(item.MASTERID ?? '');
                const alterId = this.safeString(item.ALTERID ?? '');
                const stockItemCode = this.safeString(item.STOCKITEMCODE ?? '');
                const partNo = this.safeString(item.PARTNO ?? '');
                const modelNo = this.safeString(item.MODELNO ?? '');
                const brandName = this.safeString(item.BRANDNAME ?? '');
                
                // Enhanced tax and GST information
                const gstApplicable = this.safeString(item.GSTAPPLICABLE ?? 'No');
                const gstTypeOfSupply = this.safeString(item.GSTTYPEOFSUPPLY ?? '');
                const gstGoodsOrSrvcType = this.safeString(item.GSTGOODSORSRVCTYPE ?? '');
                const hsnCode = this.safeString(item.HSNCODE ?? '');
                const hsnMasterName = this.safeString(item.HSNMASTERNAME ?? '');
                const taxClassification = this.safeString(item.TAXCLASSIFICATIONNAME ?? '');
                const vatCommodity = this.safeString(item.VATCOMMODITY ?? '');
                const vatCommodityCode = this.safeString(item.VATCOMMODITYCODE ?? '');
                
                // Costing and valuation methods
                const costingMethod = this.safeString(item.COSTINGMETHOD ?? 'Avg. Cost');
                const valuationMethod = this.safeString(item.VALUATIONMETHOD ?? 'Avg. Price');
                const affectsStockValue = this.safeString(item.AFFECTSSTOCKVALUE ?? 'Yes');
                const costPercent = this.safeNumber(item.COSTPERCENT ?? 0);
                
                // Boolean flags for stock management
                const isMaintainBatch = this.safeString(item.ISMAINTAINBATCH ?? 'No');
                const isPerishableOn = this.safeString(item.ISPERISHABLEON ?? 'No');
                const hasMfgDate = this.safeString(item.HASMFGDATE ?? 'No');
                const allowUseOfExpiredItems = this.safeString(item.ALLOWUSEOFEXPIREDITEMS ?? 'No');
                const ignoreBatches = this.safeString(item.IGNOREBATCHES ?? 'No');
                const ignoreGodowns = this.safeString(item.IGNOREGODOWNS ?? 'No');
                
                // Usage flags
                const forPurchase = this.safeString(item.FORPURCHASE ?? 'Yes');
                const forSales = this.safeString(item.FORSALES ?? 'Yes');
                const forProduction = this.safeString(item.FORPRODUCTION ?? 'No');
                const treatSalesAsManufactured = this.safeString(item.TREATSALESASMANUFACTURED ?? 'No');
                const treatPurchasesAsConsumed = this.safeString(item.TREATPURCHASESASCONSUMED ?? 'No');
                const treatRejectsAsScrap = this.safeString(item.TREATREJECTSASSCRAP ?? 'No');
                
                // Date information
                const lastModified = item.LASTMODIFIED ? new Date(item.LASTMODIFIED) : new Date();
                const created = item.CREATED ? new Date(item.CREATED) : new Date();
                const lastStockDate = item.LASTSTOCKDATE ? new Date(item.LASTSTOCKDATE) : null;
                const lastPurchaseDate = item.LASTPURCHASEDATE ? new Date(item.LASTPURCHASEDATE) : null;
                const lastSaleDate = item.LASTSALEDATE ? new Date(item.LASTSALEDATE) : null;
                
                // Enhanced stock status calculation
                const stockStatus = this.calculateEnhancedStockStatus(closingQty, reorderLevel, minLevel, maxLevel);
                
                // Process complex lists
                const batchWiseDetails = this.processBatchAllocations(item['BATCHALLOCATIONS.LIST']);
                const godownDetails = this.processGodownBalance(item['GODOWNBALANCE.LIST']);
                const priceDetails = this.processPriceDetails(item['PRICEDETAILS.LIST']);
                const gstDetails = this.processGSTClassification(item['GSTCLASSIFICATION.LIST']);
                const vatDetails = this.processVATClassification(item['VATCLASSIFICATIONLIST.LIST']);
                
                return {
                    // Core information
                    name,
                    aliasName,
                    description,
                    
                    // Quantity and value
                    closingValue,
                    closingQty,
                    openingValue,
                    openingQty,
                    closingRate,
                    openingRate,
                    
                    // Units
                    baseUnits,
                    additionalUnits,
                    denominator,
                    conversionFactor: conversion,
                    
                    // Enhanced pricing
                    costPrice: standardCostPrice || lastPurchaseRate || 0,
                    sellingPrice: standardSellingPrice || lastSalesRate || 0,
                    standardCostPrice,
                    standardSellingPrice,
                    lastPurchaseRate,
                    lastSalesRate,
                    mrp,
                    
                    // Stock control
                    reorderLevel,
                    minimumLevel: minLevel,
                    maximumLevel: maxLevel,
                    reorderQty,
                    
                    // Categories
                    parent,
                    category,
                    stockGroup,
                    
                    // Identifiers
                    guid,
                    masterId,
                    alterid: alterId,
                    stockItemCode,
                    partNumber: partNo,
                    modelNumber: modelNo,
                    brandName,
                    
                    // Tax information
                    gstApplicable,
                    gstTypeOfSupply,
                    gstGoodsOrSrvcType,
                    hsnCode,
                    hsnMasterName,
                    taxClassification,
                    vatCommodity,
                    vatCommodityCode,
                    
                    // Costing
                    costingMethod,
                    valuationMethod,
                    affectsStockValue,
                    costPercent,
                    
                    // Boolean flags
                    isMaintainBatch,
                    isPerishableOn,
                    hasMfgDate,
                    allowUseOfExpiredItems,
                    ignoreBatches,
                    ignoreGodowns,
                    forPurchase,
                    forSales,
                    forProduction,
                    treatSalesAsManufactured,
                    treatPurchasesAsConsumed,
                    treatRejectsAsScrap,
                    
                    // Dates
                    lastModified,
                    created,
                    lastStockDate,
                    lastPurchaseDate,
                    lastSaleDate,
                    
                    // Processed details
                    batchWiseDetails,
                    godownDetails,
                    priceDetails,
                    gstDetails,
                    vatDetails,
                    
                    // Enhanced stock status
                    stockStatus,
                    
                    // System fields
                    isActive: true,
                    lastUpdated: new Date(),
                    year: new Date().getFullYear(),
                    
                    // Raw data for debugging
                    rawData: item
                };
            } catch (error) {
                console.error(`❌ Error processing stock item ${index + 1}:`, error);
                return null;
            }
        }).filter(item => item !== null);
    }

    /**
     * Enhanced stock status calculation
     */
    calculateEnhancedStockStatus(closingQty, reorderLevel, minLevel, maxLevel) {
        if (closingQty <= 0) return 'Out of Stock';
        if (reorderLevel > 0 && closingQty <= reorderLevel) return 'Critical Stock';
        if (minLevel > 0 && closingQty <= minLevel) return 'Low Stock';
        if (maxLevel > 0 && closingQty >= maxLevel) return 'Overstock';
        if (closingQty > 0) return 'In Stock';
        return 'Unknown';
    }

    /**
     * Process batch allocations
     */
    processBatchAllocations(batchData) {
        if (!batchData) return [];
        const batches = Array.isArray(batchData) ? batchData : [batchData];
        return batches.map(batch => ({
            batchName: this.safeString(batch.BATCHNAME ?? ''),
            godownName: this.safeString(batch.GODOWNNAME ?? ''),
            quantity: this.safeNumber(batch.BATCHQTY ?? batch.QUANTITY ?? 0),
            rate: this.safeNumber(batch.RATE ?? 0),
            amount: this.safeNumber(batch.AMOUNT ?? 0),
            manufacturingDate: batch.MFGDATE ? new Date(batch.MFGDATE) : null,
            expiryDate: batch.EXPDATE ? new Date(batch.EXPDATE) : null
        }));
    }

    /**
     * Process godown balance
     */
    processGodownBalance(godownData) {
        if (!godownData) return [];
        const godowns = Array.isArray(godownData) ? godownData : [godownData];
        return godowns.map(godown => ({
            godownName: this.safeString(godown.GODOWNNAME ?? ''),
            quantity: this.safeNumber(godown.QUANTITY ?? 0),
            rate: this.safeNumber(godown.RATE ?? 0),
            amount: this.safeNumber(godown.AMOUNT ?? 0)
        }));
    }

    /**
     * Process price details
     */
    processPriceDetails(priceData) {
        if (!priceData) return [];
        const prices = Array.isArray(priceData) ? priceData : [priceData];
        return prices.map(price => ({
            date: price.DATE ? new Date(price.DATE) : null,
            rate: this.safeNumber(price.RATE ?? 0),
            rateType: this.safeString(price.RATETYPE ?? '')
        }));
    }

    /**
     * Process GST classification
     */
    processGSTClassification(gstData) {
        if (!gstData) return {};
        const gst = Array.isArray(gstData) ? gstData[0] : gstData;
        return {
            hsnDescription: this.safeString(gst.HSNDESCRIPTION ?? ''),
            taxabilityType: this.safeString(gst.TAXABILITYTYPE ?? ''),
            igstRate: this.safeNumber(gst.IGSTRATE ?? 0),
            cgstRate: this.safeNumber(gst.CGSTRATE ?? 0),
            sgstRate: this.safeNumber(gst.SGSTRATE ?? 0),
            cessRate: this.safeNumber(gst.CESSRATE ?? 0),
            cessOnQuantity: this.safeNumber(gst.CESSONQUANTITY ?? 0)
        };
    }

    /**
     * Process VAT classification
     */
    processVATClassification(vatData) {
        if (!vatData) return {};
        const vat = Array.isArray(vatData) ? vatData[0] : vatData;
        return {
            classificationName: this.safeString(vat.CLASSIFICATIONNAME ?? ''),
            taxType: this.safeString(vat.TAXTYPE ?? ''),
            taxRate: this.safeNumber(vat.TAXRATE ?? 0)
        };
    }

    /**
     * Enhanced stock extraction with better error handling
     */
    async extractEnhancedStockItems() {
        console.log('🚀 Starting enhanced stock extraction from Tally...\n');
        
        try {
            // Test connection first
            console.log('🔗 Testing Tally connection...');
            const connectionTest = await this.testConnection();
            if (!connectionTest.success) {
                throw new Error(`Tally connection failed: ${connectionTest.message}`);
            }
            console.log('✅ Tally connection successful\n');
            
            // Fetch enhanced stock data
            console.log('📡 Fetching enhanced stock data from Tally...');
            const xmlPayload = this.getEnhancedStockItemsPayload();
            const rawResponse = await this.sendRequest(xmlPayload, 0, this.maxRetries);
            
            console.log('✅ Raw stock data received');
            console.log(`📊 Raw response size: ${JSON.stringify(rawResponse).length} characters\n`);
            
            // Normalize enhanced data
            console.log('🔄 Processing and normalizing stock data...');
            const normalizedItems = this.normalizeEnhancedStockItems(rawResponse);
            
            if (!normalizedItems || normalizedItems.length === 0) {
                throw new Error('No stock items found in Tally response');
            }
            
            console.log(`✅ Successfully processed ${normalizedItems.length} stock items\n`);
            
            return {
                success: true,
                data: normalizedItems,
                count: normalizedItems.length,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Enhanced stock extraction failed:', error);
            return {
                success: false,
                error: error.message,
                data: [],
                count: 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Sync enhanced stock data to MongoDB with better error handling
     */
    async syncEnhancedStockToMongoDB(companyId) {
        console.log('🗄️ Starting enhanced stock sync to MongoDB...\n');
        
        try {
            // Extract enhanced stock data
            const extractionResult = await this.extractEnhancedStockItems();
            
            if (!extractionResult.success) {
                throw new Error(`Stock extraction failed: ${extractionResult.error}`);
            }
            
            const stockItems = extractionResult.data;
            console.log(`📦 Syncing ${stockItems.length} stock items to database...\n`);
            
            let syncedCount = 0;
            let updatedCount = 0;
            let createdCount = 0;
            let errorCount = 0;
            
            // Process in batches
            for (let i = 0; i < stockItems.length; i += this.batchSize) {
                const batch = stockItems.slice(i, i + this.batchSize);
                console.log(`📥 Processing batch ${Math.floor(i / this.batchSize) + 1}/${Math.ceil(stockItems.length / this.batchSize)} (${batch.length} items)...`);
                
                for (const item of batch) {
                    try {
                        // Enhanced query with better matching
                        const query = item.guid && item.guid.trim() !== '' 
                            ? { guid: item.guid, companyId }
                            : { name: item.name, companyId, $or: [{ guid: null }, { guid: '' }] };
                        
                        // Enhanced update data
                        const updateData = {
                            ...item,
                            companyId: mongoose.Types.ObjectId(companyId),
                            year: new Date().getFullYear(),
                            lastUpdated: new Date()
                        };
                        
                        const result = await TallyStockItem.updateOne(
                            query,
                            { $set: updateData },
                            { upsert: true }
                        );
                        
                        if (result.upsertedCount > 0) {
                            createdCount++;
                        } else if (result.modifiedCount > 0) {
                            updatedCount++;
                        }
                        syncedCount++;
                        
                    } catch (error) {
                        console.error(`❌ Error syncing item "${item.name}":`, error.message);
                        errorCount++;
                    }
                }
                
                // Progress update
                console.log(`   ✅ Batch complete. Progress: ${Math.min(i + this.batchSize, stockItems.length)}/${stockItems.length}`);
            }
            
            console.log('\n📊 SYNC SUMMARY:');
            console.log('='.repeat(50));
            console.log(`✅ Successfully synced: ${syncedCount} items`);
            console.log(`🆕 Created: ${createdCount} items`);
            console.log(`🔄 Updated: ${updatedCount} items`);
            console.log(`❌ Errors: ${errorCount} items`);
            console.log(`📈 Success rate: ${((syncedCount / stockItems.length) * 100).toFixed(2)}%`);
            
            return {
                success: true,
                totalItems: stockItems.length,
                syncedCount,
                createdCount,
                updatedCount,
                errorCount,
                successRate: ((syncedCount / stockItems.length) * 100).toFixed(2),
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Enhanced stock sync to MongoDB failed:', error);
            return {
                success: false,
                error: error.message,
                totalItems: 0,
                syncedCount: 0,
                createdCount: 0,
                updatedCount: 0,
                errorCount: 0,
                timestamp: new Date().toISOString()
            };
        }
    }
}

module.exports = EnhancedStockExtractionService;