const mongoose = require("mongoose");

const designationSchema = mongoose.Schema({
    designation: {
        type: String,
        required: true,
        trim: true,
    },
    rmdsgn: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "designation"
    },
    isHead: Boolean,
    isManager: Boolean,
    isBDE: Boolean,
    companyid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
}, {
    timestamps: true
});


const designation = mongoose.model("designation", designationSchema);
module.exports = designation;