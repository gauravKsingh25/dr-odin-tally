/**
 * Enhanced Tally Routes
 * Routes for enhanced Tally sync and comprehensive data retrieval
 */

const router = require('express').Router();
const { authJwt } = require('../middlewares');
const enhancedTallyController = require('../controllers/enhancedTallyController');

// Enhanced sync endpoints
router.post('/sync/enhanced', [authJwt.verifyToken], enhancedTallyController.runEnhancedSync);
router.get('/sync/quality-test', [authJwt.verifyToken], enhancedTallyController.testEnhancedSyncQuality);

// Enhanced ledger endpoints
router.get('/ledgers/enhanced', [authJwt.verifyToken], enhancedTallyController.getEnhancedLedgers);
router.get('/ledgers/:ledgerId/comprehensive', [authJwt.verifyToken], enhancedTallyController.getLedgerWithRelatedData);

module.exports = router;