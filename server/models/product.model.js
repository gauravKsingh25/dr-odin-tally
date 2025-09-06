const mongoose = require('mongoose');

const product = mongoose.model(
    'product',
    mongoose.Schema({
        name: String,
        totalSales: {
            type: Number,
            default: 0
        },
        totalSalesAmount: {
            type: Number,
            default: 0
        },
    })
);

module.exports = product;