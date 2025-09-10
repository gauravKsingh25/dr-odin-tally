const mongoose = require("mongoose");

//@ Create Schema for Tally Groups
const tallyGroupSchema = mongoose.Schema({
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
    nature: {
        type: String,
        trim: true
    },
    groupType: {
        type: String,
        trim: true,
        enum: ['Assets', 'Liabilities', 'Income', 'Expenses', 'Trading', 'P&L', 'Balance Sheet']
    },
    affectsStock: {
        type: Boolean,
        default: false
    },
    usedForCalculation: {
        type: Boolean,
        default: false
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
    isRevenue: {
        type: Boolean,
        default: false
    },
    isDeemedPositive: {
        type: Boolean,
        default: true
    },
    reservedName: {
        type: String,
        trim: true
    },
    sortPosition: {
        type: Number,
        default: 1000
    },
    childGroups: [{
        type: String,
        trim: true
    }],
    ledgerCount: {
        type: Number,
        default: 0
    },
    totalBalance: {
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
tallyGroupSchema.index({ name: 1, companyId: 1 });
tallyGroupSchema.index({ parent: 1 });
tallyGroupSchema.index({ groupType: 1 });
tallyGroupSchema.index({ guid: 1 });
tallyGroupSchema.index({ lastUpdated: -1 });

//Compile Model from tally group schema
const TallyGroup = mongoose.model("tallyGroup", tallyGroupSchema);

module.exports = TallyGroup;
