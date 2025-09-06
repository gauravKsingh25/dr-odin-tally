const mongoose = require("mongoose");

// @ Schema for City
const citySchema = mongoose.Schema({
    city: {
        type: String,
        required: true,
        trim: true
    },
    stateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "State"
    },
    companyid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, {
    timestamps: true
});

// Compile Model from city schema
const month = mongoose.model("City", citySchema);

//export
module.exports = month;