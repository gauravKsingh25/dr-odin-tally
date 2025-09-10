const mongoose = require("mongoose");

//@ Create Schema for Tally Currency
const tallyCurrencySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    expandedName: {
        type: String,
        trim: true
    },
    symbol: {
        type: String,
        trim: true
    },
    aliasName: {
        type: String,
        trim: true
    },
    reservedName: {
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
    originalName: {
        type: String,
        trim: true
    },
    decimalPlaces: {
        type: Number,
        default: 2
    },
    isBaseCurrency: {
        type: Boolean,
        default: false
    },
    exchangeRate: {
        type: Number,
        default: 1
    },
    showAmountsInMillions: {
        type: Boolean,
        default: false
    },
    hasSymbol: {
        type: Boolean,
        default: false
    },
    putSymbolInfront: {
        type: Boolean,
        default: true
    },
    addSpaceBetweenAmountAndSymbol: {
        type: Boolean,
        default: false
    },
    formalName: {
        type: String,
        trim: true
    },
    subUnit: {
        type: String,
        trim: true
    },
    hundredsName: {
        type: String,
        trim: true
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
tallyCurrencySchema.index({ name: 1, companyId: 1 });
tallyCurrencySchema.index({ symbol: 1 });
tallyCurrencySchema.index({ isBaseCurrency: 1 });
tallyCurrencySchema.index({ guid: 1 });
tallyCurrencySchema.index({ lastUpdated: -1 });

//Compile Model from tally currency schema
const TallyCurrency = mongoose.model("tallyCurrency", tallyCurrencySchema);

module.exports = TallyCurrency;
