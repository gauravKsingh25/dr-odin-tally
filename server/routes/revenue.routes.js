const revenueController = require("../controllers/revenue.controller");
const { verifyToken } = require("../middlewares/jwt.auth");

module.exports = function (app) {
    app.get("/api/revenue/north", verifyToken, revenueController.NorthRevenue);
}