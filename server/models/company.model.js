const mongoose = require('mongoose');

const company = mongoose.model(
    'company',
    mongoose.Schema({
        name: String,
        totalSales: {
            type: Number,
            default: 0
        },
        totalSalesAmount: {
            type: Number,
            default: 0
        }
    })
);

module.exports = company;