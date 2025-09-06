const multer = require("multer");
const userSigninController = require("../controllers/userSignin.controller");
const { verifyToken, verifyAdmin } = require('../middlewares/jwt.auth');
const userRoutes = require("./user.routes");
const path = require("path");

// const uploadPath = path.join(__dirname, '../public');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+`${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

module.exports = function (app) {
    //admin register/login
    app.post('/api/user/register', userSigninController.register);
    app.post('/api/user/login', userSigninController.login);
    app.get("/api/user/verify", verifyToken, userSigninController.userValidate);
    //COMPANY ----- create/update/delete/login
    app.post('/api/company/create', upload.single("logo"), userSigninController.CreateCompany);
    app.post('/api/company/update', upload.single("logo"), userSigninController.UpdateCompany);
    app.get('/api/company/view',userSigninController.GetCompany);
    app.post('/api/company/login', userSigninController.CompanyLogin);
    //user roles
    app.post("/api/userrole/create", userSigninController.CreateUserRole);
}