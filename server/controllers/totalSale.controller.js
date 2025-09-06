const tallyModel = require("../models/tally.model");
const monthModel = require("../models/month.model");
const expensesModel = require("../models/salary+expenses.model");
const employeeInfoModel = require("../models/employeeinfo.model");
const designationModel = require("../models/designation.model");
const projectionModel = require("../models/companyTarget.models");
const companyTargetModel = require("../models/companyTarget.models");
const ZoneModel = require("../models/zone.model");
const mongoose = require("mongoose");
const companytrgt = require("../models/companyTarget.models");


const date = new Date();
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentMonth = monthNames[date.getMonth()];
const previousMonth = monthNames[date.getMonth() - 1];


// --------------------- Dashboard -----------------------------
exports.TotalSaleOfMonth = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        let currMonthID = await monthModel.findOne({ month: currentMonth });
        let prevMonthID = await monthModel.findOne({ month: previousMonth });
        let c_mnthTarget = await companyTargetModel.findOne({ month: currMonthID?._id, year: date.getFullYear(), companyid: companyId, trgtAmt: { $exists: true } });
        let p_mnthTarget = await companyTargetModel.findOne({ month: prevMonthID?._id, year: date.getFullYear(), companyid: companyId, trgtAmt: { $exists: true } });

        if (parseInt(req.query.currentMonth)) {
            let currMonthSale = 0;
            let prevMonthSale = 0;
            let currMonth = 0;
            // Current
            const c_match = { $and: [{ monthId: currMonthID?._id }, { year: date.getFullYear() }, { companyid: companyId }] };
            currMonthSale = await tallyModel.aggregate([{ $match: c_match }, { $group: { _id: null, "total": { $sum: "$productPrice" } } }]);
            (currMonthSale.length > 0) ? `${currMonth = currMonthSale[0].total}` : `${currMonth = 0}`;

            // Previous
            const p_match = { $and: [{ monthId: prevMonthID?._id }, { year: date.getFullYear() }, { companyid: companyId }] };
            prevMonthSale = await tallyModel.aggregate([{ $match: p_match }, { $group: { _id: null, "total": { $sum: "$productPrice" } } }]);

            let currPer = 0; let prevPer = 0;

            if (currMonthSale.length > 0 && prevMonthSale.length > 0) {
                currPer = Math.round((currMonthSale[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((prevMonthSale[0].total / p_mnthTarget.trgtAmt) * 100);
            }

            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };
            const result = {
                currMonth: currMonth,
                difference: currPer - prevPer,
                sign: status
            }
            return res.status(200).json({ status: 200, message: "Sale of Current Month", response: result });
        }


        else if (req.query.startDate || req.query.endDate && !req.query.state && !req.query.city) {
            let currMonthSale = 0;
            let prevMonthSale = 0;
            let currMonth = 0;
            let cm_firstDate = new Date(req.query.startDate);
            cm_firstDate.setHours(5, 30, 0, 0);
            let cm_lastDate = new Date(req.query.endDate);
            cm_lastDate.setDate(cm_lastDate.getDate() + 1);
            cm_lastDate.setHours(5, 29, 59, 0);


            //single date filter
            let cltdate = new Date(req.query.startDate);
            cltdate.setHours(29, 29, 59, 0);



            // Current
            let c_date_match;
            (req.query.startDate && req.query.endDate) ? `${c_date_match = { $and: [{ date: { $gte: cm_firstDate } }, { date: { $lte: cm_lastDate } }, { companyid: companyId }] }}` : `${c_date_match = { $and: [{ date: { $gte: cm_firstDate } }, { date: { $lte: cltdate } }, { companyid: companyId }] }}`;
            currMonthSale = await tallyModel.aggregate([{ $match: c_date_match }, { $group: { _id: null, "total": { $sum: "$productPrice" } } }]);
            (currMonthSale.length > 0) ? `${currMonth = currMonthSale[0].total}` : `${currMonth = 0}`;


            // Previous
            let fdate = new Date(cm_firstDate);
            let pm_firstDate = new Date(fdate.setMonth(date.getMonth() - 1));
            pm_firstDate.setHours(5, 30, 0, 0);
            let ldate = new Date(cm_lastDate);
            let pm_lastDate = new Date(ldate.setMonth(date.getMonth() - 1));
            pm_lastDate.setHours(5, 29, 59, 0);

            //single date filter
            let pm_firstDate1 = new Date(fdate.setMonth(date.getMonth() - 1));
            let pltdate = pm_firstDate1;
            pltdate.setHours(29, 29, 59, 0);


            // Sale
            let p_date_match;
            (req.query.startDate && req.query.endDate) ? `${p_date_match = { $and: [{ date: { $gte: pm_firstDate } }, { date: { $lte: pm_lastDate } }, { companyid: companyId }] }}` : `${p_date_match = { $and: [{ date: { $gte: pm_firstDate } }, { date: { $lte: pltdate } }, { companyid: companyId }] }}`;
            prevMonthSale = await tallyModel.aggregate([{ $match: p_date_match }, { $group: { _id: null, "total": { $sum: "$productPrice" } } }]);



            let currPer = 0; let prevPer = 0;

            if (currMonthSale.length > 0 && prevMonthSale.length > 0) {
                currPer = Math.round((currMonthSale[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((prevMonthSale[0].total / p_mnthTarget.trgtAmt) * 100);
            }



            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currMonth,
                difference: currPer - prevPer,
                sign: status
            }

            res.status(200).json({ status: 200, message: "successfully get filter data", response: result });
        }


        else if (req.query.state && !req.query.city) {
            let currMonth = 0;
            //current
            const cm_state_resp = await employeeInfoModel.aggregate([{ $match: { state: mongoose.Types.ObjectId(req.query.state), companyid: companyId } }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", currMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] },
                                    { $eq: ["$companyid", companyId] }
                                ]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } }, { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);

            (cm_state_resp.length > 0) ? `${currMonth = cm_state_resp[0].total}` : `${currMonth = 0}`;

            // previous
            const pm_state_resp = await employeeInfoModel.aggregate([{ $match: { state: mongoose.Types.ObjectId(req.query.state), companyid: companyId } }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", prevMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] }]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } }, { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);


            let currPer = 0; let prevPer = 0;

            if (cm_state_resp.length > 0 && pm_state_resp.length > 0) {
                currPer = Math.round((cm_state_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_state_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }

            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currMonth,
                difference: currPer - prevPer,
                sign: status
            }

            res.status(200).json({ status: 200, message: "successfully get filter data", response: result });
        }


        else if (req.query.state && req.query.city && !req.query.startDate && !req.query.endDate) {
            let currMonth = 0;
            const city_match = { $and: [{ state: mongoose.Types.ObjectId(req.query.state) }, { city: mongoose.Types.ObjectId(req.query.city) }, { companyid: companyId }] };

            const cm_city_resp = await employeeInfoModel.aggregate([{ $match: city_match }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", currMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] },
                                    { $eq: ["$companyid", companyId] }
                                ]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } },
            { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);

            (cm_city_resp.length > 0) ? `${currMonth = cm_city_resp[0].total}` : `${currMonth = 0}`;


            const pm_city_resp = await employeeInfoModel.aggregate([{ $match: city_match }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", prevMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] }]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } },
            { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);

            let currPer = 0; let prevPer = 0;

            if (cm_city_resp.length > 0 && pm_city_resp.length > 0) {
                currPer = Math.round((cm_city_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_city_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }

            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currMonth,
                difference: currPer - prevPer,
                sign: status
            }

            res.status(200).json({ status: 200, message: "successfully get filter data", response: /*{ currMonth }*/ result });
        }


        else if (req.query.startDate && req.query.state && req.query.endDate && req.query.city) {
            let currMonth = 0;
            let cm_firstDate = new Date(req.query.startDate);
            cm_firstDate.setHours(5, 30, 0, 0);
            let cm_lastDate = new Date(req.query.endDate);
            cm_lastDate.setHours(5, 29, 0, 0);


            let fdate = new Date(cm_firstDate);
            let pm_firstDate = new Date(fdate.setMonth(date.getMonth() - 1));
            let ldate = new Date(cm_lastDate);
            let pm_lastDate = new Date(ldate.setMonth(date.getMonth() - 1));

            const match = { $and: [{ state: mongoose.Types.ObjectId(req.query.state) }, { city: mongoose.Types.ObjectId(req.query.city) }, { companyid: companyId }] };
            const cm_date_match = { $expr: { $and: [{ $gte: ["$date", cm_firstDate] }, { $lte: ["$date", cm_lastDate] }, { companyid: companyId }] } };
            const pm_date_match = { $expr: { $and: [{ $gte: ["$date", pm_firstDate] }, { $lte: ["$date", pm_lastDate] }, { companyid: companyId }] } };

            // Current
            const cm_resp = await employeeInfoModel.aggregate([{ $match: match }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: cm_date_match
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } },
            { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);

            (cm_resp.length > 0) ? `${currMonth = cm_resp[0].total}` : `${currMonth = 0}`;


            // Previous
            const pm_resp = await employeeInfoModel.aggregate([{ $match: match }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: pm_date_match
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } },
            { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);



            let currPer = 0; let prevPer = 0;
            if (cm_resp.length > 0 && pm_resp.length > 0) {
                currPer = Math.round((cm_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }

            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currMonth,
                difference: currPer - prevPer,
                sign: status
            }

            res.status(200).json({ status: 200, message: "successfully get filter data", response: /*{ currMonth }*/ result });
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.ExpenditureOfMonth = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);

    try {
        let currMonthID = await monthModel.findOne({ month: currentMonth });
        let prevMonthID = await monthModel.findOne({ month: previousMonth });
        let c_mnthTarget = await projectionModel.findOne({ month: currMonthID?._id, year: date.getFullYear(), companyid: companyId, trgtAmt: { $exists: true } });
        let p_mnthTarget = await projectionModel.findOne({ month: prevMonthID?._id, year: date.getFullYear(), companyid: companyId, trgtAmt: { $exists: true } });

        if (parseInt(req.query.currentMonth)) {
            let currMonth;
            // Current
            const c_match = { $and: [{ monthId: currMonthID?._id }, { year: date.getFullYear() }, { companyid: companyId }] };
            const cm_expns_resp = await expensesModel.aggregate([{ $match: c_match }, { $group: { _id: null, salary: { $sum: "$ctc" }, expns: { $sum: "$expenses" } } }, { $project: { total: { $sum: ["$salary", "$expns"] } } }]);
            (cm_expns_resp.length > 0) ? `${currMonth = cm_expns_resp[0].total}` : `${currMonth = 0}`;
            // Previous
            const p_match = { $and: [{ monthId: prevMonthID?._id }, { year: date.getFullYear() }, { companyid: companyId }] };
            const pm_expns_resp = await expensesModel.aggregate([{ $match: p_match }, { $group: { _id: null, salary: { $sum: "$ctc" }, expns: { $sum: "$expenses" } } }, { $project: { total: { $sum: ["$salary", "$expns"] } } }]);

            let currPer = 0; let prevPer = 0;

            if (cm_expns_resp.length > 0 && pm_expns_resp.length > 0) {
                currPer = Math.round((cm_expns_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_expns_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }

            var status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };


            const result = {
                currMonth: currMonth,
                difference: currPer - prevPer,
                sign: status
            }
            return res.status(200).json({ status: 200, message: "Expenditure of Current Month", response: result });
        }

        else if (req.query.startDate && req.query.endDate && !req.query.state && !req.query.city) {

            let currMonth;
            // Current
            const c_match = { $and: [{ monthId: currMonthID?._id }, { year: date.getFullYear() }, { companyid: companyId }] };
            const cm_expns_resp = await expensesModel.aggregate([{ $match: c_match }, { $group: { _id: null, salary: { $sum: "$ctc" }, expns: { $sum: "$expenses" } } }, { $project: { total: { $sum: ["$salary", "$expns"] } } }]);
            (cm_expns_resp.length > 0) ? `${currMonth = cm_expns_resp[0].total}` : `${currMonth = 0}`;


            // Previous
            const p_match = { $and: [{ monthId: prevMonthID?._id }, { year: date.getFullYear() }, { companyid: companyId }] };
            const pm_expns_resp = await expensesModel.aggregate([{ $match: p_match }, { $group: { _id: null, salary: { $sum: "$ctc" }, expns: { $sum: "$expenses" } } }, { $project: { total: { $sum: ["$salary", "$expns"] } } }]);

            let currPer = 0; let prevPer = 0;

            if (cm_expns_resp.length > 0 && pm_expns_resp.length > 0) {
                currPer = Math.round((cm_expns_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_expns_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }

            var status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };


            const result = {
                currMonth: currMonth,
                difference: currPer - prevPer,
                sign: status
            }
            return res.status(200).json({ status: 200, message: "Expenditure of Current Month", response: result });
        }

        else if (req.query.state && !req.query.city) {
            let currMonth = 0;
            //current
            const cm_state_resp = await employeeInfoModel.aggregate([{ $match: { state: mongoose.Types.ObjectId(req.query.state), companyid: companyId } }, {
                $lookup: {
                    from: "salary_expenses", localField: "empName", foreignField: "name", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", currMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] },
                                    { $eq: ["$company", companyId] }
                                ]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } }, { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);

            (cm_state_resp.length > 0) ? `${currMonth = cm_state_resp[0].total}` : `${currMonth = 0}`;
            // previous
            const pm_state_resp = await employeeInfoModel.aggregate([{ $match: { state: mongoose.Types.ObjectId(req.query.state), companyid: companyId } }, {
                $lookup: {
                    from: "salary_expenses", localField: "empName", foreignField: "name", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", prevMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] }]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } }, { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);


            let currPer = 0; let prevPer = 0;

            if (cm_state_resp.length > 0 && pm_state_resp.length > 0) {
                currPer = Math.round((cm_state_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_state_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }

            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currMonth,
                difference: currPer - prevPer,
                sign: status
            }

            res.status(200).json({ status: 200, message: "successfully get filter data", response: result });

        }

        else if (req.query.state && req.query.city && !req.query.startDate && !req.query.endDate) {
            let currMonth = 0;
            const city_match = { $and: [{ state: mongoose.Types.ObjectId(req.query.state) }, { city: mongoose.Types.ObjectId(req.query.city) }, { companyid: companyId }] };

            const cm_city_resp = await employeeInfoModel.aggregate([{ $match: city_match }, {
                $lookup: {
                    from: "salary_expenses", localField: "empName", foreignField: "name", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", currMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] },
                                    { $eq: ["$companyid", companyId] }
                                ]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } },
            { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);

            (cm_city_resp.length > 0) ? `${currMonth = cm_city_resp[0].total}` : `${currMonth = 0}`;


            const pm_city_resp = await employeeInfoModel.aggregate([{ $match: city_match }, {
                $lookup: {
                    from: "salary_expenses", localField: "empName", foreignField: "name", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", prevMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] },
                                    { $eq: ["$companyid", companyId] }
                                ]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } },
            { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);

            let currPer = 0; let prevPer = 0;

            if (cm_city_resp.length > 0 && pm_city_resp.length > 0) {
                currPer = Math.round((cm_city_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_city_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }

            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currMonth,
                difference: currPer - prevPer,
                sign: status
            }

            res.status(200).json({ status: 200, message: "successfully get filter data", response: result });

        }

        else if (req.query.startDate && req.query.state && req.qury.endDate && req.query.city) {

            let currMonth;
            // Current
            const c_match = { $and: [{ monthId: currMonthID?._id }, { year: date.getFullYear() }, { companyid: companyId }] };
            const cm_expns_resp = await expensesModel.aggregate([{ $match: c_match }, { $group: { _id: null, salary: { $sum: "$ctc" }, expns: { $sum: "$expenses" } } }, { $project: { total: { $sum: ["$salary", "$expns"] } } }]);
            (cm_expns_resp.length > 0) ? `${currMonth = cm_expns_resp[0].total}` : `${currMonth = 0}`;
            // Previous
            const p_match = { $and: [{ monthId: prevMonthID?._id }, { year: date.getFullYear() }, { companyid: companyId }] };
            const pm_expns_resp = await expensesModel.aggregate([{ $match: p_match }, { $group: { _id: null, salary: { $sum: "$ctc" }, expns: { $sum: "$expenses" } } }, { $project: { total: { $sum: ["$salary", "$expns"] } } }]);

            let currPer = 0; let prevPer = 0;

            if (cm_expns_resp.length > 0 && pm_expns_resp.length > 0) {
                currPer = Math.round((cm_expns_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_expns_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }

            var status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currMonth,
                difference: currPer - prevPer,
                sign: status
            }
            return res.status(200).json({ status: 200, message: "Expenditure of Current Month", response: result });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.TargetAchieved = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);

    let currMonthID = await monthModel.findOne({ month: currentMonth });
    let prevMonthID = await monthModel.findOne({ month: previousMonth });
    let c_mnthTarget = await projectionModel.findOne({ month: currMonthID?._id, year: date.getFullYear(), companyid: companyId, trgtAmt: { $exists: true } });
    let p_mnthTarget = await projectionModel.findOne({ month: prevMonthID?._id, year: date.getFullYear(), companyid: companyId, trgtAmt: { $exists: true } });


    try {

        if (parseInt(req.query.currentMonth)) {
            let currMonthSale = 0;
            let prevMonthSale = 0;

            // Current
            const c_match = { $and: [{ monthId: currMonthID?._id }, { year: date.getFullYear() }, { companyid: companyId }] };
            currMonthSale = await tallyModel.aggregate([{ $match: c_match }, { $group: { _id: null, "total": { $sum: "$productPrice" } } }]);
          
            // Previous
            const p_match = { $and: [{ monthId: prevMonthID?._id }, { year: date.getFullYear() }, { companyid: companyId }] };
            prevMonthSale = await tallyModel.aggregate([{ $match: p_match }, { $group: { _id: null, "total": { $sum: "$productPrice" } } }]);
            let currPer = 0; let prevPer = 0;


            if (currMonthSale.length > 0 && prevMonthSale.length > 0) {
                currPer = Math.round((currMonthSale[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((prevMonthSale[0].total / p_mnthTarget.trgtAmt) * 100);
            }else{
                currPer = Math.round((currMonthSale[0].total / c_mnthTarget.trgtAmt) * 100);
            }

            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currPer,
                difference: currPer - prevPer,
                sign: status
            }
            return res.status(200).json({ status: 200, message: "Monthly Target", response: result });
        }

        else if (req.query.startDate || req.query.endDate && !req.query.state && !req.query.city) {

            let currMonthSale = 0;
            let prevMonthSale = 0;
            let currMonth = 0;
            let cm_firstDate = new Date(req.query.startDate);
            cm_firstDate.setHours(5, 30, 0, 0);
            let cm_lastDate = new Date(req.query.endDate);
            cm_lastDate.setDate(cm_lastDate.getDate() + 1);
            cm_lastDate.setHours(5, 29, 59, 0);


            //single date filter
            let cltdate = new Date(req.query.startDate);
            cltdate.setHours(29, 29, 59, 0);


            // Current
            let c_date_match;
            (req.query.startDate && req.query.endDate) ? `${c_date_match = { $and: [{ date: { $gte: cm_firstDate } }, { date: { $lte: cm_lastDate } }, { companyid: companyId }] }}` : `${c_date_match = { $and: [{ date: { $gte: cm_firstDate } }, { date: { $lte: cltdate } }, { companyid: companyId }] }}`;
            currMonthSale = await tallyModel.aggregate([{ $match: c_date_match }, { $group: { _id: null, "total": { $sum: "$productPrice" } } }]);
            (currMonthSale.length > 0) ? `${currMonth = currMonthSale[0].total}` : `${currMonth = 0}`;


            // Previous
            let fdate = new Date(cm_firstDate);
            let pm_firstDate = new Date(fdate.setMonth(date.getMonth() - 1));
            pm_firstDate.setHours(5, 30, 0, 0);
            let ldate = new Date(cm_lastDate);
            let pm_lastDate = new Date(ldate.setMonth(date.getMonth() - 1));
            pm_lastDate.setHours(5, 29, 59, 0);

            //single date filter
            let pltdate = new Date(fdate.setMonth(date.getMonth() - 1));
            pltdate.setHours(29, 29, 59, 0);



            // Sale
            let p_date_match;
            (req.query.startDate && req.query.endDate) ? `${p_date_match = { $and: [{ date: { $gte: pm_firstDate } }, { date: { $lte: pm_lastDate } }, { companyid: companyId }] }}` : `${p_date_match = { $and: [{ date: { $gte: pm_firstDate } }, { date: { $lte: pltdate } }, { companyid: companyId }] }}`;
            prevMonthSale = await tallyModel.aggregate([{ $match: p_date_match }, { $group: { _id: null, "total": { $sum: "$productPrice" } } }]);

            let currPer = 0; let prevPer = 0;

            if (currMonthSale.length > 0 && prevMonthSale.length > 0) {
                currPer = Math.round((currMonthSale[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((prevMonthSale[0].total / p_mnthTarget.trgtAmt) * 100);
            }else{
                currPer = Math.round((currMonthSale[0].total / c_mnthTarget.trgtAmt) * 100);
            }



            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currPer,
                difference: currPer - prevPer,
                sign: status
            }
            res.status(200).json({ status: 200, message: "successfully get filter data", response: result });
        }

        else if (req.query.state && !req.query.city) {

            let currMonth = 0;
            //current
            const cm_state_resp = await employeeInfoModel.aggregate([{ $match: { state: mongoose.Types.ObjectId(req.query.state), companyid: companyId } }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", currMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] },
                                    { $eq: ["$companyid", companyId] }
                                ]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } }, { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);

            // previous
            const pm_state_resp = await employeeInfoModel.aggregate([{ $match: { state: mongoose.Types.ObjectId(req.query.state), companyid: companyId } }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", prevMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] },
                                    { $eq: ["$companyid", companyId] }
                                ]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } }, { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);


            let currPer = 0; let prevPer = 0;

            if (cm_state_resp.length > 0 && pm_state_resp.length) {
                currPer = Math.round((cm_state_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_state_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }else{
                currPer = Math.round((currMonthSale[0].total / c_mnthTarget.trgtAmt) * 100);
            }

            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currPer,
                difference: currPer - prevPer,
                sign: status
            }

            res.status(200).json({ status: 200, message: "successfully get filter data", response: result });
        }

        else if (req.query.state && req.query.city && !req.query.startDate && !req.query.endDate) {

            let currMonth = 0;
            const city_match = { $and: [{ state: mongoose.Types.ObjectId(req.query.state) }, { city: mongoose.Types.ObjectId(req.query.city), companyid: companyId }] };
            // Current
            const cm_city_resp = await employeeInfoModel.aggregate([{ $match: city_match }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", currMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] },
                                    { $eq: ["$companyid", companyId] }
                                ]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } },
            { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);

            // Previous
            const pm_city_resp = await employeeInfoModel.aggregate([{ $match: city_match }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$monthId", prevMonthID?._id] },
                                    { $eq: ["$year", date.getFullYear()] },
                                    { $eq: ["$companyid", companyId] }
                                ]
                            }
                        }
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } },
            { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);

            let currPer = 0; let prevPer = 0;

            if (cm_city_resp.length > 0 && pm_city_resp.length > 0) {
                currPer = Math.round((cm_city_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_city_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }else{
                currPer = Math.round((currMonthSale[0].total / c_mnthTarget.trgtAmt) * 100);
            }

            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currPer,
                difference: currPer - prevPer,
                sign: status
            }

            res.status(200).json({ status: 200, message: "successfully get filter data", response: result });
        }

        else if (req.query.startDate && req.query.state && req.query.endDate && req.query.city) {

            let currMonth = 0;
            const cm_firstDate = new Date(req.query.startDate);
            cm_firstDate.setHours(5, 30, 0, 0);
            const cm_lastDate = new Date(req.query.endDate);
            cm_lastDate.setHours(5, 29, 0, 0);

            let fdate = new Date(cm_firstDate);
            let pm_firstDate = new Date(fdate.setMonth(date.getMonth() - 1));
            let ldate = new Date(cm_lastDate);
            let pm_lastDate = new Date(ldate.setMonth(date.getMonth() - 1));

            const match = { $and: [{ state: mongoose.Types.ObjectId(req.query.state) }, { city: mongoose.Types.ObjectId(req.query.city) }, { companyid: companyId }] };
            const cm_date_match = { $expr: { $and: [{ $gte: ["$date", cm_firstDate] }, { $lte: ["$date", cm_lastDate] }, { companyid: companyId }] } };
            const pm_date_match = { $expr: { $and: [{ $gte: ["$date", pm_firstDate] }, { $lte: ["$date", pm_lastDate] }, { companyid: companyId }] } };

            // Current
            const cm_resp = await employeeInfoModel.aggregate([{ $match: match }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: cm_date_match
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } },
            { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);


            // Previous
            const pm_resp = await employeeInfoModel.aggregate([{ $match: match }, {
                $lookup: {
                    from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                    pipeline: [{
                        $match: pm_date_match
                    }]
                }
            }, { $group: { _id: "$empName", total: { $sum: { $sum: "$record.productPrice" } } } },
            { $project: { _id: "$_id", total: "$total" } }, { $group: { _id: null, total: { $sum: "$total" } } }
            ]);


            let currPer = 0; let prevPer = 0;
            if (cm_resp.length > 0 && pm_resp.length > 0) {
                currPer = Math.round((cm_resp[0].total / c_mnthTarget.trgtAmt) * 100);
                prevPer = Math.round((pm_resp[0].total / p_mnthTarget.trgtAmt) * 100);
            }else{
                currPer = Math.round((currMonthSale[0].total / c_mnthTarget.trgtAmt) * 100);
            }

            let status;
            if (currPer > prevPer) {
                status = "increase"
            } else {
                status = "decrease"
            };

            const result = {
                currMonth: currPer,
                difference: currPer - prevPer,
                sign: status
            }

            res.status(200).json({ status: 200, message: "successfully get filter data", response: result });
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};



// ----------------------- Graph ------------------------------
exports.annualSales = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        if (parseInt(req.query.currentMonth)) {
            const resp = await monthModel.aggregate(
                [
                    { $lookup: { from: "tallies", localField: "_id", foreignField: "monthId", as: "Revenue", pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$year", date.getFullYear()] }, { $eq: ["$companyid", companyId] }] } } }] } },
                    {
                        $lookup: {
                            from: "companytrgts", localField: "_id", foreignField: "month", as: "target",
                            pipeline: [{ "$match": { "$expr": { $and: [{ $eq: ["$year", date.getFullYear()] }, { $eq: ["$companyid", companyId] }] } } }]
                        }
                    },
                    { $project: { _id: 0, date: 1, Revenue: 1, target: 1 } },
                    {
                        $group: {
                            _id: "$date", monthName: { "$first": "$date" }, "revenue": { $sum: { $sum: "$Revenue.productPrice" } },
                            "mnthtrgt": { $first: "$target.trgtAmt" }
                        }
                    },
                    { $sort: { "monthName": 1 } }, { $project: { _id: 0 } }
                ]);

            res.status(200).json({ status: 200, message: " Actual Sales - Projection Amount", response: resp });
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.AnnualSaleSummary = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {

        if (parseInt(req.query.currentMonth)) {
            const resp = await monthModel.aggregate(
                [
                    { $lookup: { from: "salary_expenses", localField: "_id", foreignField: "monthId", as: "FirstRecord", pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$year", date.getFullYear()] }, { $eq: ["$companyid", companyId] }] } } }] } },
                    { $lookup: { from: "tallies", localField: "_id", foreignField: "monthId", as: "SecondRecord", pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$year", date.getFullYear()] }, { $eq: ["$companyid", companyId] }] } } }] } },
                    { $project: { _id: 0, date: 1, FirstRecord: 1, SecondRecord: 1 } },
                    {
                        $group: {
                            _id: "$date", Month: { "$first": "$date" }, salary: { $sum: { $sum: "$FirstRecord.ctc" } },
                            expenses: { $sum: { $sum: "$FirstRecord.expenses" } }, Revenue: { $sum: { $sum: "$SecondRecord.productPrice" } }
                        }
                    },
                    { $sort: { "Month": 1 } },
                    {
                        $project: {
                            _id: 0, Salary: "$salary", Expenditure: "$expenses", Revenue: 1,
                            "TotalExpenditure": { $sum: ["$salary", "$expenses"] }, "Month": 1
                        }
                    }
                ]);

            res.status(200).json({ status: 200, message: "Expenditure - Salary - Total Expenditure - Revenue", response: resp });
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.AnnualTargetSummary = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);

    try {
        if (parseInt(req.query.currentMonth)) {
            const resp = await monthModel.aggregate(
                [
                    { $lookup: { from: "tallies", localField: "_id", foreignField: "monthId", as: "Revenue", pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$year", date.getFullYear()] }, { $eq: ["$companyid", companyId] }] } } }] } },
                    {
                        $lookup: {
                            from: "companytrgts", localField: "_id", foreignField: "month", as: "target",
                            pipeline: [{ "$match": { "$expr": { $and: [{ $eq: ["$year", date.getFullYear()] }, { $eq: ["$companyid", companyId] }] } } }]
                        }
                    },
                    { $project: { _id: 0, date: 1, Revenue: 1, target: 1 } },
                    {
                        $group: {
                            _id: "$date", Month: { "$first": "$date" }, "Revenue": { $sum: { $sum: "$Revenue.productPrice" } },
                            "Target": { $first: "$target.trgtAmt" }
                        }
                    },
                    { $sort: { "Month": 1 } }, { $project: { _id: 0 } }
                ]);

            res.status(200).json({ status: 200, message: "Target - Revenue", response: resp });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
}

exports.SalesVsSalary = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);

    try {
        if (parseInt(req.query.currentMonth)) {
            const salary_sale = await monthModel.aggregate([
                { $lookup: { from: "salary_expenses", localField: "_id", foreignField: "monthId", as: "Salary", pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$year", date.getFullYear()] }, { $eq: ["$companyid", companyId] }] } } }] } },
                { $lookup: { from: "tallies", localField: "_id", foreignField: "monthId", as: "Sales", pipeline: [{ $match: { $expr: { $and: [{ $eq: ["$year", date.getFullYear()] }, { $eq: ["$companyid", companyId] }] } } }] } },
                { $project: { _id: 0, date: 1, Salary: 1, Sales: 1 } },
                {
                    $group: {
                        _id: "$date", Month: { "$first": "$date" },
                        Salary: { $sum: { $sum: "$Salary.ctc" } },
                        Sales: { $sum: { $sum: "$Sales.productPrice" } }
                    }
                },
                { $sort: { "Month": 1 } }, { $project: { _id: 0 } }]
            );
            res.status(200).json({ status: 200, message: "Salary - Sale", response: salary_sale });
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.OverAllSale = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        let revenueGraphDataArr = [];
        let expenditureGraphDataArr = [];
        let revenueAmount = 0;
        let expenditureAmount = 0;

        let date = new Date();
        date.setHours(5, 30, 0, 0);
        date.getFullYear();
        let mnthone = new Date(date.setMonth(date.getMonth()));

        date = new Date();
        date.setHours(5, 30, 0, 0);
        date.getFullYear();
        let mnthtwo = new Date(date.setMonth(date.getMonth()));


        const totalRevenue = await tallyModel.find({ companyid: companyId });

        for (let j = 0; j < totalRevenue.length; j++) {
            revenueAmount += totalRevenue[j].productPrice
        }

        const totalExpenditure = await expensesModel.find({ companyid: companyId });
        for (let j = 0; j < totalExpenditure.length; j++) {
            expenditureAmount += (totalExpenditure[j].expenses + totalExpenditure[j].ctc);
        }

        for (let i = 1; i <= 12; i++) {
            let saleMnth = "";
            mnthone = mnthtwo;
            let revenueTotalAmount = 0;
            let expenditureTotalAmount = 0;
            const lastMnth = new Date(mnthone.setMonth((0 + i), 1))
            const previousMnth = new Date(mnthone);
            const nextMnth = new Date(lastMnth.setMonth(lastMnth.getMonth() - 1))
            saleMnth = new Date(nextMnth).toDateString().slice(4, 8);
            const month = monthNames[nextMnth.getMonth()];
            const currMonthID = await monthModel.findOne({ month: month });

            const saleGraphData = await tallyModel.find({ "$and": [{ monthId: currMonthID?._id }, { totalAmount: { $exists: true } }, { companyid: companyId }] }).sort({ createdAt: -1 }).select('productPrice');
            const expenditureGraphData = await expensesModel.find({ "$and": [{ monthId: currMonthID?._id }, { expenses: { $exists: true } }, { companyid: companyId }] }).sort({ createdAt: -1 }).select('expenses ctc');

            if (saleGraphData.length > 0) {
                for (let j = 0; j < saleGraphData.length; j++) {
                    revenueTotalAmount += parseInt(saleGraphData[j].productPrice);
                    if (saleGraphData.length - 1 == j) {
                        revenueGraphDataArr.push({ data: saleGraphData, revenueTotalAmount, saleMnth, sale: i });
                    }
                }
            }
            else {
                revenueGraphDataArr.push({ data: saleGraphData, revenueTotalAmount, saleMnth, sale: i });
            }


            if (expenditureGraphData.length > 0) {
                for (let j = 0; j < expenditureGraphData.length; j++) {
                    expenditureTotalAmount += parseInt(expenditureGraphData[j].expenses);
                    if (expenditureGraphData.length - 1 == j) {
                        expenditureGraphDataArr.push({ data: expenditureGraphData, expenditureTotalAmount, saleMnth, sale: i });
                    }
                }
            }
            else {
                expenditureGraphDataArr.push({ data: expenditureGraphData, expenditureTotalAmount, saleMnth, sale: i });
            }


            if (i == 12) {
                const totalRevenueAmount = Math.round(revenueAmount);
                const totalExpenditureAmount = Math.round(expenditureAmount);
                res.status(200).json({ status: 200, message: "get activity data successfully", responseData: { revenueGraphDataArr }, expenditureGraphDataArr, totalRevenueAmount, totalExpenditureAmount });
            }
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

// -------------------- Zone Revenue ---------------------------
exports.ZoneRevenue = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    const zone = await ZoneModel.find({ companyid: companyId });
    const currMonthID = await monthModel.findOne({ month: currentMonth });

    try {
        if (parseInt(req.query.currentMonth)) {
            let revenue = 0;
            let totPcs = 0;
            let separate = 0;

            for (var i = 0; i < zone.length; i++) { // loop start

                const employees = await employeeInfoModel.find({ zoneId: zone[i]._id, status: true, companyid: companyId });
                for (var j = 0; j < employees.length; j++) {
                    var tally_response = await tallyModel.findOne({ employee: employees[j].empName, monthId: currMonthID?._id, companyid: companyId });

                    if (tally_response) {
                        revenue += tally_response.totalAmount
                        separate = tally_response.totalPcs.split(" ");
                        totPcs += parseInt(separate[0]);
                    }
                }
                if (zone[i].zone == "North") { var northRevenue = revenue; var northPcs = totPcs; }
                else if (zone[i].zone == "South") { var southRevenue = revenue; var southPcs = totPcs; }
                else if (zone[i].zone == "East") { var eastRevenue = revenue; var eastPcs = totPcs; }
                else if (zone[i].zone == "West") { var westRevenue = revenue; var westPcs = totPcs; }
                else if (zone[i].zone == "Central") { var cntrRevenue = revenue; var cntrPcs = totPcs; }
            } //loop end

            const result = {
                north: northRevenue, northPcs: northPcs,
                south: southRevenue, southPcs: southPcs,
                east: eastRevenue, eastPcs: eastPcs,
                west: westRevenue, westPcs: westPcs,
                central: cntrRevenue, cntrPcs: cntrPcs,
                total: northRevenue + southRevenue + eastRevenue + westRevenue + cntrRevenue
            }
            res.status(200).json({ status: 200, message: "Zone's Revenue", result });


        }

        else if (req.query.startDate && req.query.endDate && !req.query.state && !req.query.city) {
            const firstDate = new Date(req.query.startDate);
            const lastDate = new Date(req.query.endDate);
            let revenue = 0;
            let totPcs = 0;
            let separate = 0;

            for (var i = 0; i < zone.length; i++) { // loop start

                const employees = await employeeInfoModel.find({ zoneId: zone[i]._id, status: true, companyid: companyId });

                for (var j = 0; j < employees.length; j++) {
                    var tally_response = await tallyModel.findOne({ date: { $gte: firstDate }, date: { $lte: lastDate }, employee: employees[j].empName, companyid: companyId });

                    if (tally_response) {
                        revenue += tally_response.totalAmount
                        separate = tally_response.totalPcs.split(" ");
                        totPcs += parseInt(separate[0]);
                    }
                }
                if (zone[i].zone == "North") { var northRevenue = revenue; var northPcs = totPcs; }
                else if (zone[i].zone == "South") { var southRevenue = revenue; var southPcs = totPcs; }
                else if (zone[i].zone == "East") { var eastRevenue = revenue; var eastPcs = totPcs; }
                else if (zone[i].zone == "West") { var westRevenue = revenue; var westPcs = totPcs; }
                else if (zone[i].zone == "Central") { var cntrRevenue = revenue; var cntrPcs = totPcs; }
            } //loop end

            const result = {
                north: northRevenue, northPcs: northPcs,
                south: southRevenue, southPcs: southPcs,
                east: eastRevenue, eastPcs: eastPcs,
                west: westRevenue, westPcs: westPcs,
                central: cntrRevenue, cntrPcs: cntrPcs,
                total: northRevenue + southRevenue + eastRevenue + westRevenue + cntrRevenue
            }
            res.status(200).json({ status: 200, message: "Zone's Revenue", result });
        }

        else if (req.query.state && !req.query.city) {

            for (var i = 0; i < zone.length; i++) { // loop start
                var revenue = 0;
                var totPcs = 0;
                var separate = 0;

                const employees = await employeeInfoModel.find({ zoneId: zone[i]._id, state: req.query.state, status: true, companyid: companyId });
                for (var j = 0; j < employees.length; j++) {
                    var tally_response = await tallyModel.findOne({ employee: employees[j].empName, companyid: companyId });

                    if (tally_response) {
                        revenue += tally_response.totalAmount
                        separate = tally_response.totalPcs.split(" ");
                        totPcs += parseInt(separate[0]);
                    }
                }
                if (zone[i].zone == "North") { var northRevenue = revenue; var northPcs = totPcs; }
                else if (zone[i].zone == "South") { var southRevenue = revenue; var southPcs = totPcs; }
                else if (zone[i].zone == "East") { var eastRevenue = revenue; var eastPcs = totPcs; }
                else if (zone[i].zone == "West") { var westRevenue = revenue; var westPcs = totPcs; }
                else if (zone[i].zone == "Central") { var cntrRevenue = revenue; var cntrPcs = totPcs; }
            } //loop end

            const result = {
                north: northRevenue, northPcs: northPcs,
                south: southRevenue, southPcs: southPcs,
                east: eastRevenue, eastPcs: eastPcs,
                west: westRevenue, westPcs: westPcs,
                central: cntrRevenue, cntrPcs: cntrPcs,
                total: northRevenue + southRevenue + eastRevenue + westRevenue + cntrRevenue
            }
            res.status(200).json({ status: 200, message: "Zone's Revenue", result });
        }

        else if (req.query.state && req.query.city && !req.query.startDate && !req.query.endDate) {

            for (var i = 0; i < zone.length; i++) { // loop start
                var revenue = 0;
                var totPcs = 0;
                var separate = 0;

                const employees = await employeeInfoModel.find({ zoneId: zone[i]._id, city: req.query.city, status: true, companyid: companyId });
                for (var j = 0; j < employees.length; j++) {
                    var tally_response = await tallyModel.findOne({ employee: employees[j].empName, companyid: companyId });

                    if (tally_response) {
                        revenue += tally_response.totalAmount
                        separate = tally_response.totalPcs.split(" ");
                        totPcs += parseInt(separate[0]);
                    }
                }
                if (zone[i].zone == "North") { var northRevenue = revenue; var northPcs = totPcs; }
                else if (zone[i].zone == "South") { var southRevenue = revenue; var southPcs = totPcs; }
                else if (zone[i].zone == "East") { var eastRevenue = revenue; var eastPcs = totPcs; }
                else if (zone[i].zone == "West") { var westRevenue = revenue; var westPcs = totPcs; }
                else if (zone[i].zone == "Central") { var cntrRevenue = revenue; var cntrPcs = totPcs; }
            } //loop end

            const result = {
                north: northRevenue, northPcs: northPcs,
                south: southRevenue, southPcs: southPcs,
                east: eastRevenue, eastPcs: eastPcs,
                west: westRevenue, westPcs: westPcs,
                central: cntrRevenue, cntrPcs: cntrPcs,
                total: northRevenue + southRevenue + eastRevenue + westRevenue + cntrRevenue
            }
            res.status(200).json({ status: 200, message: "Zone's Revenue", result });
        }

        else if (req.query.startDate && req.query.endDate && req.query.state && req.query.city) {
            const firstDate = new Date(req.query.startDate);
            const lastDate = new Date(req.query.endDate);

            for (var i = 0; i < zone.length; i++) { // loop start
                var revenue = 0;
                var totPcs = 0;
                var separate = 0;

                const employees = await employeeInfoModel.find({ zoneId: zone[i]._id, state: req.query.state, city: req.query.city, status: true, companyid: companyId });
                for (var j = 0; j < employees.length; j++) {
                    var tally_response = await tallyModel.findOne({ date: { $gte: firstDate }, date: { $lte: lastDate }, employee: employees[j].empName, companyid: companyId });
                    if (tally_response) {
                        revenue += tally_response.totalAmount
                        separate = tally_response.totalPcs.split(" ");
                        totPcs += parseInt(separate[0]);
                    }
                }
                if (zone[i].zone == "North") { var northRevenue = revenue; var northPcs = totPcs; }
                else if (zone[i].zone == "South") { var southRevenue = revenue; var southPcs = totPcs; }
                else if (zone[i].zone == "East") { var eastRevenue = revenue; var eastPcs = totPcs; }
                else if (zone[i].zone == "West") { var westRevenue = revenue; var westPcs = totPcs; }
                else if (zone[i].zone == "Central") { var cntrRevenue = revenue; var cntrPcs = totPcs; }
            } //loop end

            const result = {
                north: northRevenue, northPcs: northPcs,
                south: southRevenue, southPcs: southPcs,
                east: eastRevenue, eastPcs: eastPcs,
                west: westRevenue, westPcs: westPcs,
                central: cntrRevenue, cntrPcs: cntrPcs,
                total: northRevenue + southRevenue + eastRevenue + westRevenue + cntrRevenue
            }
            res.status(200).json({ status: 200, message: "Zone's Revenue", result });
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};



// ---------------------- Company Target ------------------------
exports.CompanyTargetCreate = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);

    try {
        if (date.getFullYear() == req.body.year) {
            const isExist = await companyTargetModel.findOne({ year: req.body.year, month: req.body.month, companyid: companyId });
            if (!isExist) {
                const data = {
                    year: req.body.year,
                    month: req.body.month,
                    trgtAmt: req.body.amount,
                    companyid: companyId
                }
                const insert_resp = await companyTargetModel.create(data);
                if (insert_resp) {
                    res.status(200).json({ status: 200, message: "Create Successfully", response: insert_resp });
                } else {
                    res.status(200).json({ status: 400, message: "Not Created" });
                }
            } else {
                res.status(200).json({ status: 400, message: "Month's Target Already Exist" })
            }
        } else {
            res.status(200).json({ status: 400, message: "Please Enter Current Year" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.CompanyTargetUpdate = async (req, res) => {
    try {
        const data = {
            trgtAmt: req.body.amount
        }
        const update_resp = await companyTargetModel.findByIdAndUpdate({ _id: req.body.id }, data, { new: true });
        if (update_resp) {
            res.status(200).json({ status: 200, message: "Update Successfully", response: update_resp });
        } else {
            res.status(200).json({ status: 400, message: "Not Updated" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.GetCompanyTarget = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);

    try {
        const resp = await companyTargetModel.find({ year: date.getFullYear(), trgtAmt: { $exists: true }, companyid: companyId }).populate('month').sort({ createdAt: 1 });
        if (resp) {
            res.status(200).json({ status: 200, message: "Current Year Monthly Projection", response: resp });
        } else {
            res.status(200).json({ status: 400, message: "Empty Record" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};