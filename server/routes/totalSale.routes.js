const SaleController = require("../controllers/totalSale.controller");
const { verifyToken } = require("../middlewares/jwt.auth");

module.exports = function (app) {
    // Total 
    app.get("/api/total/monthsale", verifyToken, SaleController.TotalSaleOfMonth);
    app.get("/api/total/monthExpenditure", verifyToken, SaleController.ExpenditureOfMonth);
    app.get("/api/total/targetAchieved", verifyToken, SaleController.TargetAchieved);
    //Graph Monthly Sale/Target
    app.get("/api/total/annualSales", verifyToken, SaleController.annualSales);
    //Graph API
    app.get("/api/total/annualSaleSummary", verifyToken, SaleController.AnnualSaleSummary);
    app.get("/api/total/annualtrgtSummary", verifyToken, SaleController.AnnualTargetSummary);
    app.get("/api/total/sales_salary", verifyToken, SaleController.SalesVsSalary);
    //Line Graph
    app.get("/api/total/overallsale", verifyToken, SaleController.OverAllSale);
    app.get("/api/total/zonerevenue", verifyToken, SaleController.ZoneRevenue);
    // Company Monthly Target
    app.post("/api/total/create/companytrgt", verifyToken, SaleController.CompanyTargetCreate);
    app.get("/api/total/monthlytrgtAmt", verifyToken, SaleController.GetCompanyTarget);
    app.put("/api/total/update/companytrgt", verifyToken, SaleController.CompanyTargetUpdate);
};