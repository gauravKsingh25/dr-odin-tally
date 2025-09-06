const tallyController = require("../controllers/tally.controller");
const { verifyToken } = require("../middlewares/jwt.auth");


module.exports = function (app) {
    app.post("/api/tally/create",verifyToken,tallyController.CreateTallyReport);
    app.post("/api/tally/rateDifference",verifyToken,tallyController.RateDifference);
    app.post("/api/tally/chqbounce",verifyToken,tallyController.ChequeBounce);
};