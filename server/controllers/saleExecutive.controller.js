const SalaryExpensesModel = require("../models/salary+expenses.model");
const monthModel = require("../models/month.model");
const employeeInfoModel = require("../models/employeeinfo.model");
const AchivementModel = require("../models/tally.model");
const zoneModel = require("../models/zone.model");
const designationModel = require("../models/designation.model");
const mongoose = require("mongoose");


var date = new Date();
var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
var currMonth = monthNames[date.getMonth()];


exports.SaleExecutiveReport = async (req, res) => {
     const companyId = req.userid;
    const currMonthId = await monthModel.findOne({ month: currMonth });
     try {
        const employeeInfo = await employeeInfoModel.find({ status: true, companyid: companyId }, { "empName": 1, "mnthtarget": 1, "state": 1, "totalAmount": 1, "achivement": 1, "expense": 1 }).populate("state");
        if (parseInt(req.query.currentMonth)) {
 
            const arr = [];
            for (var i = 0; i < employeeInfo.length; i++) {

                var empWithSale = await AchivementModel.findOne({ employee: employeeInfo[i].empName, monthId: currMonthId._id, companyid: companyId }, { "totalAmount": 1, "employee": 1 });
                  if (empWithSale) {
                    const totalAmount = empWithSale.totalAmount;
                    employeeInfo[i].totalAmount = totalAmount;
                    employeeInfo[i].achivement = Math.round((empWithSale.totalAmount / employeeInfo[i].mnthtarget) * 100);
                }
         var empExpense = await SalaryExpensesModel.findOne({ name: employeeInfo[i].empName, monthId: currMonthId._id, companyid: companyId });
                if (empExpense) {
                     const expenses = empExpense.expenses;
                    employeeInfo[i].expenses = expenses;
                }
         
            }
 
            for (var j = 0; j < employeeInfo.length; j++) {
                 if (employeeInfo[j].achivement && employeeInfo[j].expenses) {

                    arr.push(employeeInfo[j]);
                }
            }

             return res.status(200).json({ status: 200, message: "Employee Name,State,Target,Achivement,Total Achivement, Expenditure", response: arr });

        }

        else if (req.query.startDate || req.query.endDate && !req.query.state && !req.query.city) {
            const arr = [];

            let firstDate = new Date(req.query.startDate);
            firstDate.setHours(5, 30, 0, 0);
            let lastDate = new Date(req.query.endDate);
            lastDate.setDate(cm_lastDate.getDate() + 1);
            lastDate.setHours(5, 29, 59, 0);


            //single date filter
            let cltdate = new Date(req.query.startDate);
            cltdate.setHours(29, 29, 59, 0);



            for (var i = 0; i < employeeInfo.length; i++) {
                var empWithSale = await AchivementModel.findOne({ employee: employeeInfo[i].empName, startDate: { $gt: sDate }, endDate: { $lt: endDate }, companyid: companyId }, { "totalAmount": 1, "employee": 1 });
                var empExpense = await SalaryExpensesModel.findOne({ name: employeeInfo[i].empName, startDate: { $gt: sDate }, endDate: { $lt: endDate }, companyid: companyId });
                if (empWithSale) {
                    const totalAmount = empWithSale.totalAmount;
                    employeeInfo[i].totalAmount = totalAmount;
                    employeeInfo[i].achivement = Math.round((empWithSale.totalAmount / employeeInfo[i].mnthtarget) * 100);
                }
                //--------------
                if (empExpense) {
                    const expenses = empExpense.expenses;
                    employeeInfo[i].expenses = expenses;
                }
            }

            for (var j = 0; j < employeeInfo.length; j++) {
                if (employeeInfo[j].achivement && employeeInfo[j].expenses) {
                    arr.push(employeeInfo[j]);
                }
            }
            return res.status(200).json({ status: 200, message: "Employee Name,State,Target,Achivement,Total Achivement, Expenditure", response: arr });
        }
        else if (req.query.state) {
            const arr = [];

            const employeeInfo = await employeeInfoModel.find({ state: req.query.state, status: true }, { "empName": 1, "mnthtarget": 1, "state": 1, "totalAmount": 1, "achivement": 1, "expense": 1 }).populate("state");
            for (var i = 0; i < employeeInfo.length; i++) {

                var empWithSale = await AchivementModel.findOne({ employee: employeeInfo[i].empName }, { "totalAmount": 1, "employee": 1 });

                if (empWithSale) {
                    const totalAmount = empWithSale.totalAmount;
                    employeeInfo[i].totalAmount = totalAmount;
                    employeeInfo[i].achivement = Math.round((empWithSale.totalAmount / employeeInfo[i].mnthtarget) * 100);
                }
                //--------------
                var empExpense = await SalaryExpensesModel.findOne({ name: employeeInfo[i].empName });
                if (empExpense) {
                    const expenses = empExpense.expenses;
                    employeeInfo[i].expenses = expenses;
                }

            }

            for (var j = 0; j < employeeInfo.length; j++) {
                if (employeeInfo[j].achivement && employeeInfo[j].expenses) {
                    arr.push(employeeInfo[j]);
                }
            }


            return res.status(200).json({ status: 200, message: "Employee Name,State,Target,Achivement,Total Achivement, Expenditure", response: arr });

        }
        else if (req.query.city) {
            const arr = [];

            const employeeInfo = await employeeInfoModel.find({ city: req.query.city, status: true }, { "empName": 1, "mnthtarget": 1, "state": 1, "totalAmount": 1, "achivement": 1, "expense": 1 }).populate("state");
            for (var i = 0; i < employeeInfo.length; i++) {

                var empWithSale = await AchivementModel.findOne({ employee: employeeInfo[i].empName }, { "totalAmount": 1, "employee": 1 });

                if (empWithSale) {
                    const totalAmount = empWithSale.totalAmount;
                    employeeInfo[i].totalAmount = totalAmount;
                    employeeInfo[i].achivement = Math.round((empWithSale.totalAmount / employeeInfo[i].mnthtarget) * 100);
                }
                //--------------
                var empExpense = await SalaryExpensesModel.findOne({ name: employeeInfo[i].empName });
                if (empExpense) {
                    const expenses = empExpense.expenses;
                    employeeInfo[i].expenses = expenses;
                }

            }

            for (var j = 0; j < employeeInfo.length; j++) {
                if (employeeInfo[j].achivement && employeeInfo[j].expenses) {
                    arr.push(employeeInfo[j]);
                }
            }


            return res.status(200).json({ status: 200, message: "Employee Name,State,Target,Achivement,Total Achivement, Expenditure", response: arr });

        }

        else if (req.query.startDate && req.query.endDate && req.query.state && req.query.city) {
            const arr = [];

            const firstDate = new Date(req.query.startDate);
            const lastDate = new Date(req.query.endDate);
            const sDate = new Date(firstDate.setDate(firstDate.getDate() - 1));
            sDate.setHours(5, 30, 0, 0);
            const endDate = new Date(lastDate.setDate(lastDate.getDate() - 1 + 1));
            endDate.setHours(5, 30, 0, 0);
            const employeeInfo = await employeeInfoModel.find({ state: req.query.state, city: req.query.city, status: true }, { "empName": 1, "mnthtarget": 1, "state": 1, "totalAmount": 1, "achivement": 1, "expense": 1 }).populate("state");
            for (var i = 0; i < employeeInfo.length; i++) {
                var empWithSale = await AchivementModel.findOne({ employee: employeeInfo[i].empName, startDate: { $gt: sDate }, endDate: { $lt: endDate } }, { "totalAmount": 1, "employee": 1 });
                var empExpense = await SalaryExpensesModel.findOne({ name: employeeInfo[i].empName, startDate: { $gt: sDate }, endDate: { $lt: endDate } });
                if (empWithSale) {
                    const totalAmount = empWithSale.totalAmount;
                    employeeInfo[i].totalAmount = totalAmount;
                    employeeInfo[i].achivement = Math.round((empWithSale.totalAmount / employeeInfo[i].mnthtarget) * 100);
                }
                //--------------
                if (empExpense) {
                    const expenses = empExpense.expenses;
                    employeeInfo[i].expenses = expenses;
                }
            }

            for (var j = 0; j < employeeInfo.length; j++) {
                if (employeeInfo[j].achivement && employeeInfo[j].expenses) {
                    arr.push(employeeInfo[j]);
                }
            }
            return res.status(200).json({ status: 200, message: "Employee Name,State,Target,Achivement,Total Achivement, Expenditure", response: arr });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.response });
    }
};


