const mongoose = require('mongoose');

const vendorTransactionSchema = new mongoose.Schema({
  date: Date,
  voucherNumber: String,
  voucherType: String,
  vendorName: String,
  amount: Number,
  narration: String,
  companyId: mongoose.Schema.Types.ObjectId,
  year: Number,
  lastUpdated: Date
});

module.exports = mongoose.model('VendorTransaction', vendorTransactionSchema);
