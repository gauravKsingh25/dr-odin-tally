const mongoose = require("mongoose");

// @ Schema for Months
const monthSchema = mongoose.Schema({
    month : {
        type : String,
        required : true,
        trim : true,
    },
    status : {
        type : Boolean,
        default : false
    },
    date : {
        type : String,
        required : true,
        trim : true
    }
},{
    timestamps:true
});

// Compile Model from monthSchema
const month = mongoose.model("month",monthSchema);

//export
module.exports = month;