//------------------ NORTH ---------------------
exports.GetNorthZoneManager = async (req, res) => {
    try {
        const currMonthId = await monthModel.findOne({ month: currMonth });
        //----------------- Head Of Zone ------------------
        const dsgn = await designationModel.findOne({ designation: "Zone Head" });
        const zone = await zoneModel.findOne({ zone: "North" });

        const manager = await designationModel.findOne({ designation: "Manager" });
        // Manager's Details
        const mdetail = await zoneModel.aggregate([{ $match: { zone: "North" } }, {
            $lookup: {
                from: "employeeinfos", localField: "_id", foreignField: "zoneId", as: "employee", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$designation", manager._id] },
                    }
                }]
            }
        },
        { $unwind: "$employee" },
        { $project: { "employee": 1 } },
        {
            $lookup: {
                from: "salary_expenses", localField: "employee.empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": {
                        "$expr": { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Manager"] }] }
                    }
                }]
            }
        },
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$monthId", currMonthId._id] }
                    }
                }]
            }
        }, { $unwind: "$tally" },
        {
            $group: {
                _id: "$employee.empName", name: { $first: "$employee.empName" }, dsgn: { $first: "Manager" }, ytrgt: { $first: "$employee.yrlytarget" },
                slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytdAch: { $first: "$tally.totalAmount" }, color: { $first: "#889293" }, mid: { $first: "$employee._id" }
            }
        }, { $sort: { "ytdAch": -1 } },
        { $project: { _id: 0, mid: 1, name: 1, dsgn: 1, slry: 1, expns: 1, ytrgt: 1, ytrgt: 1, totExp: { $sum: ["$slry", "$expns"] }, ytdAch: 1, totAchPer: { $round: [{ $divide: ["$ytdAch", "$ytrgt"] }, 0] }, color: 1 } }
        ]);
        //----------------------------------- Total -------------------------------------------
        const coltot = await zoneModel.aggregate([{ $match: { zone: "North" } }, {
            $lookup: {
                from: "employeeinfos", localField: "_id", foreignField: "zoneId", as: "employee", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$designation", manager._id] },
                    }
                }]
            }
        },
        { $unwind: "$employee" },
        { $project: { "employee": 1 } },
        {
            $lookup: {
                from: "salary_expenses", localField: "employee.empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$monthId", currMonthId._id] }
                    }
                }]
            }
        },
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    "$match": { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        {
            $group: {
                _id: "$employee.empName", name: { $first: "$employee.empName" }, dsgn: { $first: "Manager" }, ytrgt: { $first: "$employee.yrlytarget" },
                slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytdAch: { $sum: "$tally.totalAmount" }, color: { $first: "#889293" }, mid: { $first: "$employee._id" }
            }
        }, { $sort: { "ytdAch": -1 } },
        { $project: { _id: 0, mid: 1, name: 1, dsgn: 1, slry: 1, expns: 1, ytrgt: 1, ytrgt: 1, totExp: { $sum: ["$slry", "$expns"] }, ytdAch: 1, totAchPer: { $divide: ["$ytdAch", "$ytrgt"] }, color: 1 } },
        { $group: { _id: null, totSlry: { $sum: "$slry" }, totExpns: { $sum: "$expns" }, totExpenditure: { $sum: "$totExp" }, totYtd: { $sum: "$ytrgt" }, totYtdAch: { $sum: "$ytdAch" }, totPer: { $sum: "$totAchPer" } } },
        { $project: { _id: 0, totSlry: 1, totExpns: 1, totExpenditure: 1, totYtd: 1, totYtdAch: 1, totYtdPer: { $round: ["$totPer", 0] } } }
        ]);

        // const hoz = await employeeInfoModel.aggregate([
        //     { $match: { designation: dsgn._id, zoneId: zone._id } },
        //     {
        //         $lookup: {
        //             from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry", pipeline: [{
        //                 "$match": {
        //                     "$expr": { $eq: ["$monthId", currMonthId._id] }, "$expr": { $eq: ["$designation", "Zone Head"] }
        //                 }
        //             }]
        //         }
        //     }, { $unwind: "$slry" },
        //     {
        //         $lookup: {
        //             from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
        //                 $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
        //             }]
        //         }
        //     }, {
        //         $group: {
        //             _id: null, name: { $first: "$empName" }, dsgn: { $first: "Zone Head" }, salary: { $first: coltot[0].totSlry }, expns: { $first: coltot[0].totExpns }, ytrgt: { $first: coltot[0].totYtd },
        //             ytrgtAch: { $first: coltot[0].totYtdAch }, ytrgtPer: { $first: coltot[0].totYtdPer }
        //         }
        //     },
        //     { $project: { _id: 0, name: 1, dsgn: 1, salary: 1, expns: 1, totExp: { $sum: ["$salary", "$expns"] }, ytrgt: 1, ytrgtAch: 1, ytrgtPer: 1 } }
        // ]);

        const hoz = await employeeInfoModel.aggregate([{ $match: { designation: dsgn._id, zoneId: zone._id } },
        {
            $lookup: {
                from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry",
                pipeline: [{
                    "$match": {
                        "$expr": { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Zone Head"] }] }
                    }
                }]
            }
        }, { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "empName", foreignField: "employee", as: "tally", pipeline: [{
                    $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        { $group: { _id: "$tally.employee", name: { $first: "$empName" }, dsgn: { $first: "Zone Head" }, ytrgt: { $first: "$yrlytarget" }, slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, totAch: { $first: "$tally.totalAmount" } } },
        { $project: { _id: 0, name: 1, dsgn: 1, ytrgt: 1, slry: 1, expns: 1, totAch: 1, totExpenditure: { $sum: ["$slry", "$expns"] }, totAchPer: { $round: [{ $divide: ["$totAch", "$ytrgt"] }, 0] } } }
        ]);


        res.status(200).json({ status: 200, message: "North's Managers", HeadOfZone: hoz[0], response: mdetail, coltot });
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message })
    }
};



