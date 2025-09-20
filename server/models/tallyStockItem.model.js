const mongoose = require("mongoose");

//@ Create Schema for Tally Stock Items
const tallyStockItemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    aliasName: {
        type: String,
        trim: true
    },
    closingValue: {
        type: Number,
        default: 0
    },
    closingQty: {
        type: Number,
        default: 0
    },
    baseUnits: {
        type: String,
        trim: true
    },
    additionalUnits: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
    },
    parent: {
        type: String,
        trim: true
    },
    stockGroup: {
        type: String,
        trim: true
    },
    costPrice: {
        type: Number,
        default: 0
    },
    sellingPrice: {
        type: Number,
        default: 0
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    openingQty: {
        type: Number,
        default: 0
    },
    openingRate: {
        type: Number,
        default: 0
    },
    guid: {
        type: String,
        trim: true
    },
    masterId: {
        type: String,
        trim: true
    },
    alterid: {
        type: String,
        trim: true
    },
    // Enhanced stock item fields
    description: {
        type: String,
        trim: true
    },
    partNumber: {
        type: String,
        trim: true
    },
    stockItemCode: {
        type: String,
        trim: true
    },
    gstApplicable: {
        type: String,
        trim: true
    },
    gstTypeOfSupply: {
        type: String,
        trim: true
    },
    hsnCode: {
        type: String,
        trim: true
    },
    taxClassification: {
        type: String,
        trim: true
    },
    vatDetails: {
        classificationName: String,
        taxType: String,
        taxRate: Number
    },
    gstDetails: {
        hsnDescription: String,
        taxabilityType: String,
        igstRate: Number,
        cgstRate: Number,
        sgstRate: Number,
        cessRate: Number,
        cessOnQuantity: Number
    },
    godownDetails: [{
        godownName: String,
        batchAllocations: [{
            batchName: String,
            quantity: Number,
            rate: Number,
            amount: Number
        }]
    }],
    standardCostPrice: {
        type: Number,
        default: 0
    },
    standardSellingPrice: {
        type: Number,
        default: 0
    },
    minimumLevel: {
        type: Number,
        default: 0
    },
    reorderLevel: {
        type: Number,
        default: 0
    },
    maximumLevel: {
        type: Number,
        default: 0
    },
    conversionFactor: {
        type: Number,
        default: 1
    },
    denominator: {
        type: Number,
        default: 1
    },
    numerator: {
        type: Number,
        default: 1
    },
    standardRateOfInward: {
        type: Number,
        default: 0
    },
    standardRateOfOutward: {
        type: Number,
        default: 0
    },
    rateOfInward: {
        type: Number,
        default: 0
    },
    rateOfOutward: {
        type: Number,
        default: 0
    },
    costingMethod: {
        type: String,
        trim: true
    },
    valuationMethod: {
        type: String,
        trim: true
    },
    batchWiseDetails: [{
        batchName: String,
        godownName: String,
        quantity: Number,
        rate: Number,
        amount: Number,
        manufacturingDate: Date,
        expiryDate: Date
    }],
    priceDetails: [{
        date: Date,
        rate: Number,
        rateType: String
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    // Stock status (calculated field)
    stockStatus: {
        type: String,
        enum: ['In Stock', 'Low Stock', 'Critical Stock', 'Out of Stock', 'Overstock', 'Unknown'],
        default: 'Unknown'
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    monthId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "month"
    },
    year: {
        type: Number,
        default: new Date().getFullYear()
    },
    rawData: {
        type: mongoose.Schema.Types.Mixed  // Store complete raw data from Tally
    }
}, {
    timestamps: true
});

// Index for better performance
tallyStockItemSchema.index({ name: 1, companyId: 1 });
tallyStockItemSchema.index({ stockGroup: 1 });
tallyStockItemSchema.index({ category: 1 });
tallyStockItemSchema.index({ lastUpdated: -1 });
tallyStockItemSchema.index({ guid: 1 });
tallyStockItemSchema.index({ hsnCode: 1 });
tallyStockItemSchema.index({ closingQty: 1 });
tallyStockItemSchema.index({ closingValue: -1 });
tallyStockItemSchema.index({ stockItemCode: 1 });

//Compile Model from tally stock item schema
const TallyStockItem = mongoose.model("tallyStockItem", tallyStockItemSchema);

module.exports = TallyStockItem;
