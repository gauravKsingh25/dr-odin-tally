const mongoose = require("mongoose");

//@ Create Schema for Tally Vouchers
const tallyVoucherSchema = mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    voucherNumber: {
        type: String,
        required: true,
        trim: true
    },
    voucherType: {
        type: String,
        required: true,
        trim: true
    },
    voucherTypeName: {
        type: String,
        trim: true
    },
    party: {
        type: String,
        trim: true
    },
    partyledgername: {
        type: String,
        trim: true
    },
    amount: {
        type: Number,
        default: 0
    },
    narration: {
        type: String,
        trim: true
    },
    reference: {
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
    voucherKey: {
        type: String,
        trim: true
    },
    alterid: {
        type: String,
        trim: true
    },
    isDeemedPositive: {
        type: Boolean,
        default: true
    },
    // Enhanced voucher fields
    voucherDate: {
        type: Date
    },
    effectiveDate: {
        type: Date
    },
    basicvoucherdate: {
        type: Date
    },
    reservedName: {
        type: String,
        trim: true
    },
    useForInterest: {
        type: Boolean,
        default: false
    },
    useForStatutory: {
        type: Boolean,
        default: false
    },
    inventoryEntries: [{
        stockItemName: String,
        actualQuantity: Number,
        billedQuantity: Number,
        rate: Number,
        amount: Number,
        discount: Number,
        godownName: String
    }],
    ledgerEntries: [{
        ledgerName: String,
        amount: Number,
        isDebit: Boolean,
        billAllocations: [{
            billName: String,
            billAmount: Number
        }]
    }],
    bankDetails: {
        transactionType: String,
        instrumentDate: Date,
        instrumentNumber: String,
        bankName: String,
        favourOf: String,
        transactionId: String
    },
    gstDetails: {
        cgstAmount: Number,
        sgstAmount: Number,
        igstAmount: Number,
        cessAmount: Number,
        totalTaxAmount: Number,
        placeOfSupply: String,
        gstinOfSupplier: String,
        gstinOfRecipient: String
    },
    eInvoiceDetails: {
        eInvoiceNumber: String,
        eInvoiceDate: Date,
        eInvoiceStatus: String,
        qrCode: String
    },
    costCentreAllocations: [{
        costCentre: String,
        amount: Number,
        percentage: Number
    }],
    classificationData: {
        type: mongoose.Schema.Types.Mixed
    },
    categoryData: {
        type: mongoose.Schema.Types.Mixed
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    uploadSource: {
        type: String,
        trim: true
    },
    uploadFileName: {
        type: String,
        trim: true
    },
    uploadDate: {
        type: Date
    },
    uploadBatch: {
        type: Number
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

// Index for better performance and duplicate prevention
tallyVoucherSchema.index({ voucherNumber: 1, companyId: 1 }, { unique: true }); // Primary key constraint
tallyVoucherSchema.index({ date: -1 });
tallyVoucherSchema.index({ voucherType: 1 });
tallyVoucherSchema.index({ party: 1 });
tallyVoucherSchema.index({ lastUpdated: -1 });
tallyVoucherSchema.index({ guid: 1 });
tallyVoucherSchema.index({ amount: -1 });
tallyVoucherSchema.index({ "gstDetails.totalTaxAmount": -1 });
tallyVoucherSchema.index({ uploadBatch: 1 }); // For batch tracking

//Compile Model from tally voucher schema
const TallyVoucher = mongoose.model("tallyVoucher", tallyVoucherSchema);

module.exports = TallyVoucher;


