const productController = require("../controllers/productReport.controller");
const { verifyToken } = require("../middlewares/jwt.auth");

module.exports = function (app) {
    app.get("/api/products/list", verifyToken, productController.GetProductName);
    app.get("/api/product/getByName", verifyToken, productController.GetProductByName);
    app.get("/api/product/vendors", verifyToken, productController.GetVendorList);
    app.get("/api/vendor/getByName", verifyToken, productController.GetVendorByName);
};