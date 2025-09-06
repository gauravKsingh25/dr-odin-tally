const mongoose = require("mongoose");

const Zone = mongoose.model(
    "Zone",
    new mongoose.Schema({
        zone:{
            type:String
        },
        companyid : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "user"
         }
    })
);

module.exports = Zone;