const mongoose = require('mongoose');

const salesExecutiveSchema = new mongoose.Schema({
  date: Date,
  voucherNumber: String,
  voucherType: String,
  party: String,
  executive: String,
  amount: Number,
  narration: String,
  companyId: mongoose.Schema.Types.ObjectId,
  year: Number,
  lastUpdated: Date
});

module.exports = mongoose.model('SalesExecutive', salesExecutiveSchema);
