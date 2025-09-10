const cron = require('node-cron');
const TallyService = require('../services/tallyService');
const TallyLedger = require('../models/tallyLedger.model');
const TallyVoucher = require('../models/tallyVoucher.model');
const TallyStockItem = require('../models/tallyStockItem.model');
const TallyCompany = require('../models/tallyCompany.model');

class TallyCronJob {
    constructor() {
        this.tallyService = new TallyService();
        this.isRunning = false;
    }

    async syncAllData() {
        if (this.isRunning) {
            console.log('Tally sync already running, skipping...');
            return;
        }

        this.isRunning = true;
        console.log('Starting Tally data sync at:', new Date().toISOString());

        try {
            const result = {
                companies: 0,
                ledgers: 0,
                vouchers: 0,
                stockItems: 0,
                errors: []
            };

            // Sync Company Info
            try {
                const companyData = await this.tallyService.fetchCompanyInfo();
                const normalizedCompanies = this.tallyService.normalizeCompanyInfo(companyData);
                
                if (normalizedCompanies && normalizedCompanies.length > 0) {
                    for (const company of normalizedCompanies) {
                        // Use GUID for uniqueness if available, otherwise use name
                        const query = company.guid && company.guid.trim() !== '' 
                            ? { guid: company.guid }
                            : { name: company.name, guid: { $in: [null, ''] } };
                        
                        await TallyCompany.findOneAndUpdate(
                            query,
                            { 
                                ...company, 
                                year: new Date().getFullYear(),
                                lastSyncedAt: new Date()
                            },
                            { upsert: true, new: true }
                        );
                    }
                    result.companies = normalizedCompanies.length;
                    console.log(`✓ ${normalizedCompanies.length} companies synced`);
                }
            } catch (error) {
                result.errors.push(`Company sync error: ${error.message}`);
                console.error('✗ Company sync failed:', error.message);
            }

            // Sync Ledgers
            try {
                const ledgerData = await this.tallyService.fetchLedgers();
                const normalizedLedgers = this.tallyService.normalizeLedgers(ledgerData);
                
                let ledgerCount = 0;
                for (const ledger of normalizedLedgers) {
                    // Use GUID for uniqueness if available, otherwise use name
                    const query = ledger.guid && ledger.guid.trim() !== '' 
                        ? { guid: ledger.guid }
                        : { name: ledger.name, guid: { $in: [null, ''] } };
                    
                    await TallyLedger.updateOne(
                        query,
                        { 
                            $set: { 
                                ...ledger, 
                                year: new Date().getFullYear(),
                                lastUpdated: new Date()
                            } 
                        },
                        { upsert: true }
                    );
                    ledgerCount++;
                }
                result.ledgers = ledgerCount;
                console.log(`✓ ${ledgerCount} ledgers synced`);
            } catch (error) {
                result.errors.push(`Ledgers sync error: ${error.message}`);
                console.error('✗ Ledgers sync failed:', error.message);
            }

            // Sync Stock Items
            try {
                const stockData = await this.tallyService.fetchStockItems();
                const normalizedStockItems = this.tallyService.normalizeStockItems(stockData);
                
                let stockCount = 0;
                for (const item of normalizedStockItems) {
                    // Use GUID for uniqueness if available, otherwise use name
                    const query = item.guid && item.guid.trim() !== '' 
                        ? { guid: item.guid }
                        : { name: item.name, guid: { $in: [null, ''] } };
                    
                    await TallyStockItem.updateOne(
                        query,
                        { 
                            $set: { 
                                ...item, 
                                year: new Date().getFullYear(),
                                lastUpdated: new Date()
                            } 
                        },
                        { upsert: true }
                    );
                    stockCount++;
                }
                result.stockItems = stockCount;
                console.log(`✓ ${stockCount} stock items synced`);
            } catch (error) {
                result.errors.push(`Stock items sync error: ${error.message}`);
                console.error('✗ Stock items sync failed:', error.message);
            }

            // Sync Recent Vouchers (last 7 days for hourly sync)
            try {
                const fromDate = new Date();
                fromDate.setDate(fromDate.getDate() - 7);
                const toDate = new Date();
                
                const voucherData = await this.tallyService.fetchVouchers(
                    fromDate.toISOString().split('T')[0].replace(/-/g, ''),
                    toDate.toISOString().split('T')[0].replace(/-/g, '')
                );
                const normalizedVouchers = this.tallyService.normalizeVouchers(voucherData);
                
                let voucherCount = 0;
                for (const voucher of normalizedVouchers) {
                    // Use GUID for uniqueness if available, otherwise use voucherNumber + date
                    const query = voucher.guid && voucher.guid.trim() !== '' 
                        ? { guid: voucher.guid }
                        : { 
                            voucherNumber: voucher.voucherNumber, 
                            date: voucher.date,
                            guid: { $in: [null, ''] }
                        };
                    
                    await TallyVoucher.updateOne(
                        query,
                        { 
                            $set: { 
                                ...voucher, 
                                year: new Date().getFullYear(),
                                lastUpdated: new Date()
                            } 
                        },
                        { upsert: true }
                    );
                    voucherCount++;
                }
                result.vouchers = voucherCount;
                console.log(`✓ ${voucherCount} vouchers synced`);
            } catch (error) {
                result.errors.push(`Vouchers sync error: ${error.message}`);
                console.error('✗ Vouchers sync failed:', error.message);
            }

            console.log('Tally sync completed:', result);
            
            // Update company stats
            if (result.companies > 0) {
                await TallyCompany.updateMany(
                    {},
                    {
                        $set: {
                            totalLedgers: result.ledgers,
                            totalVouchers: result.vouchers,
                            totalStockItems: result.stockItems,
                            lastSyncedAt: new Date()
                        }
                    }
                );
            }

        } catch (error) {
            console.error('Fatal error during Tally sync:', error);
        } finally {
            this.isRunning = false;
        }
    }

    start() {
        console.log('Starting Tally cron job - will run every hour at minute 0');
        
        // Run every hour at minute 0
        cron.schedule('0 * * * *', () => {
            this.syncAllData();
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata"
        });

        // Only run immediately on startup if not in development mode
        if (process.env.NODE_ENV !== 'development' && process.env.SKIP_INITIAL_SYNC !== 'true') {
            setTimeout(() => {
                console.log('Running initial Tally sync...');
                this.syncAllData();
            }, 5000);
        } else {
            console.log('🚧 Development mode: Skipping initial sync. Use manual sync endpoint if needed.');
        }
    }

    // Manual sync method for testing
    async manualSync() {
        return await this.syncAllData();
    }
}

module.exports = TallyCronJob;