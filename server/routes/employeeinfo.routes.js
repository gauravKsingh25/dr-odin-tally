const empInfoCtrl = require("../controllers/employeeinfo.controller");
const { verifyToken } = require("../middlewares/jwt.auth");

module.exports = function (app) {
    // Employee
    app.post("/api/empinfo/create", verifyToken, empInfoCtrl.CreateEmployee);
    app.put('/api/empinfo/update/:id', verifyToken, empInfoCtrl.UpdateEmployee);
    // Reporting Manager
    app.get('/api/empinfo/allemp', verifyToken, empInfoCtrl.getEmployee);
    app.get("/api/empinfo/get", verifyToken, empInfoCtrl.ReportingManager);
    // Zone
    app.post('/api/empinfo/createZone', verifyToken, empInfoCtrl.createZone);
    app.get('/api/empinfo/getzone', verifyToken, empInfoCtrl.GetZones);
    app.delete("/api/empinfo/delzone/:id", verifyToken, empInfoCtrl.DeleteZone);
    app.put("/api/empinfo/updatezone", verifyToken, empInfoCtrl.UpdateZone);
    // 
    app.get('/api/empinfo/getStateUser', verifyToken, empInfoCtrl.getStateUser);
    // Month
    app.get("/api/empinfo/getmonth", empInfoCtrl.GetMonths);
}