exports.GetBDElist = async (req, res) => {
    try {
        const currMonthId = await monthModel.findOne({ month: currMonth });

        const bdeDetail = await employeeInfoModel.aggregate([{ $match: { rmId: mongoose.Types.ObjectId(req.query.managerId) } },
        {
            $lookup: {
                from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": {
                        $and: [{ "$expr": { $eq: ["$monthId", currMonthId._id] } }, { "$expr": { $eq: ["$designation", "BDE"] } }]
                    }
                }]
            }
        }, { $unwind: "$slry" }, {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        { $group: { _id: "$slry.name", name: { $first: "$empName" }, dsgn: { $first: "BDE" }, rmId: { $first: "$rmId" }, salary: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytrgt: { $first: "$yrlytarget" }, ytdAch: { $first: { $sum: "$tally.totalAmount" } } } },
        { $sort: { "ytdAch": -1 } },
        { $project: { _id: 0, name: 1, dsgn: 1, rmId: 1, salary: 1, expns: 1, totExp: { $sum: ["$salary", "$expns"] }, ytrgt: 1, ytdAch: 1, totYtdPer: { $round: [{ $divide: ["$ytdAch", "$ytrgt"] }, 2] } } }
        ]);


        // ------------------ Total ------------------------
        const coltot = await employeeInfoModel.aggregate([{ $match: { rmId: mongoose.Types.ObjectId(req.query.managerId) } },
        {
            $lookup: {
                from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$slry" }, {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        { $group: { _id: "$slry.name", name: { $first: "$empName" }, dsgn: { $first: "BDE" }, salary: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytrgt: { $first: "$yrlytarget" }, ytdAch: { $first: { $sum: "$tally.totalAmount" } } } },
        { $sort: { "ytdAch": -1 } },
        { $project: { _id: 0, name: 1, dsgn: 1, salary: 1, expns: 1, totExp: { $sum: ["$salary", "$expns"] }, ytrgt: 1, ytdAch: 1, ytdPer: { $divide: ["$ytdAch", "$ytrgt"] } } },
        { $group: { _id: null, totSlry: { $sum: "$salary" }, totExpns: { $sum: "$expns" }, totExpenditure: { $sum: "$totExp" }, totYtd: { $sum: "$ytrgt" }, totYtdAch: { $sum: "$ytdAch" }, totYtdPer: { $sum: "$ytdPer" } } },
        { $project: { _id: 0, totSlry: 1, totExpns: 1, totExpenditure: 1, totYtd: 1, totYtdAch: 1, totYtdPer: { $round: ["$totYtdPer", 0] } } }
        ]);


        const mdetail = await employeeInfoModel.aggregate([
            { $match: { _id: bdeDetail[0].rmId } },
            {
                $lookup: {
                    from: "salary_expenses", localField: "empName", foreignField: "name", as: "Slry",
                    pipeline: [{
                        $match: {
                            $expr: { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Manager"] }] }
                        }
                    }]
                }
            }, { $unwind: "$Slry" },
            { $group: { _id: "$Slry.name", name: { $first: "$empName" }, dsgn: { $first: "$Slry.designation" }, salary: { $first: coltot[0].totSlry }, expns: { $first: coltot[0].totExpns }, ytrgt: { $first: coltot[0].totYtd }, ytrgtAch: { $first: coltot[0].totYtdAch }, expenditure: { $first: coltot[0].totExpenditure }, totYtdPer: { $first: coltot[0].totYtdPer } } },
        ])

        let manager = mdetail[0];
        res.status(200).json({ status: 200, message: "BDE According Manager", response: bdeDetail, coltot });
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message })
    }
}
// exports.NorthZoneReport = async (req, res) => {
//     try {
//         let total = {};
//         var north = []; let totslry = 0; let totexpns = 0; let totexpenditure = 0; let ytrgt = 0; let trgtAch = 0; let ytrgtPer = 0;
//         const date = new Date();
//         const monthNames = ["January", "February", "March", "April", "May", "June",
//             "July", "August", "September", "October", "November", "December"
//         ];
//         const currMonth = monthNames[date.getMonth()];
//         const currMnthID = await monthModel.findOne({ month: currMonth });
//         //Zone Wise
//         const Zone = await zoneModel.find({});

//         for (var i = 0; i < Zone.length; i++) { // loop start

//             if (Zone[i].zone == "North") { //check
//                 var employeeinfo = await employeeInfoModel.find({ zoneId: Zone[i]._id, status: true }, { "empName": 1, "designation": 1, "yrlytarget": 1, "achivement": 1, "ctc": 1, "expenses": 1, "totExpns": 1, "percent": 1 }).populate("designation");

//                 for (var j = 0; j < employeeinfo.length; j++) {

//                     var yrlyAchivement = await AchivementModel.findOne({ employee: employeeinfo[j].empName, monthId: currMnthID._id }, { "employee": 1, "totalAmount": 1 });

//                     if (yrlyAchivement) {
//                         employeeinfo[j].achivement = yrlyAchivement.totalAmount;

//                         var slryExpns = await SalaryExpensesModel.findOne({ name: yrlyAchivement.employee, monthId: currMnthID._id });
//                         employeeinfo[j].ctc = slryExpns.ctc;
//                         employeeinfo[j].expenses = slryExpns.expenses;
//                         employeeinfo[j].totExpns = (slryExpns.ctc + slryExpns.expenses);

//                         employeeinfo[j].percent = Math.round((yrlyAchivement.totalAmount / employeeinfo[j].yrlytarget) * 100);
//                     }
//                 }

//                 for (var k = 0; k < employeeinfo.length; k++) {
//                     if (employeeinfo[k].expenses && employeeinfo[k].achivement) {

//                         if (Zone[i].zone == "North") {

//                             if (employeeinfo[k].designation.designation === "Zone Head") {
//                                 employeeinfo[k].sort = 1;
//                                 employeeinfo[k].color = "#889293";
//                                 north.push(employeeinfo[k]);

//                             } else if (employeeinfo[k].designation.designation === "Manager") {
//                                 employeeinfo[k].sort = 2;
//                                 employeeinfo[k].color = "#A6B3C3";
//                                 north.push(employeeinfo[k]);

//                             } else if (employeeinfo[k].designation.designation === "BDE") {
//                                 employeeinfo[k].sort = 3;
//                                 employeeinfo[k].color = "";
//                                 north.push(employeeinfo[k]);
//                             }
//                         }
//                     }
//                 }

//                 north.sort((a, b) => (a.sort > b.sort) ? 1 : ((b.sort > a.sort) ? -1 : 0));


//                 for (var a = 0; a < north.length; a++) {
//                     if (north[a].designation.designation !== "Zone Head") {
//                         totslry += north[a].ctc;
//                         totexpns += parseInt(north[a].expenses);
//                         totexpenditure += north[a].totExpns;
//                         ytrgt += north[a].yrlytarget;
//                         trgtAch += north[a].achivement;
//                         ytrgtPer += north[a].percent;
//                     }
//                 }
//                 total = { Salary: totslry, Expense: totexpns, Expenditure: totexpenditure, Ytargt: ytrgt, TrgtAch: trgtAch, Percentage: ytrgtPer };
//             }
//         } // loop end
//         res.status(200).json({ status: 200, message: "North Zone's Report", response: north, total });
//     } catch (err) {
//         res.status(400).json({ status: 400, response: err.message });
//     }
// };



//------------------ SOUTH ---------------------




