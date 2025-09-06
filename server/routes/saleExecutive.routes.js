const SaleExecutiveCtrl = require("../controllers/saleExecutive.controller");
const { verifyToken } = require("../middlewares/jwt.auth");

module.exports = function (app) {
    app.get("/api/saleExecutive/report",verifyToken, SaleExecutiveCtrl.SaleExecutiveReport);

    // app.get("/api/saleExecutive/northZone",SaleExecutiveCtrl.NorthZoneReport);
    app.get("/api/saleExecutive/northZone", SaleExecutiveCtrl.GetNorthZoneManager);
    app.get("/api/saleExecutive/Zonebde", SaleExecutiveCtrl.GetBDElist)

    // app.get("/api/saleExecutive/southZone",SaleExecutiveCtrl.SouthZoneReport);
    app.get("/api/saleExecutive/southZone", SaleExecutiveCtrl.GetSouthZoneManager);

    // app.get("/api/saleExecutive/eastZone",SaleExecutiveCtrl.EastZoneReport);
    app.get("/api/saleExecutive/eastZone", SaleExecutiveCtrl.GetEastZoneManager);

    // app.get("/api/saleExecutive/westZone",SaleExecutiveCtrl.WestZoneReport);
    app.get("/api/saleExecutive/westZone", SaleExecutiveCtrl.GetWestZoneManager);

    // app.get("/api/saleExecutive/centralZone",SaleExecutiveCtrl.CentralZoneReport);
    app.get("/api/saleExecutive/centralZone", SaleExecutiveCtrl.GetCentralZoneManager);

}