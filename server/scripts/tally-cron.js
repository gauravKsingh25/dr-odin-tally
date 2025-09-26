const cron = require('node-cron');
const TallyService = require('../services/tallyService');
const TallyLedger = require('../models/tallyLedger.model');
const TallyVoucher = require('../models/tallyVoucher.model');
const TallyStockItem = require('../models/tallyStockItem.model');
const TallyCompany = require('../models/tallyCompany.model');
const TallyGroup = require('../models/tallyGroup.model');
const TallyCostCenter = require('../models/tallyCostCenter.model');
const TallyCurrency = require('../models/tallyCurrency.model');

class TallyCronJob {
    constructor() {
        this.tallyService = new TallyService();
        this.isRunning = false;
        this.fullSyncRunning = false;
        this.cronTask = null;
        this.lastSyncResult = null;
        this.syncHistory = [];
    }

    // Full comprehensive sync - runs daily at 12:00 AM (excluding vouchers)
    async syncFullData() {
        if (this.fullSyncRunning) {
            console.log('🔄 Full Tally sync already running, skipping...');
            return { success: false, message: 'Full sync already in progress' };
        }

        this.fullSyncRunning = true;
        const syncStartTime = new Date();
        console.log('🚀 Starting FULL Tally data sync at:', syncStartTime.toISOString());

        try {
            const result = {
                syncType: 'FULL_SYNC',
                startTime: syncStartTime,
                endTime: null,
                companies: 0,
                groups: 0,
                costCenters: 0,
                currencies: 0,
                ledgers: 0,
                stockItems: 0,
                vouchers: 0, // Will remain 0 for full sync as requested
                errors: [],
                success: false
            };

            // 1. Sync Company Info
            try {
                console.log('📊 Syncing Company Information...');
                const companyData = await this.tallyService.fetchCompanyInfo();
                const normalizedCompanies = this.tallyService.normalizeCompanyInfo(companyData);
                
                if (normalizedCompanies && normalizedCompanies.length > 0) {
                    for (const company of normalizedCompanies) {
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
                    console.log(`✅ ${normalizedCompanies.length} companies synced successfully`);
                }
            } catch (error) {
                result.errors.push(`Company sync error: ${error.message}`);
                console.error('❌ Company sync failed:', error.message);
            }

            // 2. Sync Groups
            try {
                console.log('📁 Syncing Groups...');
                const groupData = await this.tallyService.fetchGroups();
                const normalizedGroups = this.tallyService.normalizeGroups(groupData);
                
                let groupCount = 0;
                for (const group of normalizedGroups) {
                    const query = group.guid && group.guid.trim() !== '' 
                        ? { guid: group.guid }
                        : { name: group.name, guid: { $in: [null, ''] } };
                    
                    await TallyGroup.updateOne(
                        query,
                        { 
                            $set: { 
                                ...group, 
                                year: new Date().getFullYear(),
                                lastUpdated: new Date()
                            } 
                        },
                        { upsert: true }
                    );
                    groupCount++;
                }
                result.groups = groupCount;
                console.log(`✅ ${groupCount} groups synced successfully`);
            } catch (error) {
                result.errors.push(`Groups sync error: ${error.message}`);
                console.error('❌ Groups sync failed:', error.message);
            }

            // 3. Sync Cost Centers
            try {
                console.log('💼 Syncing Cost Centers...');
                const costCenterData = await this.tallyService.fetchCostCenters();
                const normalizedCostCenters = this.tallyService.normalizeCostCenters(costCenterData);
                
                let costCenterCount = 0;
                for (const center of normalizedCostCenters) {
                    const query = center.guid && center.guid.trim() !== '' 
                        ? { guid: center.guid }
                        : { name: center.name, guid: { $in: [null, ''] } };
                    
                    await TallyCostCenter.updateOne(
                        query,
                        { 
                            $set: { 
                                ...center, 
                                year: new Date().getFullYear(),
                                lastUpdated: new Date()
                            } 
                        },
                        { upsert: true }
                    );
                    costCenterCount++;
                }
                result.costCenters = costCenterCount;
                console.log(`✅ ${costCenterCount} cost centers synced successfully`);
            } catch (error) {
                result.errors.push(`Cost Centers sync error: ${error.message}`);
                console.error('❌ Cost Centers sync failed:', error.message);
            }

            // 4. Sync Currencies
            try {
                console.log('💱 Syncing Currencies...');
                const currencyData = await this.tallyService.fetchCurrencies();
                const normalizedCurrencies = this.tallyService.normalizeCurrencies(currencyData);
                
                let currencyCount = 0;
                for (const currency of normalizedCurrencies) {
                    const query = currency.guid && currency.guid.trim() !== '' 
                        ? { guid: currency.guid }
                        : { name: currency.name, guid: { $in: [null, ''] } };
                    
                    await TallyCurrency.updateOne(
                        query,
                        { 
                            $set: { 
                                ...currency, 
                                year: new Date().getFullYear(),
                                lastUpdated: new Date()
                            } 
                        },
                        { upsert: true }
                    );
                    currencyCount++;
                }
                result.currencies = currencyCount;
                console.log(`✅ ${currencyCount} currencies synced successfully`);
            } catch (error) {
                result.errors.push(`Currencies sync error: ${error.message}`);
                console.error('❌ Currencies sync failed:', error.message);
            }

            // 5. Sync Ledgers
            try {
                console.log('📚 Syncing Ledgers...');
                const ledgerData = await this.tallyService.fetchLedgers();
                const normalizedLedgers = this.tallyService.normalizeLedgers(ledgerData);
                
                let ledgerCount = 0;
                for (const ledger of normalizedLedgers) {
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
                console.log(`✅ ${ledgerCount} ledgers synced successfully`);
            } catch (error) {
                result.errors.push(`Ledgers sync error: ${error.message}`);
                console.error('❌ Ledgers sync failed:', error.message);
            }

            // 6. Sync Stock Items
            try {
                console.log('📦 Syncing Stock Items...');
                const stockData = await this.tallyService.fetchStockItems();
                const normalizedStockItems = this.tallyService.normalizeStockItems(stockData);
                
                let stockCount = 0;
                for (const item of normalizedStockItems) {
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
                console.log(`✅ ${stockCount} stock items synced successfully`);
            } catch (error) {
                result.errors.push(`Stock items sync error: ${error.message}`);
                console.error('❌ Stock items sync failed:', error.message);
            }

            // NOTE: Vouchers are intentionally excluded from full sync as per user request
            console.log('ℹ️  Vouchers sync skipped in full sync - manual sync required');

            result.endTime = new Date();
            const duration = Math.round((result.endTime - result.startTime) / 1000);
            result.success = result.errors.length === 0;
            
            console.log(`🎉 FULL Tally sync completed in ${duration}s:`, {
                companies: result.companies,
                groups: result.groups,
                costCenters: result.costCenters,
                currencies: result.currencies,
                ledgers: result.ledgers,
                stockItems: result.stockItems,
                errors: result.errors.length,
                success: result.success
            });
            
            // Store sync result
            this.lastSyncResult = result;
            this.syncHistory.unshift(result);
            
            // Keep only last 10 sync results
            if (this.syncHistory.length > 10) {
                this.syncHistory.splice(10);
            }
            
            // Update company stats
            if (result.companies > 0) {
                await TallyCompany.updateMany(
                    {},
                    {
                        $set: {
                            totalGroups: result.groups,
                            totalCostCenters: result.costCenters,
                            totalCurrencies: result.currencies,
                            totalLedgers: result.ledgers,
                            totalStockItems: result.stockItems,
                            lastFullSyncedAt: new Date(),
                            fullSyncStatus: result.success ? 'SUCCESS' : 'PARTIAL'
                        }
                    }
                );
            }

            return result;

        } catch (error) {
            console.error('💥 Fatal error during FULL Tally sync:', error);
            const result = {
                syncType: 'FULL_SYNC',
                startTime: syncStartTime,
                endTime: new Date(),
                companies: 0,
                groups: 0,
                costCenters: 0,
                currencies: 0,
                ledgers: 0,
                stockItems: 0,
                vouchers: 0,
                errors: [`Fatal error: ${error.message}`],
                success: false
            };
            this.lastSyncResult = result;
            return result;
        } finally {
            this.fullSyncRunning = false;
        }
    }
    // Partial sync for recent data (keeps existing functionality)
    async syncAllData() {
        if (this.isRunning) {
            console.log('🔄 Tally sync already running, skipping...');
            return;
        }

        this.isRunning = true;
        console.log('🔄 Starting partial Tally data sync at:', new Date().toISOString());

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

            // Sync Recent Vouchers (last 7 days for partial sync)
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

            console.log('🔄 Partial Tally sync completed:', result);
            
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
            console.error('💥 Fatal error during partial Tally sync:', error);
        } finally {
            this.isRunning = false;
        }
    }

    start() {
        console.log('🚀 TallyCronJob initialized with FULL SYNC scheduler');
        console.log('⏰ Full sync scheduled daily at 12:00 AM (midnight)');
        
        // Schedule FULL sync daily at 12:00 AM (00:00)
        // Using cron pattern: minute hour day month dayOfWeek
        // 0 0 * * * = At 00:00 (midnight) every day
        this.cronTask = cron.schedule('0 0 * * *', async () => {
            console.log('⏰ Scheduled FULL sync triggered at:', new Date().toISOString());
            await this.syncFullData();
        }, {
            scheduled: true,
            timezone: "Asia/Kolkata" // Adjust timezone as needed
        });

        console.log('✅ FULL sync cron job started successfully');
        console.log('💡 Next full sync will run at 12:00 AM daily');
        console.log('� Use manual sync endpoints for immediate synchronization');
        
        // Optionally run initial sync on startup (uncomment if needed)
        // setTimeout(() => {
        //     console.log('🔄 Running initial full sync on startup...');
        //     this.syncFullData().catch(error => {
        //         console.error('Initial sync failed:', error);
        //     });
        // }, 5000); // Wait 5 seconds after startup
    }

    stop() {
        if (this.cronTask) {
            this.cronTask.stop();
            this.cronTask = null;
            console.log('🛑 Tally FULL sync cron job stopped');
        }
    }

    // Get sync status
    getSyncStatus() {
        return {
            isRunning: this.isRunning,
            fullSyncRunning: this.fullSyncRunning,
            lastSyncResult: this.lastSyncResult,
            syncHistory: this.syncHistory.slice(0, 5), // Last 5 syncs
            cronActive: this.cronTask ? this.cronTask.getStatus() : null,
            nextScheduledSync: '12:00 AM daily'
        };
    }

    // Manual full sync method
    async manualFullSync() {
        return await this.syncFullData();
    }

    // Manual partial sync method (existing functionality)
    async manualSync() {
        return await this.syncAllData();
    }
}

module.exports = TallyCronJob;