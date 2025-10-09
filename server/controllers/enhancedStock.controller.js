const TallyStockItem = require("../models/tallyStockItem.model");
const TallyVoucher = require("../models/tallyVoucher.model");
const mongoose = require("mongoose");

/**
 * Enhanced Stock Controller
 * Provides comprehensive stock management APIs with improved data quality and user experience
 */
class EnhancedStockController {
    
    /**
     * Get dashboard stock overview with key metrics and insights
     */
    static async getStockDashboard(req, res) {
        try {
            const companyId = mongoose.Types.ObjectId(req.userid);
            
            // Basic statistics
            const totalItems = await TallyStockItem.countDocuments({ companyId, isActive: true });
            const itemsInStock = await TallyStockItem.countDocuments({ 
                companyId, 
                isActive: true, 
                closingQty: { $gt: 0 } 
            });
            
            // Stock status distribution
            const statusDistribution = await TallyStockItem.aggregate([
                { $match: { companyId, isActive: true } },
                { $group: { _id: '$stockStatus', count: { $sum: 1 } } },
                { $sort: { count: -1 } }
            ]);
            
            // Stock alerts (critical and low stock)
            const criticalStock = await TallyStockItem.find({
                companyId,
                isActive: true,
                stockStatus: { $in: ['Critical Stock', 'Out of Stock'] }
            })
            .select('name closingQty baseUnits stockStatus parent stockGroup')
            .limit(10)
            .lean();
            
            // Top items by value
            const topByValue = await TallyStockItem.find({
                companyId,
                isActive: true,
                closingValue: { $gt: 0 }
            })
            .select('name closingValue closingQty baseUnits stockGroup')
            .sort({ closingValue: -1 })
            .limit(5)
            .lean();
            
            // Top items by quantity
            const topByQuantity = await TallyStockItem.find({
                companyId,
                isActive: true,
                closingQty: { $gt: 0 }
            })
            .select('name closingValue closingQty baseUnits stockGroup')
            .sort({ closingQty: -1 })
            .limit(5)
            .lean();
            
            // Recent stock movements (from vouchers)
            const recentMovements = await TallyVoucher.find({
                companyId,
                voucherType: { $in: ['Sales', 'Purchase', 'Stock Journal', 'Physical Stock'] },
                'inventoryEntries.0': { $exists: true }
            })
            .select('voucherNumber voucherType date inventoryEntries')
            .sort({ date: -1 })
            .limit(10)
            .lean();
            
            // Process recent movements to extract stock info
            const processedMovements = recentMovements.map(voucher => {
                const firstItem = voucher.inventoryEntries?.[0];
                return {
                    voucherNumber: voucher.voucherNumber,
                    voucherType: voucher.voucherType,
                    date: voucher.date,
                    itemName: firstItem?.stockItemName || 'Unknown',
                    quantity: firstItem?.quantity || 0,
                    rate: firstItem?.rate || 0,
                    amount: firstItem?.amount || 0
                };
            });
            
            // Stock groups analysis
            const stockGroups = await TallyStockItem.aggregate([
                { $match: { companyId, isActive: true } },
                { 
                    $group: { 
                        _id: '$stockGroup', 
                        itemCount: { $sum: 1 },
                        totalValue: { $sum: '$closingValue' },
                        totalQty: { $sum: '$closingQty' }
                    } 
                },
                { $sort: { itemCount: -1 } },
                { $limit: 10 }
            ]);
            
            const dashboardData = {
                statistics: {
                    totalItems,
                    itemsInStock,
                    outOfStock: totalItems - itemsInStock,
                    stockValue: topByValue.reduce((sum, item) => sum + (item.closingValue || 0), 0)
                },
                statusDistribution: statusDistribution.reduce((acc, item) => {
                    acc[item._id] = item.count;
                    return acc;
                }, {}),
                alerts: {
                    criticalStock: criticalStock.map(item => ({
                        name: item.name,
                        quantity: item.closingQty,
                        unit: item.baseUnits,
                        status: item.stockStatus,
                        group: item.stockGroup || item.parent
                    }))
                },
                topPerformers: {
                    byValue: topByValue.map(item => ({
                        name: item.name,
                        value: item.closingValue,
                        quantity: item.closingQty,
                        unit: item.baseUnits,
                        group: item.stockGroup
                    })),
                    byQuantity: topByQuantity.map(item => ({
                        name: item.name,
                        value: item.closingValue,
                        quantity: item.closingQty,
                        unit: item.baseUnits,
                        group: item.stockGroup
                    }))
                },
                recentMovements: processedMovements,
                stockGroups: stockGroups.map(group => ({
                    name: group._id,
                    itemCount: group.itemCount,
                    totalValue: group.totalValue,
                    totalQuantity: group.totalQty
                }))
            };
            
            res.status(200).json({
                success: true,
                message: "Stock dashboard data retrieved successfully",
                data: dashboardData
            });
            
        } catch (error) {
            console.error('Error fetching stock dashboard:', error);
            res.status(500).json({
                success: false,
                message: "Error fetching stock dashboard data",
                error: error.message
            });
        }
    }
    
