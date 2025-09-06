const mongoose = require("mongoose");

// @ Schema for credits
const creditSchema = mongoose.Schema({
    Date: {
        type: Date,
        trim: true,
    },
    Vendor: {
        type: String,
        trim: true,
    },
    SalesPerson: {
        type: String,
        trim: true,
    },
    STOCK_TRF_IGST: {
        type: Number,
        trim: true,
    },
    IGST_OUTPUT: {
        type: Number,
        trim: true,
    },
    Credit_Note: {
        type: String,
        trim: true,
    },
    Vch: {
        type: Number,
        trim: true,
    },
    companyid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    monthId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "month"
    },
    year : Number
},{
    timestamps:true
});

// Compile Model from creditSchema
const credit = mongoose.model("credit", creditSchema);

//export
module.exports = credit;