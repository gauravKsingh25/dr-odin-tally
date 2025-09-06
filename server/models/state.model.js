const mongoose = require("mongoose");

// @ Schema for Months
const stateSchema = mongoose.Schema({
    state : {
        type : String,
        required : true,
        trim : true,
    },
    zoneId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Zone"
    },
    companyid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
     }
},{
    timestamps:true
});

// Compile Model from monthSchema
const month = mongoose.model("State",stateSchema);

//export
module.exports = month;