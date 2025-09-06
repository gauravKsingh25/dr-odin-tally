const csv = require("csvtojson");
const salaryExpensesModel = require("../models/salary+expenses.model");
const monthModel = require("../models/month.model");
const { default: mongoose } = require("mongoose");



const date = new Date();
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const currentMonth = monthNames[date.getMonth()];

// --------------------- Insert ---------------------- start

exports.InsertRecord = async (file, body, req, res) => {
    const compannyId = mongoose.Types.ObjectId(req.userid);
    let arr = [];
    let currMonthID = await monthModel.findOne({ month: currentMonth });

    try {
        if (file.mimetype != 'text/csv') {
            return res.status(200).json({ status: 400, response: 'file type should be csv' });
        }

        await csv().fromFile(file.path).then(async (jsonObj) => {

            if (jsonObj.length === 0) {
                return res.status(200).json({ status: 200, message: "csv is empty" });
            }
            let docCount = await salaryExpensesModel.countDocuments({ monthId: req.body.monthId, year: date.getFullYear() });

            for (let i = 0; i < jsonObj.length; i++) {
                if (!jsonObj[i].expenses) {
                    return res.status(400).json({ status: 400, message: "upload correct file" });
                } else {
                    const slryObj = {
                        sno: docCount + i + 1,
                        name: jsonObj[i].name,
                        designation: jsonObj[i].designation,
                        doj: jsonObj[i].doj,
                        city: jsonObj[i].city,
                        ctc: jsonObj[i].ctc,
                        expenses: jsonObj[i].expenses,
                        companyid: compannyId,
                        monthId: req.body.monthId,
                        year: date.getFullYear()
                    }
                    const check = {
                        $and: [
                            { name: jsonObj[i].name },
                            { designation: jsonObj[i].designation },
                            { doj: jsonObj[i].doj },
                            { city: jsonObj[i].city },
                            { companyid: compannyId },
                            { monthId: req.body.monthId },
                            { year: date.getFullYear() }
                        ]
                    };

                    const resp = await salaryExpensesModel.updateOne(check, { $set: slryObj }, { upsert: true });
                    if (resp) { arr.push(resp) }
                }
                if (jsonObj.length - 1 == i) {
                    res.status(200).json({ status: 201, message: "Successfully Uploaded", response: arr });
                }
            }
        }).catch((err) => {
            return res.status(200).json({ status: 400, messsage: err.message })
        })

    } catch (err) {
        res.status(400).json({ status: 400, messsage: err.message })
    }
}


// --------------------- Retrive ---------------------- start
exports.ViewRecord = async (req, res) => {
    const id = req.params.id;
    //Case I ------------------

    if (req.params && Object.keys(req.params).length == 0) {
        try {
            const resp = await salaryExpensesModel.find({});
            res.status(200).json({ status: 200, response: resp });
        } catch (err) {
            res.status(400).json({ status: 400, response: err.message });
        }
    }
    //Case II ------------------
    else if (req.params.id && Object.keys(req.params).length !== 0) {
        try {
            const employee = await salaryExpensesModel.findOne({ _id: id });
            res.status(200).json({ status: 200, response: employee });
        } catch (err) {
            res.status(400).json({ status: 400, response: err.message });
        }
    }
};


// --------------------- Update ---------------------- start
exports.UpdateRecord = async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    try {
        const valid_emp = await employee_validation(data);
        try {
            const update_resp = await salaryExpensesModel.findByIdAndUpdate({ _id: id },
                valid_emp
            );
            res.status(200)
                .json({ status: 200, response: "Employee Updated Successfully" });
        } catch (err) {
            res.status(200).json({ status: 401, message: "Not Updated", response: err.message });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: "Fill All Fields" });
    }
};


// --------------------- Delete ---------------------- start
exports.DeleteRecord = async (req, res) => {
    const id = req.params.id;
    try {
        const delete_resp = await salaryExpensesModel.deleteOne({ _id: id });
        res.status(200).json({ status: 200, message: "Employee Deleted Successfully", response: delete_resp });
    } catch (err) {
        res.status(400).json({ status: 401, response: err.message });
    }
};

//
//
// ----------------------- Function -----------------------

const employee_validation = (employee) => {
    return new Promise((resolve, reject) => {
        if (
            employee.name.length > 0 &&
            employee.designation.length > 0 &&
            employee.doj.length > 0 &&
            employee.city.length > 0 &&
            employee.ctc > 0 &&
            employee.expenses > 0
        ) {
            resolve(employee);
        } else {
            reject("DETAILS_NOT_VALID");
        }
    });
};