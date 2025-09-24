const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Import models
const TallyVoucher = require('../models/tallyVoucher.model');
const Company = require('../models/company.model');
const Month = require('../models/month.model');

// Database configuration
const dbConfig = require('../config/db.config');

/**
 * Sales Data Import Script
 * Imports sales data from ODIN_SALE_REPORT_2023-2026.json into the voucher database
 * Follows the current TallyVoucher schema while preserving all important data
 */

class SalesDataImporter {
    constructor() {
        this.processedCount = 0;
        this.errorCount = 0;
        this.errors = [];
        this.batchSize = 100;
        this.defaultCompanyId = null;
        this.monthMappings = new Map();
    }

    /**
     * Connect to MongoDB database
     */
    async connectDatabase() {
        try {
            const mongoUri = `mongodb://${dbConfig.HOST}:${dbConfig.PORT}/${dbConfig.DB}`;
            await mongoose.connect(mongoUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log('✅ Connected to MongoDB successfully');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    /**
     * Setup default company and month mappings
     */
    async setupDefaults() {
        try {
            // Create or find default company
            let company = await Company.findOne({ name: 'VISHWAS SCIENTIFIC CO.' });
            if (!company) {
                company = new Company({
                    name: 'VISHWAS SCIENTIFIC CO.',
                    totalSales: 0,
                    totalSalesAmount: 0
                });
                await company.save();
                console.log('✅ Created default company');
            }
            this.defaultCompanyId = company._id;

            // Setup month mappings
            const months = await Month.find({});
            months.forEach(month => {
                this.monthMappings.set(month.name, month._id);
            });

            console.log('✅ Setup completed');
        } catch (error) {
            console.error('❌ Setup failed:', error.message);
            throw error;
        }
    }

    /**
     * Load and parse JSON data
     */
    loadJsonData() {
        try {
            const jsonPath = path.join(__dirname, 'ODIN_SALE_REPORT_2023-2026.json');
            console.log('📂 Loading data from:', jsonPath);
            
            const rawData = fs.readFileSync(jsonPath, 'utf8');
            const jsonData = JSON.parse(rawData);
            
            if (!jsonData.sheets || !jsonData.sheets['Sales Register']) {
                throw new Error('Invalid JSON structure: Missing Sales Register sheet');
            }
            
            const salesData = jsonData.sheets['Sales Register'];
            console.log(`📊 Found ${salesData.data.length} sales records`);
            
            return salesData;
        } catch (error) {
            console.error('❌ Failed to load JSON data:', error.message);
            throw error;
        }
    }

    /**
     * Parse and convert date strings
     */
    parseDate(dateString) {
        if (!dateString) return null;
        
        try {
            // Handle different date formats
            if (dateString === '1970-01-01T00:00:00' || dateString === '1969-12-31T23:59:59') {
                return null; // These are placeholder dates
            }
            
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? null : date;
        } catch (error) {
            return null;
        }
    }

    /**
     * Parse numeric values from string or number
     */
    parseNumericValue(value) {
        if (!value || value === '1970-01-01T00:00:00') return 0;
        
        if (typeof value === 'number') return value;
        if (typeof value === 'string') {
            // Try to extract number from string
            const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
            return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    }

    /**
     * Get month ID from date
     */
    getMonthId(date) {
        if (!date) return null;
        
        const monthName = date.toLocaleString('default', { month: 'long' });
        return this.monthMappings.get(monthName) || null;
    }

    /**
     * Transform JSON record to TallyVoucher format
     */
    transformToVoucher(record) {
        try {
            // Parse primary fields
            const voucherDate = this.parseDate(record['2025-07-01 00:00:00']);
            const party = record['VISHWAS SCIENTIFIC CO.,'] || 'Unknown';
            const voucherNumber = record['ODIN/01770'] || '';
            
            // Parse amounts
            const grossTotal = this.parseNumericValue(record['Gross Total']);
            const igstSale = this.parseNumericValue(record['IGST SALE']);
            const localSale = this.parseNumericValue(record['LOCAL SALE']);
            const quantity = this.parseNumericValue(record['Quantity']);
            const rate = this.parseNumericValue(record['Rate']);
            const value = this.parseNumericValue(record['Value']);

            // Calculate total amount (prefer Gross Total, fallback to Value or local/igst sales)
            let totalAmount = grossTotal;
            if (!totalAmount && value) totalAmount = value;
            if (!totalAmount) totalAmount = (localSale || 0) + (igstSale || 0);

            // Parse GST details
            const gstDetails = {
                cgstAmount: this.parseNumericValue(record['CGST OUTPUT']),
                sgstAmount: this.parseNumericValue(record['SGST OUTPUT']),
                igstAmount: this.parseNumericValue(record['IGST OUTPUT']),
                cessAmount: 0,
                totalTaxAmount: this.parseNumericValue(record['IGST OUTPUT']) + 
                               this.parseNumericValue(record['CGST OUTPUT']) + 
                               this.parseNumericValue(record['SGST OUTPUT']),
                placeOfSupply: record['Destination'] || '',
                gstinOfSupplier: '',
                gstinOfRecipient: ''
            };

            // Create inventory entry if quantity and rate exist
            const inventoryEntries = [];
            if (quantity && rate) {
                inventoryEntries.push({
                    stockItemName: 'Sales Item',
                    actualQuantity: quantity,
                    billedQuantity: quantity,
                    rate: rate,
                    amount: quantity * rate,
                    discount: this.parseNumericValue(record['TRADE DISOCUNT (SALE)']),
                    godownName: 'Main Godown'
                });
            }

            // Create ledger entries
            const ledgerEntries = [];
            
            // Customer/Party ledger entry (Debit)
            if (totalAmount) {
                ledgerEntries.push({
                    ledgerName: party,
                    amount: totalAmount,
                    isDebit: true,
                    billAllocations: []
                });
            }

            // Sales ledger entry (Credit)
            if (totalAmount && gstDetails.totalTaxAmount) {
                ledgerEntries.push({
                    ledgerName: 'Sales',
                    amount: totalAmount - gstDetails.totalTaxAmount,
                    isDebit: false,
                    billAllocations: []
                });
            }

            // GST ledger entries
            if (gstDetails.cgstAmount) {
                ledgerEntries.push({
                    ledgerName: 'CGST Output',
                    amount: gstDetails.cgstAmount,
                    isDebit: false,
                    billAllocations: []
                });
            }

            if (gstDetails.sgstAmount) {
                ledgerEntries.push({
                    ledgerName: 'SGST Output',
                    amount: gstDetails.sgstAmount,
                    isDebit: false,
                    billAllocations: []
                });
            }

            if (gstDetails.igstAmount) {
                ledgerEntries.push({
                    ledgerName: 'IGST Output',
                    amount: gstDetails.igstAmount,
                    isDebit: false,
                    billAllocations: []
                });
            }

            // Create voucher object
            const voucher = {
                date: voucherDate || new Date(),
                voucherNumber: voucherNumber,
                voucherType: 'Sales',
                voucherTypeName: 'Sales',
                party: party,
                partyledgername: party,
                amount: totalAmount,
                narration: `Sales to ${party}`,
                reference: record['Other References'] || '',
                
                // Enhanced fields
                voucherDate: voucherDate,
                effectiveDate: voucherDate,
                basicvoucherdate: voucherDate,
                
                // Inventory and ledger entries
                inventoryEntries: inventoryEntries,
                ledgerEntries: ledgerEntries,
                
                // GST details
                gstDetails: gstDetails,
                
                // Additional details stored in classificationData
                classificationData: {
                    deliveryTerms: record['Terms of Delivery'],
                    deliveryNoteNumber: record['Delivery Note No. & Date'],
                    despatchDocNumber: record['Despatch Doc. No'],
                    despatchThrough: record['Despatch Through'],
                    destination: record['Destination'],
                    vesselFlightNo: record['Vessel/Flight No.'],
                    portOfLoading: record['Port of Loading'],
                    portOfDischarge: record['Port of Discharge'],
                    countryTo: record['Country To'],
                    shippingNumber: record['Shipping No.'],
                    shippingDate: this.parseDate(record['Shipping Date']),
                    portCode: record['Port Code']
                },
                
                // Category data for additional fields
                categoryData: {
                    quantity: quantity,
                    altUnits: record['Alt. Units'],
                    rate: rate,
                    value: value,
                    roundOff: this.parseNumericValue(record['R.OFF']),
                    tradeDiscount: this.parseNumericValue(record['TRADE DISOCUNT (SALE)']),
                    igstInput: this.parseNumericValue(record['IGST INPUT'])
                },
                
                // Company and month references
                companyId: this.defaultCompanyId,
                monthId: this.getMonthId(voucherDate),
                year: voucherDate ? voucherDate.getFullYear() : new Date().getFullYear(),
                
                // Store complete raw data for future reference
                rawData: record
            };

            return voucher;
        } catch (error) {
            throw new Error(`Failed to transform record: ${error.message}`);
        }
    }

    /**
     * Process records in batches
     */
    async processBatch(records) {
        const batch = [];
        
        for (const record of records) {
            try {
                const voucher = this.transformToVoucher(record);
                batch.push(voucher);
            } catch (error) {
                this.errorCount++;
                this.errors.push({
                    record: record,
                    error: error.message
                });
                console.error(`❌ Error processing record ${this.processedCount + batch.length + this.errorCount}:`, error.message);
            }
        }
        
        if (batch.length > 0) {
            try {
                // Use insertMany with ordered: false to continue on individual errors
                const result = await TallyVoucher.insertMany(batch, { ordered: false });
                this.processedCount += result.length;
                console.log(`✅ Successfully inserted ${result.length} vouchers (Total: ${this.processedCount})`);
            } catch (error) {
                // Handle bulk insert errors
                if (error.writeErrors) {
                    const successfulInserts = batch.length - error.writeErrors.length;
                    this.processedCount += successfulInserts;
                    this.errorCount += error.writeErrors.length;
                    
                    error.writeErrors.forEach(writeError => {
                        this.errors.push({
                            record: batch[writeError.index],
                            error: writeError.errmsg
                        });
                    });
                    
                    console.log(`⚠️  Partial batch insert: ${successfulInserts} successful, ${error.writeErrors.length} failed`);
                } else {
                    this.errorCount += batch.length;
                    console.error(`❌ Batch insert failed:`, error.message);
                }
            }
        }
    }

    /**
     * Main import process
     */
    async import() {
        try {
            console.log('🚀 Starting sales data import process...');
            
            // Connect to database
            await this.connectDatabase();
            
            // Setup defaults
            await this.setupDefaults();
            
            // Load JSON data
            const salesData = this.loadJsonData();
            
            // Process data in batches
            const totalRecords = salesData.data.length;
            console.log(`📊 Processing ${totalRecords} records in batches of ${this.batchSize}...`);
            
            for (let i = 0; i < totalRecords; i += this.batchSize) {
                const batch = salesData.data.slice(i, i + this.batchSize);
                await this.processBatch(batch);
                
                // Progress indicator
                const progress = Math.round(((i + batch.length) / totalRecords) * 100);
                console.log(`📈 Progress: ${progress}% (${i + batch.length}/${totalRecords})`);
            }
            
            // Final summary
            console.log('\n📋 Import Summary:');
            console.log(`✅ Successfully processed: ${this.processedCount} records`);
            console.log(`❌ Failed records: ${this.errorCount}`);
            console.log(`📊 Success rate: ${Math.round((this.processedCount / (this.processedCount + this.errorCount)) * 100)}%`);
            
            // Save error report if there are errors
            if (this.errors.length > 0) {
                const errorReport = {
                    timestamp: new Date().toISOString(),
                    totalErrors: this.errors.length,
                    errors: this.errors.slice(0, 100) // Save first 100 errors
                };
                
                fs.writeFileSync(
                    path.join(__dirname, 'import_errors.json'),
                    JSON.stringify(errorReport, null, 2)
                );
                
                console.log('📄 Error report saved to import_errors.json');
            }
            
        } catch (error) {
            console.error('💥 Import process failed:', error.message);
            throw error;
        }
    }

    /**
     * Cleanup and close connections
     */
    async cleanup() {
        try {
            await mongoose.connection.close();
            console.log('✅ Database connection closed');
        } catch (error) {
            console.error('❌ Error closing database connection:', error.message);
        }
    }
}

/**
 * Run the import process
 */
async function runImport() {
    const importer = new SalesDataImporter();
    
    try {
        await importer.import();
        process.exit(0);
    } catch (error) {
        console.error('💥 Import failed:', error.message);
        process.exit(1);
    } finally {
        await importer.cleanup();
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n⚠️  Process interrupted. Cleaning up...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('💥 Unhandled promise rejection:', error.message);
    process.exit(1);
});

// Export for potential programmatic use
module.exports = SalesDataImporter;

// Run if called directly
if (require.main === module) {
    runImport();
}