const router = require("express").Router();
const { authJwt } = require("../middlewares");
const EnhancedStockController = require("../controllers/enhancedStock.controller");

/**
 * Enhanced Stock Routes
 * Provides comprehensive stock management endpoints
 */

// Dashboard Routes
router.get("/dashboard", 
    [authJwt.verifyToken], 
    EnhancedStockController.getStockDashboard
);

// Stock Items Management
router.get("/items", 
    [authJwt.verifyToken], 
    EnhancedStockController.getStockItems
);

router.get("/items/:stockId", 
    [authJwt.verifyToken], 
    EnhancedStockController.getStockItemDetail
);

router.put("/items/:stockId", 
    [authJwt.verifyToken], 
    EnhancedStockController.updateStockItem
);

// Bulk Operations
router.post("/bulk-operations", 
    [authJwt.verifyToken], 
    EnhancedStockController.bulkStockOperations
);

// Data Export
router.get("/export", 
    [authJwt.verifyToken], 
    EnhancedStockController.exportStockData
);

module.exports = router;