    /**
     * Get paginated stock items with advanced filtering and search
     */
    static async getStockItems(req, res) {
        try {
            const companyId = mongoose.Types.ObjectId(req.userid);
            const {
                page = 1,
                limit = 20,
                search = '',
                stockGroup = '',
                category = '',
                stockStatus = '',
                sortBy = 'name',
                sortOrder = 'asc',
                hasQuantity = null,
                hasValue = null
            } = req.query;
            
            const skip = (parseInt(page) - 1) * parseInt(limit);
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };
            
            // Build filter query
            const filter = { companyId, isActive: true };
            
            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { stockGroup: { $regex: search, $options: 'i' } },
                    { parent: { $regex: search, $options: 'i' } },
                    { aliasName: { $regex: search, $options: 'i' } }
                ];
            }
            
            if (stockGroup && stockGroup !== 'all') {
                filter.stockGroup = stockGroup;
            }
            
            if (category && category !== 'all') {
                filter.category = category;
            }
            
            if (stockStatus && stockStatus !== 'all') {
                filter.stockStatus = stockStatus;
            }
            
            if (hasQuantity === 'true') {
                filter.closingQty = { $gt: 0 };
            } else if (hasQuantity === 'false') {
                filter.closingQty = { $lte: 0 };
            }
            
            if (hasValue === 'true') {
                filter.closingValue = { $gt: 0 };
            } else if (hasValue === 'false') {
                filter.closingValue = { $lte: 0 };
            }
            
            // Execute queries
            const [stockItems, totalCount] = await Promise.all([
                TallyStockItem.find(filter)
                    .select(`
                        name aliasName stockGroup parent category
                        closingQty closingValue baseUnits 
                        costPrice sellingPrice stockStatus
                        lastUpdated guid masterId
                        gstApplicable hsnCode
                        batchWiseDetails godownDetails
                    `)
                    .sort(sort)
                    .skip(skip)
                    .limit(parseInt(limit))
                    .lean(),
                TallyStockItem.countDocuments(filter)
            ]);
            
            // Enhance stock items with additional calculated fields
            const enhancedStockItems = stockItems.map(item => ({
                ...item,
                displayName: item.name,
                groupPath: item.parent && item.parent !== item.stockGroup 
                    ? `${item.parent} → ${item.stockGroup}` 
                    : item.stockGroup,
                valuePerUnit: item.closingQty > 0 ? item.closingValue / item.closingQty : 0,
                profitMargin: item.costPrice > 0 && item.sellingPrice > 0 
                    ? ((item.sellingPrice - item.costPrice) / item.costPrice * 100).toFixed(2)
                    : null,
                hasBatches: item.batchWiseDetails && item.batchWiseDetails.length > 0,
                hasGodowns: item.godownDetails && item.godownDetails.length > 0,
                statusColor: this.getStatusColor(item.stockStatus),
                lastUpdatedFormatted: new Date(item.lastUpdated).toLocaleDateString()
            }));
            
            // Get filter options for frontend
            const [stockGroups, categories, statuses] = await Promise.all([
                TallyStockItem.distinct('stockGroup', { companyId, isActive: true }),
                TallyStockItem.distinct('category', { companyId, isActive: true }),
                TallyStockItem.distinct('stockStatus', { companyId, isActive: true })
            ]);
            
            res.status(200).json({
                success: true,
                message: "Stock items retrieved successfully",
                data: {
                    items: enhancedStockItems,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(totalCount / parseInt(limit)),
                        totalItems: totalCount,
                        itemsPerPage: parseInt(limit),
                        hasNextPage: skip + parseInt(limit) < totalCount,
                        hasPrevPage: parseInt(page) > 1
                    },
                    filters: {
                        stockGroups: stockGroups.filter(g => g && g.trim() !== ''),
                        categories: categories.filter(c => c && c.trim() !== ''),
                        statuses: statuses.filter(s => s && s.trim() !== '')
                    }
                }
            });
            
        } catch (error) {
            console.error('Error fetching stock items:', error);
            res.status(500).json({
                success: false,
                message: "Error fetching stock items",
                error: error.message
            });
        }
    }
    
    /**
     * Get detailed information for a specific stock item
     */
    static async getStockItemDetail(req, res) {
        try {
            const { stockId } = req.params;
            // Handle both GET and POST requests - extract companyId from different sources
            const companyId = mongoose.Types.ObjectId(req.userid);
            
            // Get stock item details
            const stockItem = await TallyStockItem.findOne({
                _id: stockId,
                companyId,
                isActive: true
            }).lean();
            
            if (!stockItem) {
                return res.status(404).json({
                    success: false,
                    message: "Stock item not found"
                });
            }
            
            // Get stock movement history from vouchers
            const stockMovements = await TallyVoucher.find({
                companyId,
                'inventoryEntries.stockItemName': stockItem.name
            })
            .select('voucherNumber voucherType date inventoryEntries reference')
            .sort({ date: -1 })
            .limit(50)
            .lean();
            
            // Process movement history
            const movementHistory = stockMovements.map(voucher => {
                const relevantEntry = voucher.inventoryEntries.find(
                    entry => entry.stockItemName === stockItem.name
                );
                
                return {
                    date: voucher.date,
                    voucherNumber: voucher.voucherNumber,
                    voucherType: voucher.voucherType,
                    reference: voucher.reference,
                    quantity: relevantEntry?.quantity || 0,
                    rate: relevantEntry?.rate || 0,
                    amount: relevantEntry?.amount || 0,
                    inward: relevantEntry?.quantity > 0,
                    outward: relevantEntry?.quantity < 0
                };
            });
            
            // Calculate movement statistics
            const movementStats = {
                totalTransactions: movementHistory.length,
                totalInward: movementHistory.filter(m => m.inward).reduce((sum, m) => sum + m.quantity, 0),
                totalOutward: Math.abs(movementHistory.filter(m => m.outward).reduce((sum, m) => sum + m.quantity, 0)),
                averageRate: movementHistory.length > 0 
                    ? movementHistory.reduce((sum, m) => sum + Math.abs(m.rate), 0) / movementHistory.length 
                    : 0,
                lastMovementDate: movementHistory.length > 0 ? movementHistory[0].date : null
            };
            
            // Enhanced stock item details
            const enhancedDetails = {
                ...stockItem,
                movementHistory,
                movementStats,
                calculations: {
                    valuePerUnit: stockItem.closingQty > 0 ? stockItem.closingValue / stockItem.closingQty : 0,
                    profitMargin: stockItem.costPrice > 0 && stockItem.sellingPrice > 0 
                        ? ((stockItem.sellingPrice - stockItem.costPrice) / stockItem.costPrice * 100)
                        : null,
                    turnoverRatio: movementStats.totalOutward > 0 && stockItem.closingQty > 0
                        ? movementStats.totalOutward / stockItem.closingQty
                        : 0
                },
                statusInfo: {
                    color: this.getStatusColor(stockItem.stockStatus),
                    recommendation: this.getStockRecommendation(stockItem, movementStats)
                },
                complianceInfo: {
                    hasHSN: !!(stockItem.hsnCode && stockItem.hsnCode.trim()),
                    gstApplicable: stockItem.gstApplicable,
                    taxClassification: stockItem.taxClassification
                }
            };
            
            res.status(200).json({
                success: true,
                message: "Stock item details retrieved successfully",
                data: enhancedDetails
            });
            
        } catch (error) {
            console.error('Error fetching stock item details:', error);
            res.status(500).json({
                success: false,
                message: "Error fetching stock item details",
                error: error.message
            });
        }
    }
    
    /**
     * Update stock item information
     */
    static async updateStockItem(req, res) {
        try {
            const { stockId } = req.params;
            const companyId = mongoose.Types.ObjectId(req.userid);
            const updateData = req.body;
            
            // Remove system fields that shouldn't be updated
            delete updateData.companyId;
            delete updateData._id;
            delete updateData.guid;
            delete updateData.masterId;
            delete updateData.rawData;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            
            // Update the stock item
            const updatedStock = await TallyStockItem.findOneAndUpdate(
                { _id: stockId, companyId },
                { 
                    ...updateData,
                    lastUpdated: new Date()
                },
                { new: true, runValidators: true }
            );
            
            if (!updatedStock) {
                return res.status(404).json({
                    success: false,
                    message: "Stock item not found"
                });
            }
            
            res.status(200).json({
                success: true,
                message: "Stock item updated successfully",
                data: updatedStock
            });
            
        } catch (error) {
            console.error('Error updating stock item:', error);
            res.status(500).json({
                success: false,
                message: "Error updating stock item",
                error: error.message
            });
        }
    }
    
    /**
     * Bulk operations on stock items
     */
    static async bulkStockOperations(req, res) {
        try {
            const companyId = mongoose.Types.ObjectId(req.userid);
            const { operation, stockIds, updateData } = req.body;
            
            let result;
            
            switch (operation) {
                case 'updateStatus':
                    result = await TallyStockItem.updateMany(
                        { _id: { $in: stockIds }, companyId },
                        { 
                            stockStatus: updateData.stockStatus,
                            lastUpdated: new Date()
                        }
                    );
                    break;
                    
                case 'updateGroup':
                    result = await TallyStockItem.updateMany(
                        { _id: { $in: stockIds }, companyId },
                        { 
                            stockGroup: updateData.stockGroup,
                            lastUpdated: new Date()
                        }
                    );
                    break;
                    
                case 'setReorderLevel':
                    result = await TallyStockItem.updateMany(
                        { _id: { $in: stockIds }, companyId },
                        { 
                            reorderLevel: updateData.reorderLevel,
                            lastUpdated: new Date()
                        }
                    );
                    break;
                    
                case 'deactivate':
                    result = await TallyStockItem.updateMany(
                        { _id: { $in: stockIds }, companyId },
                        { 
                            isActive: false,
                            lastUpdated: new Date()
                        }
                    );
                    break;
                    
                default:
                    return res.status(400).json({
                        success: false,
                        message: "Invalid bulk operation"
                    });
            }
            
            res.status(200).json({
                success: true,
                message: `Bulk ${operation} completed successfully`,
                data: {
                    modifiedCount: result.modifiedCount,
                    matchedCount: result.matchedCount
                }
            });
            
        } catch (error) {
            console.error('Error performing bulk operation:', error);
            res.status(500).json({
                success: false,
                message: "Error performing bulk operation",
                error: error.message
            });
        }
    }
    
    /**
     * Export stock data to CSV
     */
    static async exportStockData(req, res) {
        try {
            const companyId = mongoose.Types.ObjectId(req.userid);
            const { format = 'csv', filters = {} } = req.query;
            
            // Build filter query
            const filter = { companyId, isActive: true, ...filters };
            
            const stockItems = await TallyStockItem.find(filter)
                .select(`
                    name aliasName stockGroup parent category
                    closingQty closingValue baseUnits 
                    costPrice sellingPrice stockStatus
                    lastUpdated hsnCode gstApplicable
                `)
                .sort({ name: 1 })
                .lean();
            
            if (format === 'csv') {
                // Convert to CSV format
                const csvHeaders = [
                    'Name', 'Alias', 'Stock Group', 'Parent', 'Category',
                    'Closing Qty', 'Closing Value', 'Base Units',
                    'Cost Price', 'Selling Price', 'Stock Status',
                    'HSN Code', 'GST Applicable', 'Last Updated'
                ].join(',');
                
                const csvData = stockItems.map(item => [
                    `"${item.name || ''}"`,
                    `"${item.aliasName || ''}"`,
                    `"${item.stockGroup || ''}"`,
                    `"${item.parent || ''}"`,
                    `"${item.category || ''}"`,
                    item.closingQty || 0,
                    item.closingValue || 0,
                    `"${item.baseUnits || ''}"`,
                    item.costPrice || 0,
                    item.sellingPrice || 0,
                    `"${item.stockStatus || ''}"`,
                    `"${item.hsnCode || ''}"`,
                    `"${item.gstApplicable || ''}"`,
                    `"${new Date(item.lastUpdated).toLocaleDateString()}"`
                ].join(',')).join('\n');
                
                const csvContent = csvHeaders + '\n' + csvData;
                
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="stock-items-${new Date().toISOString().split('T')[0]}.csv"`);
                res.send(csvContent);
            } else {
                // JSON format
                res.status(200).json({
                    success: true,
                    message: "Stock data exported successfully",
                    data: stockItems,
                    count: stockItems.length,
                    exportDate: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.error('Error exporting stock data:', error);
            res.status(500).json({
                success: false,
                message: "Error exporting stock data",
                error: error.message
            });
        }
    }
    
    /**
     * Helper method to get status color
     */
    static getStatusColor(status) {
        const colorMap = {
            'In Stock': '#10B981',      // Green
            'Low Stock': '#F59E0B',     // Amber
            'Critical Stock': '#EF4444', // Red
            'Out of Stock': '#6B7280',  // Gray
            'Overstock': '#8B5CF6',     // Purple
            'Unknown': '#9CA3AF'        // Light Gray
        };
        return colorMap[status] || colorMap['Unknown'];
    }
    
    /**
     * Helper method to get stock recommendations
     */
    static getStockRecommendation(stockItem, movementStats) {
        if (stockItem.stockStatus === 'Out of Stock') {
            return "Consider immediate restocking to avoid stock-out situation.";
        }
        
        if (stockItem.stockStatus === 'Critical Stock') {
            return "Stock level is critically low. Plan for reorder soon.";
        }
        
        if (movementStats.turnoverRatio > 5) {
            return "High turnover item. Consider increasing safety stock.";
        }
        
        if (movementStats.turnoverRatio < 0.5 && stockItem.closingQty > 0) {
            return "Slow-moving item. Review demand patterns and pricing.";
        }
        
        return "Stock levels appear normal. Monitor regularly.";
    }
}

module.exports = EnhancedStockController;