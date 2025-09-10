const mongoose = require("mongoose");

//@ Create Schema for Tally Company Info
const tallyCompanySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    guid: {
        type: String,
        trim: true,
        sparse: true  // Allows multiple null values
    },
    aliasName: {
        type: String,
        trim: true
    },
    mailingName: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    addressList: [{
        type: String,
        trim: true
    }],
    country: {
        type: String,
        trim: true,
        default: "India"
    },
    state: {
        type: String,
        trim: true
    },
    pincode: {
        type: String,
        trim: true
    },
    phone: {
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
    currencySymbol: {
        type: String,
        default: "₹"
    },
    currencyName: {
        type: String,
        default: "Indian Rupees"
    },
    financialYearFrom: {
        type: Date
    },
    financialYearTo: {
        type: Date
    },
    booksBeginningFrom: {
        type: Date
    },
    companyNumber: {
        type: String,
        trim: true
    },
    startingNumber: {
        type: Number,
        default: 1
    },
    fbtpaymenttype: {
        type: String,
        trim: true
    },
    useforinterest: {
        type: Boolean,
        default: false
    },
    useforstatutory: {
        type: Boolean,
        default: false
    },
    useforadvances: {
        type: Boolean,
        default: false
    },
    gstregistrationtype: {
        type: String,
        trim: true
    },
    gstregistrationnumber: {
        type: String,
        trim: true
    },
    alternatecurrencydata: {
        type: mongoose.Schema.Types.Mixed
    },
    companyaddressdata: {
        type: mongoose.Schema.Types.Mixed
    },
    remoteName: {
        type: String,
        trim: true
    },
    masterID: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastSyncedAt: {
        type: Date,
        default: Date.now
    },
    totalLedgers: {
        type: Number,
        default: 0
    },
    totalVouchers: {
        type: Number,
        default: 0
    },
    totalStockItems: {
        type: Number,
        default: 0
    },
    totalGroups: {
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
    rawData: {
        type: mongoose.Schema.Types.Mixed  // Store complete raw data from Tally
    }
}, {
    timestamps: true
});

// Index for better performance
tallyCompanySchema.index({ guid: 1 }, { unique: true, sparse: true }); // sparse index allows multiple nulls
tallyCompanySchema.index({ name: 1, companyId: 1 }, { unique: true }); // composite unique key
tallyCompanySchema.index({ companyId: 1 });
tallyCompanySchema.index({ lastSyncedAt: -1 });
tallyCompanySchema.index({ gstregistrationnumber: 1 });

//Compile Model from tally company schema
const TallyCompany = mongoose.model("tallyCompany", tallyCompanySchema);

module.exports = TallyCompany;
