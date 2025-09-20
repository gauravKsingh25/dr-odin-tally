const tallyController = require("../controllers/tally.controller");
const { verifyToken } = require("../middlewares/jwt.auth");

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
        res.status(200).json({
            status: 200,
            message: "Sync status retrieved",
            data: {
                isRunning: tallyCronJob.isRunning,
                lastSync: "Check server logs for details",
                nextScheduledSync: "Automatic sync disabled - manual sync only"
            }
        });
    });
    
    // Backward-compatible alias without /api prefix
    app.get("/tally/sync/status", verifyToken, (req, res) => {
        res.status(200).json({
            status: 200,
            message: "Sync status retrieved",
            data: {
                isRunning: tallyCronJob.isRunning,
                lastSync: "Check server logs for details",
                nextScheduledSync: "Automatic sync disabled - manual sync only"
            }
        });
    });
    
    app.post("/api/tally/sync/manual", verifyToken, async (req, res) => {
        try {
            if (tallyCronJob.isRunning) {
                return res.status(400).json({
                    status: 400,
                    message: "Sync is already running. Please wait for it to complete."
                });
            }
            
            // Trigger manual sync without waiting
            tallyCronJob.manualSync().catch(error => {
                console.error('Manual sync error:', error);
            });
            
            res.status(200).json({
                status: 200,
                message: "Manual sync triggered. Check /api/tally/sync/status for progress.",
                data: {
                    triggered: true,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 500,
                message: "Failed to trigger manual sync",
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
    safeRoute('get', "/api/tally/test-ledger-processing", verifyToken, tallyController.testLedgerProcessing);
    safeRoute('post', "/api/tally/sync", verifyToken, tallyController.syncTallyData);
    safeRoute('get', "/api/tally/dashboard", verifyToken, tallyController.getTallyDashboard);
    safeRoute('get', "/api/tally/ledgers", verifyToken, tallyController.getTallyLedgers);
    safeRoute('get', "/api/tally/ledgers/by-employee", verifyToken, tallyController.getLedgersByEmployee);
    safeRoute('get', "/api/tally/vouchers", verifyToken, tallyController.getTallyVouchers);
    safeRoute('get', "/api/tally/vouchers/by-employee", verifyToken, tallyController.getVouchersByEmployee);
    safeRoute('get', "/api/tally/stockitems", verifyToken, tallyController.getTallyStockItems);

    // Enhanced Comprehensive Tally routes
    safeRoute('post', "/api/tally/sync/comprehensive", verifyToken, tallyController.syncComprehensiveData);
    safeRoute('get', "/api/tally/dashboard/comprehensive", verifyToken, tallyController.getComprehensiveDashboard);
    
    // Backward-compatible aliases without /api prefix
    safeRoute('get', "/tally/dashboard/comprehensive", verifyToken, tallyController.getComprehensiveDashboard);

    // Voucher fetch start + status (both api and non-api paths)
    safeRoute('post', "/api/tally/fetch-vouchers", verifyToken, tallyController.fetchTallyVouchers);
    safeRoute('get', "/api/tally/fetch-vouchers/status", verifyToken, tallyController.getVoucherFetchStatus);
    safeRoute('post', "/tally/fetch-vouchers", verifyToken, tallyController.fetchTallyVouchers);
    safeRoute('get', "/tally/fetch-vouchers/status", verifyToken, tallyController.getVoucherFetchStatus);
};