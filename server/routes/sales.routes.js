
const controller = require('../controllers/sales.controller');
module.exports = function (app) {
    app.post('/api/sales', controller.createSalesData);
    app.get('/api/totalCount', controller.totalCount);
    app.get('/api/product', controller.ProductData);
    app.get('/api/vendor', controller.vendorData);
    app.get('/api/employee', controller.employeeData);
}