exports.GetSouthZoneManager = async (req, res) => {
    try {

        const currMonthId = await monthModel.findOne({ month: currMonth });
        const manager = await designationModel.findOne({ designation: "Manager" });

        //----------------- Head Of Zone ------------------
        const dsgn = await designationModel.findOne({ designation: "Zone Head" });
        const zone = await zoneModel.findOne({ zone: "South" });
        // const hoz = await employeeInfoModel.findOne({ designation: dsgn._id, zoneId: zone._id });
        // const hoz = await employeeInfoModel.aggregate([
        //     { $match: { designation: dsgn._id, zoneId: zone._id } },
        //     {
        //         $lookup: {
        //             from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry", pipeline: [{
        //                 "$match": {
        //                     "$expr": { $eq: ["$monthId", currMonthId._id] }, "$expr": { $eq: ["$designation", "Zone Head"] }
        //                 }
        //             }]
        //         }
        //     }, { $unwind: "$slry" },
        //     {
        //         $lookup: {
        //             from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
        //                 $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
        //             }]
        //         }
        //     }, {
        //         $group: {
        //             _id: null, name: { $first: "$empName" }, dsgn: { $first: "Zone Head" }, salary: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytrgt: { $first: "$yrlytarget" },
        //             ytrgtAch: { $first: "Achieved" }, ytrgtPer: { $first: "Percent" }
        //         }
        //     },
        //     { $project: { _id: 0, name: 1, dsgn: 1, salary: 1, expns: 1, totExp: { $sum: ["$salary", "$expns"] }, ytrgt: 1, ytrgtAch: 1, ytrgtPer: 1 } }
        // ]);

        //------------------------------------------------------------------------------------------------------

        const mdetail = await zoneModel.aggregate([{ $match: { zone: "South" } }, {
            $lookup: {
                from: "employeeinfos", localField: "_id", foreignField: "zoneId", as: "employee", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$designation", manager._id] },
                    }
                }]
            }
        },
        { $unwind: "$employee" },
        { $project: { "employee": 1 } },
        {
            $lookup: {
                from: "salary_expenses", localField: "employee.empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": {
                        "$expr": { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Manager"] }] }
                    }
                }]
            }
        },
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    "$match": { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        {
            $group: {
                _id: "$employee.empName", name: { $first: "$employee.empName" }, dsgn: { $first: "Manager" }, ytrgt: { $first: "$employee.yrlytarget" },
                slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytdAch: { $sum: "$tally.totalAmount" }, color: { $first: "#889293" }, mid: { $first: "$employee._id" }
            }
        }, { $sort: { "ytdAch": -1 } },
        { $project: { _id: 0, name: 1, mid: 1, dsgn: 1, slry: 1, expns: 1, ytrgt: 1, ytrgt: 1, totExp: { $sum: ["$slry", "$expns"] }, ytdAch: 1, totAchPer: { $round: [{ $divide: ["$ytdAch", "$ytrgt"] }, 0] }, color: 1 } }
        ]);

        // ----------------- Total ------------------------
        const coltot = await zoneModel.aggregate([{ $match: { zone: "South" } }, {
            $lookup: {
                from: "employeeinfos", localField: "_id", foreignField: "zoneId", as: "employee", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$designation", manager._id] },
                    }
                }]
            }
        },
        { $unwind: "$employee" },
        { $project: { "employee": 1 } },
        {
            $lookup: {
                from: "salary_expenses", localField: "employee.empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$monthId", currMonthId._id] }
                    }
                }]
            }
        },
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    "$match": { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        {
            $group: {
                _id: "$employee.empName", name: { $first: "$employee.empName" }, dsgn: { $first: "Manager" }, ytrgt: { $first: "$employee.yrlytarget" },
                slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytdAch: { $sum: "$tally.totalAmount" }, color: { $first: "#889293" }, mid: { $first: "$employee._id" }
            }
        }, { $sort: { "ytdAch": -1 } },
        { $project: { _id: 0, name: 1, mid: 1, dsgn: 1, slry: 1, expns: 1, ytrgt: 1, ytrgt: 1, totExp: { $sum: ["$slry", "$expns"] }, ytdAch: 1, totAchPer: { $divide: ["$ytdAch", "$ytrgt"] }, color: 1 } },
        { $group: { _id: null, totSlry: { $sum: "$slry" }, totExpns: { $sum: "$expns" }, totExpenditure: { $sum: "$totExp" }, totYtd: { $sum: "$ytrgt" }, totYtdAch: { $sum: "$ytdAch" }, totPer: { $sum: "$totAchPer" } } },
        { $project: { _id: 0, totSlry: 1, totExpns: 1, totExpenditure: 1, totYtd: 1, totYtdAch: 1, totYtdPer: { $round: ["$totPer", 0] } } }
        ]);
        //
        const hoz = await employeeInfoModel.aggregate([{ $match: { designation: dsgn._id, zoneId: zone._id } },
        {
            $lookup: {
                from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry",
                pipeline: [{
                    "$match": {
                        "$expr": { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Zone Head"] }] }
                    }
                }]
            }
        }, { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "empName", foreignField: "employee", as: "tally", pipeline: [{
                    $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        { $group: { _id: "$tally.employee", name: { $first: "$empName" }, dsgn: { $first: "Zone Head" }, ytrgt: { $first: "$yrlytarget" }, slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, totAch: { $first: "$tally.totalAmount" } } },
        { $project: { _id: 0, name: 1, dsgn: 1, ytrgt: 1, slry: 1, expns: 1, totAch: 1, totExpenditure: { $sum: ["$slry", "$expns"] }, totAchPer: { $round: [{ $divide: ["$totAch", "$ytrgt"] }, 0] } } }
        ]);


        ///////////        
        res.status(200).json({ status: 200, message: "South's Managers", HeadOfZone: hoz[0], response: mdetail, coltot })
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message })
    }
}
// exports.SouthZoneReport = async (req, res) => {
//     let total = {};
//     let totslry = 0; let totexpns = 0; let totexpenditure = 0; let ytrgt = 0; let trgtAch = 0; let ytrgtPer = 0;
//     try {
//         var south = [];
//         const date = new Date();
//         const monthNames = ["January", "February", "March", "April", "May", "June",
//             "July", "August", "September", "October", "November", "December"
//         ];
//         const currMonth = monthNames[date.getMonth()];
//         const currMnthID = await monthModel.findOne({ month: currMonth });
//         //Zone Wise
//         const Zone = await zoneModel.find({});

//         for (var i = 0; i < Zone.length; i++) { // loop start
//             if (Zone[i].zone == "South") { //check
//                 var employeeinfo = await employeeInfoModel.find({ zoneId: Zone[i]._id, status: true }, { "empName": 1, "designation": 1, "yrlytarget": 1, "achivement": 1, "ctc": 1, "expenses": 1, "totExpns": 1, "percent": 1 }).populate("designation");

//                 for (var j = 0; j < employeeinfo.length; j++) {

//                     var yrlyAchivement = await AchivementModel.findOne({ employee: employeeinfo[j].empName, monthId: currMnthID._id }, { "employee": 1, "totalAmount": 1 });

//                     if (yrlyAchivement) {
//                         employeeinfo[j].achivement = yrlyAchivement.totalAmount;

//                         var slryExpns = await SalaryExpensesModel.findOne({ name: yrlyAchivement.employee, monthId: currMnthID._id });
//                         employeeinfo[j].ctc = slryExpns.ctc;
//                         employeeinfo[j].expenses = slryExpns.expenses;
//                         employeeinfo[j].totExpns = (slryExpns.ctc + slryExpns.expenses);
//                         employeeinfo[j].percent = Math.round((yrlyAchivement.totalAmount / employeeinfo[j].yrlytarget) * 100);
//                     }
//                 }

//                 for (var k = 0; k < employeeinfo.length; k++) {
//                     if (employeeinfo[k].expenses && employeeinfo[k].achivement) {
//                         if (Zone[i].zone == "South") {
//                             if (employeeinfo[k].designation.designation === "Zone Head") {
//                                 employeeinfo[k].sort = 1;
//                                 employeeinfo[k].color = "#889293";
//                                 south.push(employeeinfo[k]);

//                             } else if (employeeinfo[k].designation.designation === "Manager") {
//                                 employeeinfo[k].sort = 2;
//                                 employeeinfo[k].color = "#A6B3C3";
//                                 south.push(employeeinfo[k]);

//                             } else if (employeeinfo[k].designation.designation === "BDE") {
//                                 employeeinfo[k].sort = 3;
//                                 employeeinfo[k].color = "";
//                                 south.push(employeeinfo[k]);
//                             }
//                         }
//                     }
//                 }
//                 south.sort((a, b) => (a.sort > b.sort) ? 1 : ((b.sort > a.sort) ? -1 : 0));

