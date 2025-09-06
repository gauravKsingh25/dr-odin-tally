
const salaryExpensesCtrl = require("../controllers/salary+expenses.controller");
const multer = require("multer");
const { verifyToken } = require("../middlewares/jwt.auth");



//multer
const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    callback(null, (file.filename = file.originalname));
  },
});
const upload = multer({ storage: storage });



module.exports = async function (app) {
  app.post("/api/salary/insert", verifyToken, upload.single("file"), async function (req, res) {
    if (req.file) {
      await salaryExpensesCtrl.InsertRecord(req.file, req.body, req, res);
    }
  }
  );
  app.get("/api/salary/get", salaryExpensesCtrl.ViewRecord);
  app.get("/api/salary/get/:id", salaryExpensesCtrl.ViewRecord);
  app.put("/api/salary/update/:id", salaryExpensesCtrl.UpdateRecord);
  app.delete("/api/salary/delete/:id", salaryExpensesCtrl.DeleteRecord);
};



