const creditController = require('../controllers/credit.controller')
const {verifyToken} = require("../middlewares/jwt.auth");

module.exports = function (app) {
    app.post('/api/credit/create',verifyToken, creditController.UploadCreditReport);
}