//                 for (var a = 0; a < south.length; a++) {
//                     if (south[a].designation.designation !== "Zone Head") {
//                         totslry += south[a].ctc;
//                         totexpns += parseInt(south[a].expenses);
//                         totexpenditure += south[a].totExpns;
//                         ytrgt += south[a].yrlytarget;
//                         trgtAch += south[a].achivement;
//                         ytrgtPer += south[a].percent;
//                     }
//                 }

//                 total = { Salary: totslry, Expense: totexpns, Expenditure: totexpenditure, Ytargt: ytrgt, TrgtAch: trgtAch, Percentage: ytrgtPer };
//             } //check 
//         }
//         res.status(200).json({ status: 200, message: "South Zone's Report", response: south, total });
//     } catch (err) {
//         res.status(400).json({ status: 400, response: err.message });
//     }
// }




//------------------ EAST ---------------------




exports.GetEastZoneManager = async (req, res) => {
    try {
         const currMonthId = await monthModel.findOne({ month: currMonth });
        const manager = await designationModel.findOne({ designation: "Manager" });

        //----------------- Head Of Zone ------------------
        const dsgn = await designationModel.findOne({ designation: "Zone Head" });
        const zone = await zoneModel.findOne({ zone: "East" });
        // const hoz = await employeeInfoModel.findOne({ designation: dsgn._id, zoneId: zone._id });
        // const hoz = await employeeInfoModel.aggregate([
        //     { $match: { designation: dsgn._id, zoneId: zone._id } },
        //     {
        //         $lookup: {
        //             from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry", pipeline: [{
        //                 "$match": {
        //                     "$expr": { $eq: ["$monthId", currMonthId._id] }, "$expr": { $eq: ["$designation", "Zone Head"] }
        //                 }
        //             }]
        //         }
        //     }, { $unwind: "$slry" },
        //     {
        //         $lookup: {
        //             from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
        //                 $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
        //             }]
        //         }
        //     }, {
        //         $group: {
        //             _id: null, name: { $first: "$empName" }, dsgn: { $first: "Zone Head" }, salary: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytrgt: { $first: "$yrlytarget" },
        //             ytrgtAch: { $first: "Achieved" }, ytrgtPer: { $first: "Percent" }
        //         }
        //     },
        //     { $project: { _id: 0, name: 1, dsgn: 1, salary: 1, expns: 1, totExp: { $sum: ["$salary", "$expns"] }, ytrgt: 1, ytrgtAch: 1, ytrgtPer: 1 } }
        // ]);

        //--------------------------------------------------------------------------------
         const mdetail = await zoneModel.aggregate([{ $match: { zone: "East" } }, {
            $lookup: {
                from: "employeeinfos", localField: "_id", foreignField: "zoneId", as: "employee", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$designation", manager._id] },
                    }
                }]
            }
        },
        { $unwind: "$employee" },
        { $project: { "employee": 1 } },
        {
            $lookup: {
                from: "salary_expenses", localField: "employee.empName", foreignField: "name", as: "slry",
                 pipeline: [{
                    "$match": {
                        "$expr": { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Manager"] }] }
                    }
                }]
            }
        },
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    "$match": { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        {
            $group: {
                _id: "$employee.empName", name: { $first: "$employee.empName" }, dsgn: { $first: "Manager" }, ytrgt: { $first: "$employee.yrlytarget" },
                slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytdAch: { $sum: "$tally.totalAmount" }, color: { $first: "#889293" }, mid: { $first: "$employee._id" }
            }
        }, { $sort: { "ytdAch": -1 } },
        {
            $project: { _id: 0, mid: 1, name: 1, dsgn: 1, slry: 1, expns: 1, ytrgt: 1, ytrgt: 1, totExp: { $sum: ["$slry", "$expns"] }, ytdAch: 1, totAchPer: { $round: [{ $divide: ["$ytdAch", "$ytrgt"] }, 0] }, color: 1 }
        }
    ]);

        // ----------------------- Total ----------------------
        const coltot = await zoneModel.aggregate([{ $match: { zone: "East" } }, {
            $lookup: {
                from: "employeeinfos", localField: "_id", foreignField: "zoneId", as: "employee", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$designation", manager._id] },
                    }
                }]
            }
        },
        { $unwind: "$employee" },
        { $project: { "employee": 1 } },
        {
            $lookup: {
                from: "salary_expenses", localField: "employee.empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$monthId", currMonthId._id] }
                    }
                }]
            }
        },
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    "$match": { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        {
            $group: {
                _id: "$employee.empName", name: { $first: "$employee.empName" }, dsgn: { $first: "Manager" }, ytrgt: { $first: "$employee.yrlytarget" },
                slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytdAch: { $sum: "$tally.totalAmount" }, color: { $first: "#889293" }, mid: { $first: "$employee._id" }
            }
        }, { $sort: { "ytdAch": -1 } },
        {
            $project: { _id: 0, mid: 1, name: 1, dsgn: 1, slry: 1, expns: 1, ytrgt: 1, ytrgt: 1, totExp: { $sum: ["$slry", "$expns"] }, ytdAch: 1, totAchPer: { $divide: ["$ytdAch", "$ytrgt"] }, color: 1 }
        }, { $group: { _id: null, totSlry: { $sum: "$slry" }, totExpns: { $sum: "$expns" }, totExpenditure: { $sum: "$totExp" }, totYtd: { $sum: "$ytrgt" }, totYtdAch: { $sum: "$ytdAch" }, totPer: { $sum: "$totAchPer" } } },
        { $project: { _id: 0, totSlry: 1, totExpns: 1, totExpenditure: 1, totYtd: 1, totYtdAch: 1, totYtdPer: { $round: ["$totPer", 0] } } }
        ]);


        //
        const hoz = await employeeInfoModel.aggregate([{ $match: { designation: dsgn._id, zoneId: zone._id } },
        {
            $lookup: {
                from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry",
                pipeline: [{
                    "$match": {
                        "$expr": { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Zone Head"] }] }
                    }
                }]
            }
        }, { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "empName", foreignField: "employee", as: "tally", pipeline: [{
                    $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        { $group: { _id: "$tally.employee", name: { $first: "$empName" }, dsgn: { $first: "Zone Head" }, ytrgt: { $first: "$yrlytarget" }, slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, totAch: { $first: "$tally.totalAmount" } } },
        { $project: { _id: 0, name: 1, dsgn: 1, ytrgt: 1, slry: 1, expns: 1, totAch: 1, totExpenditure: { $sum: ["$slry", "$expns"] }, totAchPer: { $round: [{ $divide: ["$totAch", "$ytrgt"] }, 0] } } }
        ]);

         res.status(200).json({ status: 200, message: "East's Managers", HeadOfZone: hoz[0], response: mdetail, coltot })
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message })
    }
}
// exports.EastZoneReport = async (req, res) => {
//     let total = {};
//     let totslry = 0; let totexpns = 0; let totexpenditure = 0; let ytrgt = 0; let trgtAch = 0; let ytrgtPer = 0;
//     try {
//         var east = [];
//         const date = new Date();
//         const monthNames = ["January", "February", "March", "April", "May", "June",
//             "July", "August", "September", "October", "November", "December"
//         ];
//         const currMonth = monthNames[date.getMonth()];
//         const currMnthID = await monthModel.findOne({ month: currMonth });
//         //Zone Wise
//         const Zone = await zoneModel.find({});

