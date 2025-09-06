const monthController = require("../controllers/month.controller");


module.exports = function (app) {
    app.get("/api/month/get", monthController.GetAllMonths);
    app.post("/api/month/insert", monthController.insertMonth);
    app.put("/api/month/update/:id", monthController.UpdateStatus)
};
