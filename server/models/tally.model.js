const mongoose = require("mongoose");

//@ Create Schema for Tally Report

const tallyReportSchema = mongoose.Schema({
    date: {
        type: Date
    },
    company: {
        type: String
    },
    companyid : {
        type : mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    employee: {
        type: String
    },
    product: {
        type: String
    },
    invoice: {
        type: String
    },
    productPrice:{
        type:Number
    },
    totalPcs: {
        type: String
    },
    productPcs : {
        type : Number
    },
    amountPerPcs: {
        type: String
    },
    totalAmount: {
        type: Number
    },
    tax: {
        type: Number
    },
    netAmount: {
        type: Number
    },
    monthId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "month"
    },
    year : Number
},{
    timestamps:true
});

//Compile Mode from tally report schema
const tally = mongoose.model("tally", tallyReportSchema);

module.exports = tally;