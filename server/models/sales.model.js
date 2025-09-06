const mongoose = require('mongoose');

const sales = mongoose.model(
    'sales',

    new mongoose.Schema({
        date: Date,
        company: String,
        employe: String,
        product: String,
        invoice: String,
        amount: Number,
        totalPsc: String,
        amountPerPsc: String,
    })
);

module.exports = sales;
