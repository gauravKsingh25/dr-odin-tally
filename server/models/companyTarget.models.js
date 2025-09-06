const mongoose = require("mongoose");

// @ Schema for Company Projection

const companyTarget = mongoose.Schema({
    year : {
        type : Number
    },
    month : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "month"
    },
    trgtAmt : {
        type : Number
    },
    companyid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    }
},{
    timestamps:true
});

// Compile mode from company Target Schema
const companytrgt = mongoose.model("companytrgt",companyTarget);

module.exports = companytrgt;