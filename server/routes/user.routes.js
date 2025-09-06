const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");
const userModel = require('../models/user.model')

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/user/profile", [authJwt.verifyToken], controller.getProfileDetails);

  app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);

  app.post("/api/upload/profile", [authJwt.verifyToken], controller.upload.single('file'), async (req, res) => {
    let file = req.file;
    let fileName = req.userId + file.originalname
    const up = await userModel.findByIdAndUpdate({ _id: req.userId }, { profile: fileName })
    res.status(200).json(up)
  })
};