//         for (var i = 0; i < Zone.length; i++) { // loop start
//             if (Zone[i].zone == "East") { //check
//                 var employeeinfo = await employeeInfoModel.find({ zoneId: Zone[i]._id, status: true }, { "empName": 1, "designation": 1, "yrlytarget": 1, "achivement": 1, "ctc": 1, "expenses": 1, "totExpns": 1, "percent": 1 }).populate("designation");
//                 for (var j = 0; j < employeeinfo.length; j++) {
//                     var yrlyAchivement = await AchivementModel.findOne({ employee: employeeinfo[j].empName, monthId: currMnthID._id }, { "employee": 1, "totalAmount": 1 });
//                     if (yrlyAchivement) {
//                         employeeinfo[j].achivement = yrlyAchivement.totalAmount;
//                         var slryExpns = await SalaryExpensesModel.findOne({ name: yrlyAchivement.employee, monthId: currMnthID._id });
//                         employeeinfo[j].ctc = slryExpns.ctc;
//                         employeeinfo[j].expenses = slryExpns.expenses;
//                         employeeinfo[j].totExpns = (slryExpns.ctc + slryExpns.expenses);
//                         employeeinfo[j].percent = Math.round((yrlyAchivement.totalAmount / employeeinfo[j].yrlytarget) * 100);
//                     }
//                 }
//                 for (var k = 0; k < employeeinfo.length; k++) {
//                     if (employeeinfo[k].expenses && employeeinfo[k].achivement) {
//                         if (Zone[i].zone == "East") {
//                             if (employeeinfo[k].designation.designation === "Zone Head") {
//                                 employeeinfo[k].sort = 1;
//                                 employeeinfo[k].color = "#889293";
//                                 east.push(employeeinfo[k]);

//                             } else if (employeeinfo[k].designation.designation === "Manager") {
//                                 employeeinfo[k].sort = 2;
//                                 employeeinfo[k].color = "#A6B3C3";
//                                 east.push(employeeinfo[k]);

//                             } else if (employeeinfo[k].designation.designation === "BDE") {
//                                 employeeinfo[k].sort = 3;
//                                 employeeinfo[k].color = "";
//                                 east.push(employeeinfo[k]);
//                             }
//                         }
//                     }
//                 }

//                 east.sort((a, b) => (a.sort > b.sort) ? 1 : ((b.sort > a.sort) ? -1 : 0));

//                 for (var a = 0; a < east.length; a++) {
//                     if (east[a].designation.designation !== "Zone Head") {
//                         totslry += east[a].ctc;
//                         totexpns += parseInt(east[a].expenses);
//                         totexpenditure += east[a].totExpns;
//                         ytrgt += east[a].yrlytarget;
//                         trgtAch += east[a].achivement;
//                         ytrgtPer += east[a].percent;
//                     }
//                 }
//                 total = { Salary: totslry, Expense: totexpns, Expenditure: totexpenditure, Ytargt: ytrgt, TrgtAch: trgtAch, Percentage: ytrgtPer };
//             }
//         }
//         res.status(200).json({ status: 200, message: "East Zone's Report", response: east, total });
//     } catch (err) {
//         res.status(400).json({ status: 400, response: err.message });
//     }
// };


//------------------ WEST ---------------------





exports.GetWestZoneManager = async (req, res) => {
    try {

        const currMonthId = await monthModel.findOne({ month: currMonth });
        const manager = await designationModel.findOne({ designation: "Manager" });

        //----------------- Head Of Zone ------------------
        const dsgn = await designationModel.findOne({ designation: "Zone Head" });
        const zone = await zoneModel.findOne({ zone: "West" });

        // const hoz = await employeeInfoModel.aggregate([
        //     { $match: { designation: dsgn._id, zoneId: zone._id } },
        //     {
        //         $lookup: {
        //             from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry", pipeline: [{
        //                 "$match": {
        //                     "$expr": { $eq: ["$monthId", currMonthId._id] }, "$expr": { $eq: ["$designation", "Zone Head"] }
        //                 }
        //             }]
        //         }
        //     }, { $unwind: "$slry" },
        //     {
        //         $lookup: {
        //             from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
        //                 $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
        //             }]
        //         }
        //     }, {
        //         $group: {
        //             _id: null, name: { $first: "$empName" }, dsgn: { $first: "Zone Head" }, salary: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytrgt: { $first: "$yrlytarget" },
        //             ytrgtAch: { $first: "Achieved" }, ytrgtPer: { $first: "Percent" }
        //         }
        //     },
        //     { $project: { _id: 0, name: 1, dsgn: 1, salary: 1, expns: 1, totExp: { $sum: ["$salary", "$expns"] }, ytrgt: 1, ytrgtAch: 1, ytrgtPer: 1 } }
        // ]);

        //----------------------------------------------------------------------------------------------------------------------------


        const mdetail = await zoneModel.aggregate([{ $match: { zone: "West" } }, {
            $lookup: {
                from: "employeeinfos", localField: "_id", foreignField: "zoneId", as: "employee", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$designation", manager._id] },
                    }
                }]
            }
        },
        { $unwind: "$employee" },
        { $project: { "employee": 1 } },
        {
            $lookup: {
                from: "salary_expenses", localField: "employee.empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": {
                        "$expr": { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Manager"] }] }
                    }
                }]
            }
        },
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    "$match": { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        {
            $group: {
                _id: "$employee.empName", name: { $first: "$employee.empName" }, dsgn: { $first: "Manager" }, ytrgt: { $first: "$employee.yrlytarget" },
                slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytdAch: { $sum: "$tally.totalAmount" }, color: { $first: "#889293" }, mid: { $first: "$employee._id" }
            }
        }, { $sort: { "ytdAch": -1 } },
        { $project: { _id: 0, mid: 1, name: 1, dsgn: 1, slry: 1, expns: 1, ytrgt: 1, ytrgt: 1, totExp: { $sum: ["$slry", "$expns"] }, ytdAch: 1, totAchPer: { $round: [{ $divide: ["$ytdAch", "$ytrgt"] }, 0] }, color: 1 } }
        ]);

        //------------------------ Total ------------------------------
        const coltot = await zoneModel.aggregate([{ $match: { zone: "West" } }, {
            $lookup: {
                from: "employeeinfos", localField: "_id", foreignField: "zoneId", as: "employee", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$designation", manager._id] },
                    }
                }]
            }
        },
        { $unwind: "$employee" },
        { $project: { "employee": 1 } },
        {
            $lookup: {
                from: "salary_expenses", localField: "employee.empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$monthId", currMonthId._id] }
                    }
                }]
            }
        },
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    "$match": { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        {
            $group: {
                _id: "$employee.empName", name: { $first: "$employee.empName" }, dsgn: { $first: "Manager" }, ytrgt: { $first: "$employee.yrlytarget" },
                slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytdAch: { $sum: "$tally.totalAmount" }, color: { $first: "#889293" }, mid: { $first: "$employee._id" }
            }
        }, { $sort: { "ytdAch": -1 } },
        { $project: { _id: 0, mid: 1, name: 1, dsgn: 1, slry: 1, expns: 1, ytrgt: 1, ytrgt: 1, totExp: { $sum: ["$slry", "$expns"] }, ytdAch: 1, totAchPer: { $divide: ["$ytdAch", "$ytrgt"] }, color: 1 } },
        { $group: { _id: null, totSlry: { $sum: "$slry" }, totExpns: { $sum: "$expns" }, totExpenditure: { $sum: "$totExp" }, totYtd: { $sum: "$ytrgt" }, totYtdAch: { $sum: "$ytdAch" }, totPer: { $sum: "$totAchPer" } } },
        { $project: { _id: 0, totSlry: 1, totExpns: 1, totExpenditure: 1, totYtd: 1, totYtdAch: 1, totYtdPer: { $round: ["$totPer", 0] } } }
        ]);

        //
        const hoz = await employeeInfoModel.aggregate([{ $match: { designation: dsgn._id, zoneId: zone._id } },
        {
            $lookup: {
                from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry",
                pipeline: [{
                    "$match": {
                        "$expr": { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Zone Head"] }] }
                    }
                }]
            }
        }, { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "empName", foreignField: "employee", as: "tally",
                 pipeline: [{
                    $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }
        , { $unwind: "$tally" },
        { $group: { _id: "$tally.employee", name: { $first: "$empName" }, dsgn: { $first: "Zone Head" }, ytrgt: { $first: "$yrlytarget" }, slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, totAch: { $first: "$tally.totalAmount" } } },
        { $project: { _id: 0, name: 1, dsgn: 1, ytrgt: 1, slry: 1, expns: 1, totAch: 1, totExpenditure: { $sum: ["$slry", "$expns"] }, totAchPer: { $round: [{ $divide: ["$totAch", "$ytrgt"] }, 0] } } }
        ]);

         res.status(200).json({ status: 200, message: "West's Managers", HeadOfZone: hoz[0], response: mdetail, coltot })
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message })
    }
}
// exports.WestZoneReport = async (req, res) => {
//     let total = {};
//     let totslry = 0; let totexpns = 0; let totexpenditure = 0; let ytrgt = 0; let trgtAch = 0; let ytrgtPer = 0;
//     try {
//         var west = [];
//         const date = new Date();
//         const monthNames = ["January", "February", "March", "April", "May", "June",
//             "July", "August", "September", "October", "November", "December"
//         ];
//         const currMonth = monthNames[date.getMonth()];
//         const currMnthID = await monthModel.findOne({ month: currMonth });
//         //Zone Wise
//         const Zone = await zoneModel.find({});

