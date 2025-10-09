const mongoose = require("mongoose");

//@ Create Schema for Tally Ledgers
const tallyLedgerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
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
    parent: {
        type: String,
        trim: true
    },
    openingBalance: {
        type: Number,
        default: 0
    },
    closingBalance: {
        type: Number,
        default: 0
    },
    languageName: {
        type: String,
        trim: true
    },
    languageId: {
        type: Number
    },
    isGroup: {
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
    // Enhanced fields for comprehensive data
    ledgerPhone: {
        type: String,
        trim: true
    },
    ledgerFax: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    website: {
        type: String,
        trim: true
    },
    incometaxnumber: {
        type: String,
        trim: true
    },
    salestaxnumber: {
        type: String,
        trim: true
    },
    gstregistrationtype: {
        type: String,
        trim: true
    },
    gstin: {
        type: String,
        trim: true
    },
    gstdutyhead: {
        type: String,
        trim: true
    },
    addressList: [{
        type: String,
        trim: true
    }],
    bankDetails: {
        accountNumber: String,
        ifscCode: String,
        bankName: String,
        branchName: String
    },
    contactPerson: {
        type: String,
        trim: true
    },
    creditPeriod: {
        type: String, // <-- changed from Number to String
        trim: true,
        default: ''
    },
    creditLimit: {
        type: Number,
        default: 0
    },
    interestRate: {
        type: Number,
        default: 0
    },
    priceLevel: {
        type: String,
        trim: true
    },
    billWiseDetails: [{
        billName: String,
        billDate: Date,
        billAmount: Number,
        billCredit: Boolean
    }],
    categoryData: {
        type: mongoose.Schema.Types.Mixed
    },
    costCentreAllocations: [{
        costCentre: String,
        percentage: Number,
        amount: Number
    }],
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
tallyLedgerSchema.index({ name: 1, companyId: 1 });
tallyLedgerSchema.index({ parent: 1 });
tallyLedgerSchema.index({ lastUpdated: -1 });
tallyLedgerSchema.index({ guid: 1 });
tallyLedgerSchema.index({ gstin: 1 });
tallyLedgerSchema.index({ closingBalance: -1 });
tallyLedgerSchema.index({ isGroup: 1 });

//Compile Model from tally ledger schema
const TallyLedger = mongoose.model("tallyLedger", tallyLedgerSchema);

module.exports = TallyLedger;
