const month = require("../models/month.model");
const monthModel = require("../models/month.model");


// ---------------- Get Months -------------------- start
exports.GetAllMonths = async (req, res) => {

    try {
        const response = await current_status();
        let months = [];
        const resp = await monthModel.find();
        // console.log(resp, "resp")
        res.status(200).json({ status: 200, response: resp });
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};
// ---------------- Get Months -------------------- end

exports.insertMonth = async (req, res) => {
    const data = req.body;
    try {
        const resp = await monthModel.create(data);
        res.status(200).json({ status: 201, response: "Successfully Created" });
    } catch (err) {
        res.status(400).json({ status: 401, response: err.message });
    }
};

var c = 1;
// ---------------- Update Status -------------------- start
exports.UpdateStatus = async (req, res) => {
    const id = req.params.id;
    const data = await monthModel.findOne({ _id: id });

    if (c == 1) {
        data["status"] = true;
    } else if (c == 2) {
        data["status"] = false;
        c = 0;
    }
    c++;

    try {
        const resp = await monthModel.findByIdAndUpdate({ _id: id }, data, { new: true });
        res.status(200).json({ status: 201, message: "Successfully Updated", response: resp });
    } catch (err) {
        res.status(400).json({ status: 401, response: err.message });
    }
};
// ---------------- Update Status -------------------- end



const current_status = async () => {
    try {
        const date = new Date();
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const currMonth = monthNames[date.getMonth()];
        //        const currMonth = monthNames[date.getMonth()];

        const currYear = date.getFullYear();
        const record = await monthModel.find({});
        for (var i = 0; i < record.length; i++) {
            var month = i;
            var newDate = i < 9 ? `${currYear}-0${month + 1}-01` : `${currYear}-${month + 1}-01`;
            var update_res = await monthModel.findOneAndUpdate({ date: record[i].date }, { $set: { date: newDate } });
        };
        const status_resp = await monthModel.updateMany({}, { $set: { status: false } });
        const update = await monthModel.findOneAndUpdate({ month: currMonth }, { status: true }, { new: true });
        return update;

    } catch (err) {
        res.status(400).json({ status: 400, response: "Not Update" });
    }
};