//         for (var i = 0; i < Zone.length; i++) { // loop start
//             if (Zone[i].zone == "West") { //check
//                 var employeeinfo = await employeeInfoModel.find({ zoneId: Zone[i]._id, status: true }, { "empName": 1, "designation": 1, "yrlytarget": 1, "achivement": 1, "ctc": 1, "expenses": 1, "totExpns": 1, "percent": 1 }).populate("designation");

//                 for (var j = 0; j < employeeinfo.length; j++) {

//                     var yrlyAchivement = await AchivementModel.findOne({ employee: employeeinfo[j].empName, monthId: currMnthID._id }, { "employee": 1, "totalAmount": 1 });

//                     if (yrlyAchivement) {
//                         employeeinfo[j].achivement = yrlyAchivement.totalAmount;

//                         var slryExpns = await SalaryExpensesModel.findOne({ name: yrlyAchivement.employee, monthId: currMnthID._id });
//                         employeeinfo[j].ctc = slryExpns.ctc;
//                         employeeinfo[j].expenses = slryExpns.expenses;
//                         employeeinfo[j].totExpns = (slryExpns.ctc + slryExpns.expenses);
//                         employeeinfo[j].percent = Math.round((yrlyAchivement.totalAmount / employeeinfo[j].yrlytarget) * 100);
//                     }
//                 }
//                 for (var k = 0; k < employeeinfo.length; k++) {
//                     if (employeeinfo[k].expenses && employeeinfo[k].achivement) {
//                         if (Zone[i].zone == "West") {
//                             if (employeeinfo[k].designation.designation === "Zone Head") {
//                                 employeeinfo[k].sort = 1;
//                                 employeeinfo[k].color = "#889293";
//                                 west.push(employeeinfo[k]);

//                             } else if (employeeinfo[k].designation.designation === "Manager") {
//                                 employeeinfo[k].sort = 2;
//                                 employeeinfo[k].color = "#A6B3C3";
//                                 west.push(employeeinfo[k]);

//                             } else if (employeeinfo[k].designation.designation === "BDE") {
//                                 employeeinfo[k].sort = 3;
//                                 employeeinfo[k].color = "";
//                                 west.push(employeeinfo[k]);
//                             }
//                         }
//                     }
//                 }

//                 west.sort((a, b) => (a.sort > b.sort) ? 1 : ((b.sort > a.sort) ? -1 : 0));

//                 for (var a = 0; a < west.length; a++) {
//                     if (west[a].designation.designation !== "Zone Head") {
//                         totslry += west[a].ctc;
//                         totexpns += parseInt(west[a].expenses);
//                         totexpenditure += west[a].totExpns;
//                         ytrgt += west[a].yrlytarget;
//                         trgtAch += west[a].achivement;
//                         ytrgtPer += west[a].percent;
//                     }
//                 }
//                 total = { Salary: totslry, Expense: totexpns, Expenditure: totexpenditure, Ytargt: ytrgt, TrgtAch: trgtAch, Percentage: ytrgtPer };
//             } //check
//         }
//         res.status(200).json({ status: 200, message: "West Zone's Report", response: west, total });
//     } catch (err) {
//         res.status(400).json({ status: 400, response: err.message });
//     }

// };




//------------------ CENTRAL ---------------------





