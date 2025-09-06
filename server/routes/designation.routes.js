
const designationCtrl = require("../controllers/designation.controller");
const { verifyToken } = require("../middlewares/jwt.auth");

module.exports = function (app) {
    // Designation
    app.get("/api/designation/get", verifyToken, designationCtrl.GetDesignations);
    app.post("/api/designation/insert", verifyToken, designationCtrl.InsertDesignations);
    app.put("/api/designation/desUpdate", verifyToken, designationCtrl.UpdateDesignations);
    app.delete("/api/designation/deldesignation", verifyToken, designationCtrl.DeleteDesignation);
    // State API's URL
    app.post("/api/designation/createState", verifyToken, designationCtrl.createState);
    app.get("/api/designation/getstate", verifyToken, designationCtrl.GetStates);
    app.put("/api/designation/stateUpdate", verifyToken, designationCtrl.UpdateStates);
    app.delete("/api/designation/DeleteState", verifyToken, designationCtrl.DeleteState);
    // CITY API's URL
    app.get("/api/designation/getcity", verifyToken, designationCtrl.GetCitiesWithState);
    app.get("/api/designation/GetStateCity", verifyToken, designationCtrl.GetStateCity);
    app.post("/api/designation/createCity", verifyToken, designationCtrl.createCity);
    app.put("/api/designation/updateCity", verifyToken, designationCtrl.UpdateCity);
    app.delete('/api/designation/DeleteCity', verifyToken, designationCtrl.DeleteCity);
    //
    app.get("/api/designation/GetZoneState", verifyToken, designationCtrl.GetZoneWiseState);
    app.get("/api/designation/GetStateNameCity", verifyToken, designationCtrl.GetStateNameCity);
};

