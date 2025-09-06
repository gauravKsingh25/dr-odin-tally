const mongoose = require("mongoose");

//@ Schema for Rate Difference
const rateDifferenceSchema = mongoose.Schema({
    date : Date,
    vendor : String,
    employee : String,
    vchNo : Number,
    totalAmt : Number,
    igstPurchase : Number,
    igst : Number,
    companyid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    monthId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "month"
    },
    year : Number
},{timestamps : true});

// Compile Model from Rate Difference Schema
const ratedifference = mongoose.model("ratedifference",rateDifferenceSchema);

module.exports = ratedifference;