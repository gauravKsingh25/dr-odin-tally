const mongoose = require("mongoose");

//@ Schema for Cheque Bounce
const chequeBounce = mongoose.Schema({
    date : Date,
    seller : String,
    vchType : String,
    vchNo : String,
    debit : Number,
    credit : Number,
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


//Compile Model from Cheque Bounce
const chequebounce = mongoose.model("chequebounce",chequeBounce);

module.exports = chequebounce;  