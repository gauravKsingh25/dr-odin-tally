const tallyController = require("../controllers/tally.controller");
const enhancedTallyController = require('../controllers/enhancedTally.controller');
const { verifyToken } = require("../middlewares/jwt.auth");
const multer = require("multer");

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
            file.mimetype === 'application/vnd.ms-excel' ||
            file.mimetype === 'text/csv') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel and CSV files are allowed'));
        }
    }
});

// Import the TallyCronJob for manual operations
const TallyCronJob = require("../scripts/tally-cron");
const tallyCronJob = new TallyCronJob();

module.exports = function (app) {
    // Test endpoint without auth
    app.get("/api/tally/health", (req, res) => {
        res.status(200).json({ 
            status: 200, 
            message: "Tally service is running", 
            timestamp: new Date().toISOString() 
        });
    });
    
    // Manual sync trigger and status
    app.get("/api/tally/sync/status", verifyToken, (req, res) => {
        const status = tallyCronJob.getSyncStatus();
        res.status(200).json({
            status: 200,
            message: "Sync status retrieved",
            data: {
                isRunning: status.isRunning,
                fullSyncRunning: status.fullSyncRunning,
                lastSyncResult: status.lastSyncResult,
                syncHistory: status.syncHistory,
                cronActive: status.cronActive,
                nextScheduledSync: status.nextScheduledSync
            }
        });
    });
    
    // Backward-compatible alias without /api prefix
    app.get("/tally/sync/status", verifyToken, (req, res) => {
        const status = tallyCronJob.getSyncStatus();
        res.status(200).json({
            status: 200,
            message: "Sync status retrieved",
            data: {
                isRunning: status.isRunning,
                fullSyncRunning: status.fullSyncRunning,
                lastSyncResult: status.lastSyncResult,
                syncHistory: status.syncHistory,
                cronActive: status.cronActive,
                nextScheduledSync: status.nextScheduledSync
            }
        });
    });
    
    app.post("/api/tally/sync/manual", verifyToken, async (req, res) => {
        try {
            if (tallyCronJob.isRunning) {
                return res.status(400).json({
                    status: 400,
                    message: "Partial sync is already running. Please wait for it to complete."
                });
            }
            
            // Trigger manual partial sync without waiting
            tallyCronJob.manualSync().catch(error => {
                console.error('Manual partial sync error:', error);
            });
            
            res.status(200).json({
                status: 200,
                message: "Manual partial sync triggered. Check /api/tally/sync/status for progress.",
                data: {
                    triggered: true,
                    syncType: 'PARTIAL',
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to trigger manual partial sync",
                error: error.message
            });
        }
    });

    // New Full Sync Routes
    app.post("/api/tally/sync/full", verifyToken, async (req, res) => {
        try {
            if (tallyCronJob.fullSyncRunning) {
                return res.status(400).json({
                    status: 400,
                    message: "Full sync is already running. Please wait for it to complete."
                });
            }
            
            // Trigger manual full sync without waiting
            tallyCronJob.manualFullSync().catch(error => {
                console.error('Manual full sync error:', error);
            });
            
            res.status(200).json({
                status: 200,
                message: "Manual FULL sync triggered (excluding vouchers). Check /api/tally/sync/status for progress.",
                data: {
                    triggered: true,
                    syncType: 'FULL',
                    excludesVouchers: true,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to trigger manual full sync",
                error: error.message
            });
        }
    });

    // Enhanced Full Sync Route (Excluding Vouchers)
    app.post('/api/tally/sync/full-enhanced', verifyToken, enhancedTallyController.fullSyncWithoutVouchers);

    // Get detailed sync history
    app.get("/api/tally/sync/history", verifyToken, (req, res) => {
        const status = tallyCronJob.getSyncStatus();
        res.status(200).json({
            status: 200,
            message: "Sync history retrieved",
            data: {
                syncHistory: status.syncHistory,
                totalSyncs: status.syncHistory.length
            }
        });
    });

    // Control cron scheduler
    app.post("/api/tally/scheduler/stop", verifyToken, (req, res) => {
        try {
            tallyCronJob.stop();
            res.status(200).json({
                status: 200,
                message: "Tally sync scheduler stopped successfully"
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to stop scheduler",
                error: error.message
            });
        }
    });

    app.post("/api/tally/scheduler/start", verifyToken, (req, res) => {
        try {
            tallyCronJob.start();
            res.status(200).json({
                status: 200,
                message: "Tally sync scheduler started successfully. Full sync will run daily at 12:00 AM"
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to start scheduler",
                error: error.message
            });
        }
    });
    
    // Existing routes
    // Helper to safely attach controller routes
    function safeRoute(method, path, ...handlers) {
        const last = handlers[handlers.length - 1];
        if (typeof last !== 'function') {
            app[method](path, (req, res) => {
                res.status(500).json({
                    status: 500,
                    message: `Controller for ${path} is not defined or not a function.`
                });
            });
        } else {
            app[method](path, ...handlers);
        }
    }

    safeRoute('post', "/api/tally/create", verifyToken, tallyController.CreateTallyReport);
    safeRoute('post', "/api/tally/rateDifference", verifyToken, tallyController.RateDifference);
    safeRoute('post', "/api/tally/chqbounce", verifyToken, tallyController.ChequeBounce);

    // New Tally Integration routes
    safeRoute('get', "/api/tally/test-connection", verifyToken, tallyController.testTallyConnection);
    safeRoute('get', "/api/tally/test-minimal", verifyToken, tallyController.testTallyConnection); // Alias for easier testing
    safeRoute('get', "/api/tally/test-ledger-processing", verifyToken, tallyController.testLedgerProcessing);
    safeRoute('post', "/api/tally/sync", verifyToken, tallyController.syncTallyData);
    safeRoute('get', "/api/tally/dashboard", verifyToken, tallyController.getTallyDashboard);
    safeRoute('get', "/api/tally/dashboard/sync", verifyToken, tallyController.getTallySyncDashboard);
    safeRoute('get', "/api/tally/ledgers", verifyToken, tallyController.getTallyLedgers);
    safeRoute('get', "/api/tally/ledgers/by-employee", verifyToken, tallyController.getLedgersByEmployee);
    safeRoute('get', "/api/tally/vouchers", verifyToken, tallyController.getTallyVouchers);
    safeRoute('get', "/api/tally/vouchers/by-employee", verifyToken, tallyController.getVouchersByEmployee);
    safeRoute('get', "/api/tally/stockitems", verifyToken, tallyController.getTallyStockItems);

    // Enhanced Comprehensive Tally routes
    safeRoute('post', "/api/tally/sync/comprehensive", verifyToken, tallyController.syncComprehensiveData);
    safeRoute('post', "/api/tally/sync/ledgers-only", verifyToken, tallyController.syncLedgersOnly);
    safeRoute('get', "/api/tally/dashboard/comprehensive", verifyToken, tallyController.getComprehensiveDashboard);
    
    // Backward-compatible aliases without /api prefix
    safeRoute('post', "/tally/sync/full", verifyToken, async (req, res) => {
        try {
            if (tallyCronJob.fullSyncRunning) {
                return res.status(400).json({
                    status: 400,
                    message: "Full sync is already running. Please wait for it to complete."
                });
            }
            
            tallyCronJob.manualFullSync().catch(error => {
                console.error('Manual full sync error:', error);
            });
            
            res.status(200).json({
                status: 200,
                message: "Manual FULL sync triggered (excluding vouchers). Check /tally/sync/status for progress.",
                data: {
                    triggered: true,
                    syncType: 'FULL',
                    excludesVouchers: true,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to trigger manual full sync",
                error: error.message
            });
        }
    });

    safeRoute('get', "/tally/sync/history", verifyToken, (req, res) => {
        const status = tallyCronJob.getSyncStatus();
        res.status(200).json({
            status: 200,
            message: "Sync history retrieved",
            data: {
                syncHistory: status.syncHistory,
                totalSyncs: status.syncHistory.length
            }
        });
    });

    safeRoute('get', "/tally/dashboard/sync", verifyToken, tallyController.getTallySyncDashboard);

    // Voucher fetch start + status (both api and non-api paths)
    safeRoute('post', "/api/tally/fetch-vouchers", verifyToken, tallyController.fetchTallyVouchers);
    safeRoute('get', "/api/tally/fetch-vouchers/status", verifyToken, tallyController.getVoucherFetchStatus);
    safeRoute('post', "/tally/fetch-vouchers", verifyToken, tallyController.fetchTallyVouchers);
    safeRoute('get', "/tally/fetch-vouchers/status", verifyToken, tallyController.getVoucherFetchStatus);

    // Voucher Excel Upload
    safeRoute('post', "/api/tally/upload/vouchers", verifyToken, upload.single('file'), tallyController.uploadVoucherExcel);
    safeRoute('post', "/api/tally/verify/vouchers", verifyToken, tallyController.verifyVoucherNumbers);
    
    // Manual Voucher CRUD Operations
    safeRoute('post', "/api/tally/voucher/manual", verifyToken, tallyController.createManualVoucher);
    safeRoute('get', "/api/tally/voucher/manual/list", verifyToken, tallyController.getManualVouchersList);
    safeRoute('get', "/api/tally/voucher/manual/:id", verifyToken, tallyController.getManualVoucher);
    safeRoute('put', "/api/tally/voucher/manual/:id", verifyToken, tallyController.updateManualVoucher);
    safeRoute('delete', "/api/tally/voucher/manual/:id", verifyToken, tallyController.deleteManualVoucher);
};