exports.GetCentralZoneManager = async (req, res) => {
    try {
        const currMonthId = await monthModel.findOne({ month: currMonth });
        const manager = await designationModel.findOne({ designation: "Manager" });

        //----------------- Head Of Zone ------------------
        const dsgn = await designationModel.findOne({ designation: "Zone Head" });
        const zone = await zoneModel.findOne({ zone: "Central" });
        // const hoz = await employeeInfoModel.findOne({ designation: dsgn._id, zoneId: zone._id });

        // const hoz = await employeeInfoModel.aggregate([
        //     { $match: { designation: dsgn._id, zoneId: zone._id } },
        //     {
        //         $lookup: {
        //             from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry", pipeline: [{
        //                 "$match": {
        //                     "$expr": { $eq: ["$monthId", currMonthId._id] }, "$expr": { $eq: ["$designation", "Zone Head"] }
        //                 }
        //             }]
        //         }
        //     }, { $unwind: "$slry" },
        //     {
        //         $lookup: {
        //             from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
        //                 $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
        //             }]
        //         }
        //     }, {
        //         $group: {
        //             _id: null, name: { $first: "$empName" }, dsgn: { $first: "Zone Head" }, salary: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytrgt: { $first: "$yrlytarget" },
        //             ytrgtAch: { $first: "Achieved" }, ytrgtPer: { $first: "Percent" }
        //         }
        //     },
        //     { $project: { _id: 0, name: 1, dsgn: 1, salary: 1, expns: 1, totExp: { $sum: ["$salary", "$expns"] }, ytrgt: 1, ytrgtAch: 1, ytrgtPer: 1 } }
        // ]);
        //--------------------------------------------------------------------------------------------------------------------------------


        const mdetail = await zoneModel.aggregate([{ $match: { zone: "Central" } }, {
            $lookup: {
                from: "employeeinfos", localField: "_id", foreignField: "zoneId", as: "employee", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$designation", manager._id] },
                    }
                }]
            }
        },
        { $unwind: "$employee" },
        { $project: { "employee": 1 } },
        {
            $lookup: {
                from: "salary_expenses", localField: "employee.empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": {
                        "$expr": { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Manager"] }] }
                    }
                }]
            }
        },
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    "$match": { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        {
            $group: {
                _id: "$employee.empName", name: { $first: "$employee.empName" }, dsgn: { $first: "Manager" }, ytrgt: { $first: "$employee.yrlytarget" },
                slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytdAch: { $sum: "$tally.totalAmount" }, color: { $first: "#889293" }, mid: { $first: "$employee._id" }
            }
        },
        { $project: { _id: 0, mid: 1, name: 1, dsgn: 1, slry: 1, expns: 1, ytrgt: 1, ytrgt: 1, totExp: { $sum: ["$slry", "$expns"] }, ytdAch: 1, totAchPer: { $round: [{ $divide: ["$ytdAch", "$ytrgt"] }, 0] }, color: 1 } }
        ]);

        // -------------------- Total ------------------------
        const coltot = await zoneModel.aggregate([{ $match: { zone: "Central" } }, {
            $lookup: {
                from: "employeeinfos", localField: "_id", foreignField: "zoneId", as: "employee", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$designation", manager._id] },
                    }
                }]
            }
        },
        { $unwind: "$employee" },
        { $project: { "employee": 1 } },
        {
            $lookup: {
                from: "salary_expenses", localField: "employee.empName", foreignField: "name", as: "slry", pipeline: [{
                    "$match": {
                        "$expr": { $eq: ["$monthId", currMonthId._id] }
                    }
                }]
            }
        },
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "slry.name", foreignField: "employee", as: "tally", pipeline: [{
                    "$match": { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        {
            $group: {
                _id: "$employee.empName", name: { $first: "$employee.empName" }, dsgn: { $first: "Manager" }, ytrgt: { $first: "$employee.yrlytarget" },
                slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, ytdAch: { $sum: "$tally.totalAmount" }, color: { $first: "#889293" }, mid: { $first: "$employee._id" }
            }
        },
        { $project: { _id: 0, mid: 1, name: 1, dsgn: 1, slry: 1, expns: 1, ytrgt: 1, ytrgt: 1, totExp: { $sum: ["$slry", "$expns"] }, ytdAch: 1, totAchPer: { $divide: ["$ytdAch", "$ytrgt"] }, color: 1 } },
        { $group: { _id: null, totSlry: { $sum: "$slry" }, totExpns: { $sum: "$expns" }, totExpenditure: { $sum: "$totExp" }, totYtd: { $sum: "$ytrgt" }, totYtdAch: { $sum: "$ytdAch" }, totPer: { $sum: "$totAchPer" } } },
        { $project: { _id: 0, totSlry: 1, totExpns: 1, totExpenditure: 1, totYtd: 1, totYtdAch: 1, totYtdPer: { $round: ["$totPer", 0] } } }
        ]);

        //
        const hoz = await employeeInfoModel.aggregate([{ $match: { designation: dsgn._id, zoneId: zone._id } },
        {
            $lookup: {
                from: "salary_expenses", localField: "empName", foreignField: "name", as: "slry",
                pipeline: [{
                    "$match": {
                        "$expr": { $and: [{ $eq: ["$monthId", currMonthId._id] }, { $eq: ["$designation", "Zone Head"] }] }
                    }
                }]
            }
        }, 
        { $unwind: "$slry" },
        {
            $lookup: {
                from: "tallies", localField: "empName", foreignField: "employee", as: "tally", pipeline: [{
                    $match: { "$expr": { $eq: ["$monthId", currMonthId._id] } }
                }]
            }
        }, { $unwind: "$tally" },
        { $group: { _id: "$tally.employee", name: { $first: "$empName" }, dsgn: { $first: "Zone Head" }, ytrgt: { $first: "$yrlytarget" }, slry: { $first: "$slry.ctc" }, expns: { $first: "$slry.expenses" }, totAch: { $first: "$tally.totalAmount" } } },
        { $project: { _id: 0, name: 1, dsgn: 1, ytrgt: 1, slry: 1, expns: 1, totAch: 1, totExpenditure: { $sum: ["$slry", "$expns"] }, totAchPer: { $round: [{ $divide: ["$totAch", "$ytrgt"] }, 0] } } }
        ]);
        res.status(200).json({ status: 200, message: "Central's Managers", HeadOfZone: hoz[0], response: mdetail, coltot })
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message })
    }
}
// exports.CentralZoneReport = async (req, res) => {
//     let total = {};
//     let totslry = 0; let totexpns = 0; let totexpenditure = 0; let ytrgt = 0; let trgtAch = 0; let ytrgtPer = 0;
//     try {
//         var central = [];
//         const date = new Date();
//         const monthNames = ["January", "February", "March", "April", "May", "June",
//             "July", "August", "September", "October", "November", "December"
//         ];
//         const currMonth = monthNames[date.getMonth()];
//         const currMnthID = await monthModel.findOne({ month: currMonth });
//         //Zone Wise
//         const Zone = await zoneModel.find({});

//         for (var i = 0; i < Zone.length; i++) { // loop start
//             if (Zone[i].zone == "Central") { //check
//                 var employeeinfo = await employeeInfoModel.find({ zoneId: Zone[i]._id, status: true }, { "empName": 1, "designation": 1, "yrlytarget": 1, "achivement": 1, "ctc": 1, "expenses": 1, "totExpns": 1, "percent": 1 }).populate("designation");

//                 for (var j = 0; j < employeeinfo.length; j++) {

//                     var yrlyAchivement = await AchivementModel.findOne({ employee: employeeinfo[j].empName, monthId: currMnthID._id }, { "employee": 1, "totalAmount": 1 });

//                     if (yrlyAchivement) {
//                         employeeinfo[j].achivement = yrlyAchivement.totalAmount;

//                         var slryExpns = await SalaryExpensesModel.findOne({ name: yrlyAchivement.employee, monthId: currMnthID._id });
//                         employeeinfo[j].ctc = slryExpns.ctc;
//                         employeeinfo[j].expenses = slryExpns.expenses;
//                         employeeinfo[j].totExpns = (slryExpns.ctc + slryExpns.expenses);
//                         employeeinfo[j].percent = Math.round((yrlyAchivement.totalAmount / employeeinfo[j].yrlytarget) * 100);
//                     }
//                 }
//                 for (var k = 0; k < employeeinfo.length; k++) {
//                     if (employeeinfo[k].expenses && employeeinfo[k].achivement) {
//                         if (Zone[i].zone == "Central") {
//                             if (employeeinfo[k].designation.designation === "Zone Head") {
//                                 employeeinfo[k].sort = 1;
//                                 employeeinfo[k].color = "#889293";
//                                 central.push(employeeinfo[k]);

//                             } else if (employeeinfo[k].designation.designation === "Manager") {
//                                 employeeinfo[k].sort = 2;
//                                 employeeinfo[k].color = "#A6B3C3";
//                                 central.push(employeeinfo[k]);

//                             } else if (employeeinfo[k].designation.designation === "BDE") {
//                                 employeeinfo[k].sort = 3;
//                                 employeeinfo[k].color = "";
//                                 central.push(employeeinfo[k]);
//                             }
//                         }
//                     }
//                 }

//                 central.sort((a, b) => (a.sort > b.sort) ? 1 : ((b.sort > a.sort) ? -1 : 0));

//                 for (var a = 0; a < central.length; a++) {
//                     if (central[a].designation.designation !== "Zone Head") {
//                         totslry += central[a].ctc;
//                         totexpns += parseInt(central[a].expenses);
//                         totexpenditure += central[a].totExpns;
//                         ytrgt += central[a].yrlytarget;
//                         trgtAch += central[a].achivement;
//                         ytrgtPer += central[a].percent;
//                     }
//                 }
//                 total = { Salary: totslry, Expense: totexpns, Expenditure: totexpenditure, Ytargt: ytrgt, TrgtAch: trgtAch, Percentage: ytrgtPer };
//             } //check
//         }
//         res.status(200).json({ status: 200, message: "Central Zone's Report", response: central, total });
//     } catch (err) {
//         res.status(400).json({ status: 400, response: err.message });
//     }
// }

