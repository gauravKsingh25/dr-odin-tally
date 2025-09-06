const mongoose = require("mongoose");

//@ Schema 
const salarySheetSchema = mongoose.Schema({
    sno: {
        type: Number
    },
    name: {
        type: String,
        trim: true
    },
    designation: {
        type: String,
        trim: true
    },
    doj: {
        type: String,
    },
    city: {
        type: String,
        trim: true
    },
    ctc: {
        type: Number
    },
    expenses: {
        type: Number
    },
    companyid: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    monthId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "month"
    },
    year: Number
}, {
    timestamps: true
});


// Compile Model
const salary_expenses = mongoose.model("salary_expenses", salarySheetSchema);


//export
module.exports = salary_expenses;