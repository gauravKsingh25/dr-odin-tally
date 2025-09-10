const mongoose = require("mongoose");

//@ Create Schema for Tally Cost Centers
const tallyCostCenterSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    aliasName: {
        type: String,
        trim: true
    },
    parent: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true
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
    reservedName: {
        type: String,
        trim: true
    },
    sortPosition: {
        type: Number,
        default: 1000
    },
    usedForAllocation: {
        type: Boolean,
        default: false
    },
    affectsStock: {
        type: Boolean,
        default: false
    },
    forPayroll: {
        type: Boolean,
        default: false
    },
    forJobCosting: {
        type: Boolean,
        default: false
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    closingBalance: {
        type: Number,
        default: 0
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    year: {
        type: Number,
        default: new Date().getFullYear()
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    rawData: {
        type: mongoose.Schema.Types.Mixed
    }
}, {
    timestamps: true
});

// Index for better performance
tallyCostCenterSchema.index({ name: 1, companyId: 1 });
tallyCostCenterSchema.index({ parent: 1 });
tallyCostCenterSchema.index({ category: 1 });
tallyCostCenterSchema.index({ guid: 1 });
tallyCostCenterSchema.index({ lastUpdated: -1 });

//Compile Model from tally cost center schema
const TallyCostCenter = mongoose.model("tallyCostCenter", tallyCostCenterSchema);

module.exports = TallyCostCenter;
