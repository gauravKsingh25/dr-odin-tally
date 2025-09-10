const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
// db.role = require("./role.model");

// Tally Models
db.tallyCompany = require("./tallyCompany.model");
db.tallyLedger = require("./tallyLedger.model");
db.tallyVoucher = require("./tallyVoucher.model");
db.tallyStockItem = require("./tallyStockItem.model");
db.tallyGroup = require("./tallyGroup.model");
db.tallyCostCenter = require("./tallyCostCenter.model");
db.tallyCurrency = require("./tallyCurrency.model");

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;