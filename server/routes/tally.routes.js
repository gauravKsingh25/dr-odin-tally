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
                nextScheduledSync: "Every hour at minute 0"
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
    app.post("/api/tally/create", verifyToken, tallyController.CreateTallyReport);
    app.post("/api/tally/rateDifference", verifyToken, tallyController.RateDifference);
    app.post("/api/tally/chqbounce", verifyToken, tallyController.ChequeBounce);
    
    // New Tally Integration routes
    app.get("/api/tally/test-connection", verifyToken, tallyController.testTallyConnection);
    app.post("/api/tally/sync", verifyToken, tallyController.syncTallyData);
    app.get("/api/tally/dashboard", verifyToken, tallyController.getTallyDashboard);
    app.get("/api/tally/ledgers", verifyToken, tallyController.getTallyLedgers);
    app.get("/api/tally/vouchers", verifyToken, tallyController.getTallyVouchers);
    app.get("/api/tally/stockitems", verifyToken, tallyController.getTallyStockItems);
    
    // Enhanced Comprehensive Tally routes
    app.post("/api/tally/sync/comprehensive", verifyToken, tallyController.syncComprehensiveData);
    app.get("/api/tally/dashboard/comprehensive", verifyToken, tallyController.getComprehensiveDashboard);
};