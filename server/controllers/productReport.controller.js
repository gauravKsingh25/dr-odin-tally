const productModel = require("../models/tally.model");
const monthModel = require("../models/month.model");
const employeeInfoModel = require("../models/employeeinfo.model")
const mongoose = require("mongoose");



const date = new Date();
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const currentMonth = monthNames[date.getMonth()];
const previousMonth = monthNames[date.getMonth() - 1];



// ------------------ Products ----------------------
exports.GetProductName = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {

        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const date = new Date();

        let query = { companyid: companyId }
        let firstDate;
        let lastDate;
        let monthId;

        // filter's conditions
        if (req.query.state && !req.query.city) {
            query.state = mongoose.Types.ObjectId(req.query.state);
        }

        if (req.query.state && req.query.city && !req.query.startDate && !req.query.endDate) {
            query.state = mongoose.Types.ObjectId(req.query.state);
            query.city = mongoose.Types.ObjectId(req.query.city);
        }

        if (req.query.startDate || req.query.endDate) {
            firstDate = new Date(req.query.startDate);
            firstDate.setHours(5, 30, 0, 0);
            lastDate = new Date(req.query.endDate);
            lastDate.setHours(29, 29, 59, 0);

            //single date filter
            let lsdf = new Date(req.query.startDate);
            lsdf.setHours(29, 29, 59, 0);

            if (!req.query.city && !req.query.state) {
                (req.query.startDate && req.query.endDate) ? `${query.date = { $gte: firstDate, $lte: lastDate }}` : `${query.date = { $gte: firstDate, $lte: lsdf }}`;
            }
        }

        if (parseInt(req.query.currentMonth)) {
            const currMonth = monthNames[date.getMonth()];
            const currMonthId = await monthModel.findOne({ month: currMonth });
            monthId = currMonthId._id;
            if (!req.query.state && !req.query.city) {
                query.monthId = currMonthId._id;
            }
            monthId = currMonthId._id;
        }


        if (req.query.searchkey) {
            query['$or'] = [{ product: { $regex: '^' + req.query.searchkey, $options: 'i' } }, { product: { $regex: '.*' + req.query.searchkey + '.*', $options: 'i' } }]
        }

        const lSkip = req.query.skip;
        let resp = [];
        let resp1 = [];
        let resp2 = [];


        if (req.query.city || req.query.state) {
            if (!req.query.product) {
                resp = await employeeInfoModel.aggregate(
                    [
                        { $match: query },
                        firstDate ? {
                            $lookup: {
                                from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                                pipeline: [{
                                    "$match": {
                                        "$expr": { $and: [{ $gte: ["$date", firstDate] }, { $lte: ["$date", lastDate] }] }
                                    }
                                }]
                            }
                        } : {
                            $lookup: {
                                from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                                pipeline: [{
                                    "$match": {
                                        "$expr": { $eq: ["$monthId", monthId] },
                                    }
                                }]
                            }
                        },
                        { $unwind: "$record" },
                        { $group: { _id: "$record.product", pid: { $first: "$record._id" }, count: { $sum: 1 }, productPcs: { $sum: "$record.productPcs" }, "qty": { $first: "$record.totalPcs" }, "total": { $sum: "$record.productPrice" } } },
                        { $project: { pid: 1, Product: "$_id", productPcs: 1, Quantity: "$qty", TotalCount: "$count", TotalAmount: "$total" } },
                        { $sort: { "TotalAmount": -1 } }, { $skip: (lSkip - 1) * 50 }, { $limit: 50 }
                    ]);
            } else {
                resp = await employeeInfoModel.aggregate(
                    [
                        { $match: query },
                        firstDate ? {
                            $lookup: {
                                from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                                pipeline: [{
                                    "$match": {
                                        "$expr": { $and: [{ $gte: ["$date", firstDate] }, { $lte: ["$date", lastDate] }] }
                                    }
                                }]
                            }
                        } : {
                            $lookup: {
                                from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                                pipeline: [{
                                    "$match": {
                                        "$expr": { $eq: ["$monthId", monthId] },
                                    }
                                }]
                            }
                        },
                        { $unwind: "$record" },
                        { $group: { _id: "$record.product", pid: { $first: "$record._id" }, count: { $sum: 1 }, productPcs: { $sum: "$record.productPcs" }, "qty": { $first: "$record.totalPcs" }, "total": { $sum: "$record.productPrice" } } },
                        { $project: { pid: 1, Product: "$_id", productPcs: 1, Quantity: "$qty", TotalCount: "$count", TotalAmount: "$total" } },
                        { $sort: { "TotalAmount": -1 } }, { $limit: parseInt(req.query.product) }
                    ]);
            }

            resp1 = await employeeInfoModel.aggregate([
                { $match: query },
                firstDate ? {
                    $lookup: {
                        from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                        pipeline: [{
                            "$match": {
                                "$expr": { $and: [{ $gte: ["$date", firstDate] }, { $lte: ["$date", lastDate] }] }
                            }
                        }]
                    }
                } : {
                    $lookup: {
                        from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                        pipeline: [{
                            "$match": {
                                "$expr": { $eq: ["$monthId", monthId] },
                            }
                        }]
                    }
                },

                { $unwind: "$record" },
                { $group: { _id: "$record.product", count: { $sum: 1 }, "qty": { $first: "$record.totalPcs" }, "total": { $sum: "$record.productPrice" } } },
                { $project: { Product: "$_id", Quantity: "$qty", TotalCount: "$count", TotalAmount: "$total" } },
                { $sort: { "TotalAmount": -1 } }, { $group: { _id: null, totalSum: { $sum: "$TotalAmount" } } }]);


            resp2 = await employeeInfoModel.aggregate(
                [
                    { $match: query },
                    firstDate ? {
                        $lookup: {
                            from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                            pipeline: [{
                                "$match": {
                                    "$expr": { $and: [{ $gte: ["$date", firstDate] }, { $lte: ["$date", lastDate] }] }
                                }
                            }]
                        }
                    } : {
                        $lookup: {
                            from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                            pipeline: [{
                                "$match": {
                                    "$expr": { $eq: ["$monthId", monthId] },
                                }
                            }]
                        }
                    },
                    { $unwind: "$record" },
                    { $group: { _id: "$record.product", count: { $sum: 1 }, "qty": { $first: "$record.totalPcs" }, "total": { $sum: "$record.productPrice" } } },
                    { $project: { Product: "$_id", Quantity: "$qty", TotalCount: "$count", TotalAmount: "$total" } },
                    { $sort: { "TotalAmount": -1 } }]);

        } else {
            if (!req.query.product) {
                resp = await productModel.aggregate([{ $match: query }, { $group: { _id: "$product", pid: { $first: "$_id" }, total: { $sum: "$productPrice" }, productPcs: { $sum: "$productPcs" }, count: { $sum: 1 }, QTY: { $first: "$totalPcs" } } }, { $project: { pid: 1, Name: "$_id", count: "$count", productPcs: "$productPcs", "Quantity": "$QTY", TOTALAMT: "$total" } }, { $sort: { "TOTALAMT": -1 } }, { $skip: (lSkip - 1) * 50 }, { $limit: 50 }]);
                resp1 = await productModel.aggregate([{ $match: query }, { $group: { _id: "$product", total: { $sum: "$productPrice" }, count: { $sum: 1 }, QTY: { $first: "$totalPcs" } } }, { $project: { Name: "$_id", count: "$count", "Quantity": "$QTY", TOTALAMT: "$total" } }, { $sort: { "TOTALAMT": -1 } }, { $group: { _id: null, totalSum: { $sum: "$TOTALAMT" } } }]);
                resp2 = await productModel.aggregate([{ $match: query }, { $group: { _id: "$product", total: { $sum: "$productPrice" }, count: { $sum: 1 }, QTY: { $first: "$totalPcs" } } }, { $project: { Name: "$_id", count: "$count", "Quantity": "$QTY", TOTALAMT: "$total" } }, { $sort: { "TOTALAMT": -1 } }]);
            } else {
                resp = await productModel.aggregate([{ $match: query }, { $group: { _id: "$product", pid: { $first: "$_id" }, total: { $sum: "$productPrice" }, productPcs: { $sum: "$productPcs" }, count: { $sum: 1 }, QTY: { $first: "$totalPcs" } } }, { $project: { pid: 1, Name: "$_id", count: "$count", productPcs: "$productPcs", "Quantity": "$QTY", TOTALAMT: "$total" } }, { $sort: { "TOTALAMT": -1 } }, { $limit: parseInt(req.query.product) }]);
                resp1 = await productModel.aggregate([{ $match: query }, { $group: { _id: "$product", total: { $sum: "$productPrice" }, count: { $sum: 1 }, QTY: { $first: "$totalPcs" } } }, { $project: { Name: "$_id", count: "$count", "Quantity": "$QTY", TOTALAMT: "$total" } }, { $sort: { "TOTALAMT": -1 } }, { $group: { _id: null, totalSum: { $sum: "$TOTALAMT" } } }]);
                resp2 = await productModel.aggregate([{ $match: query }, { $group: { _id: "$product", total: { $sum: "$productPrice" }, count: { $sum: 1 }, QTY: { $first: "$totalPcs" } } }, { $project: { Name: "$_id", count: "$count", "Quantity": "$QTY", TOTALAMT: "$total" } }, { $sort: { "TOTALAMT": -1 } }]);
            }
        }

        let Total_Amount = 0;
        const productsCount = resp2.length;
        const paginationCount = Math.ceil((resp2.length) / 50);


        if (resp1.length > 0) {
            Total_Amount = resp1[0].totalSum;
        } else {
            return res.status(200).json({ status: 200, message: "Record Not Found", response: resp, productsCount, paginationCount, Total_Amount });
        }

        if (resp) {
            return res.status(200).json({ status: 200, message: "Products List", response: resp, productsCount, paginationCount, Total_Amount });
        } else {
            return res.status(200).json({ status: 400, message: "Product Not Found", response: resp, productsCount, paginationCount, Total_Amount });
        }

    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.GetProductByName = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        const pid = req.query.pid;
        let currMonthID = await monthModel.findOne({ month: currentMonth });
        //
        // Get product name 
        const get_product = await productModel.findById({ _id: pid });
        const product = get_product.product;
        //
        const product_resp = await productModel.aggregate([
            { $match: { product: product, monthId: currMonthID._id, year: date.getFullYear(), companyid: companyId } },
            {
                $project: {
                    _id: 1, date: { $dateToString: { date: "$date", format: "%d-%m-%Y" } }, salesPerson: "$employee", vendor: "$company", product: 1, qty: "$productPcs",
                    amount: "$productPrice", average: { $divide: ["$productPrice", "$productPcs"] }
                }
            }
        ]);

        if (product_resp) {
            res.status(200).json({ status: 200, message: "Product Details", response: product_resp });
        } else {
            res.status(200).json({ status: 401, message: "Product Not Found", response: product_resp });
        }

    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};



// --------------------- Vendors --------------------
exports.GetVendorList = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const date = new Date();

        let query = { companyid: companyId }
        let firstDate;
        let lastDate;
        let monthId;

        // filter's conditions
        if (req.query.state && !req.query.city) {
            query.state = mongoose.Types.ObjectId(req.query.state);
        }

        if (req.query.state && req.query.city && !req.query.startDate && !req.query.endDate) {
            query.state = mongoose.Types.ObjectId(req.query.state);
            query.city = mongoose.Types.ObjectId(req.query.city);
        }

        if (req.query.startDate || req.query.endDate) {
            firstDate = new Date(req.query.startDate);
            firstDate.setHours(5, 30, 0, 0);
            lastDate = new Date(req.query.endDate);
            lastDate.setHours(29, 29, 59, 0);

            //single date filter
            let lsdf = new Date(req.query.startDate);
            lsdf.setHours(29, 29, 59, 0);

            if (!req.query.city && !req.query.state) {
                (req.query.startDate && req.query.endDate) ? `${query.date = { $gte: firstDate, $lte: lastDate }}` : `${query.date = { $gte: firstDate, $lte: lsdf }}`;
            }
        }

        if (parseInt(req.query.currentMonth)) {
            const currMonth = monthNames[date.getMonth()];
            const currMonthId = await monthModel.findOne({ month: currMonth });
            monthId = currMonthId._id;
            if (!req.query.state && !req.query.city) {
                query.monthId = currMonthId._id;
            }
            monthId = currMonthId._id;
        }

        if (req.query.searchkey) {
            query['$or'] = [{ company: { $regex: '^' + req.query.searchkey, $options: 'i' } }, { company: { $regex: '.*' + req.query.searchkey + '.*', $options: 'i' } }]
        }

        const lSkip = req.query.skip;
        let resp1 = [];
        let resp2 = [];
        let resp3 = [];

        if (req.query.city || req.query.state) {
            if (!req.query.vendor) {
                resp1 = await employeeInfoModel.aggregate(
                    [
                        { $match: query },
                        firstDate ? {
                            $lookup: {
                                from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                                pipeline: [{
                                    "$match": {
                                        "$expr": { $and: [{ $gte: ["$date", firstDate] }, { $lte: ["$date", lastDate] }] }
                                    }
                                }]
                            }
                        } : {
                            $lookup: {
                                from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                                pipeline: [{
                                    "$match": {
                                        "$expr": { $eq: ["$monthId", monthId] },
                                    }
                                }]
                            }
                        },
                        { $unwind: "$record" },
                        { $group: { _id: "$record.company", vid: { $first: "$record._id" }, count: { $sum: 1 }, qty: { $sum: "$productPcs" }, total: { $sum: "$record.productPrice" } } },
                        { $project: { vid: 1, Vendor: "$_id", qty: 1, Count: "$count", Amount: "$total", _id: 0 } },
                        { $sort: { "Amount": -1 } }, { $skip: (lSkip - 1) * 50 }, { $limit: 50 }
                    ]
                )
            } else {
                resp1 = await employeeInfoModel.aggregate(
                    [
                        { $match: query },
                        firstDate ? {
                            $lookup: {
                                from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                                pipeline: [{
                                    "$match": {
                                        "$expr": { $and: [{ $gte: ["$date", firstDate] }, { $lte: ["$date", lastDate] }] }
                                    }
                                }]
                            }
                        } : {
                            $lookup: {
                                from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                                pipeline: [{
                                    "$match": {
                                        "$expr": { $eq: ["$monthId", monthId] },
                                    }
                                }]
                            }
                        },
                        { $unwind: "$record" },
                        { $group: { _id: "$record.company", vid: { $first: "$record._id" }, count: { $sum: 1 }, qty: { $sum: "$productPcs" }, total: { $sum: "$record.productPrice" } } },
                        { $project: { vid: 1, Vendor: "$_id", qty: 1, Count: "$count", Amount: "$total", _id: 0 } },
                        { $sort: { "Amount": -1 } }, { $limit: parseInt(req.query.vendor) }
                    ]
                )
            }

            resp2 = await employeeInfoModel.aggregate([
                { $match: query },
                firstDate ? {
                    $lookup: {
                        from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                        pipeline: [{
                            "$match": {
                                "$expr": { $and: [{ $gte: ["$date", firstDate] }, { $lte: ["$date", lastDate] }] }
                            }
                        }]
                    }
                } : {
                    $lookup: {
                        from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                        pipeline: [{
                            "$match": {
                                "$expr": { $eq: ["$monthId", monthId] },
                            }
                        }]
                    }
                },
                { $unwind: "$record" },
                { $group: { _id: "$record.company", count: { $sum: 1 }, vid: { $first: "$record._id" }, qty: { $sum: "$productPcs" }, total: { $sum: "$record.productPrice" } } },
                { $project: { vid: 1, Vendor: "$_id", qty: 1, Count: "$count", Amount: "$total", _id: 0 } }, { $sort: { Amount: -1 } },
                { $group: { _id: null, total: { $sum: "$Amount" } } }
            ]);


            resp3 = await employeeInfoModel.aggregate([
                { $match: query },
                firstDate ? {
                    $lookup: {
                        from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                        pipeline: [{
                            "$match": {
                                "$expr": { $and: [{ $gte: ["$date", firstDate] }, { $lte: ["$date", lastDate] }] }
                            }
                        }]
                    }
                } : {
                    $lookup: {
                        from: "tallies", localField: "empName", foreignField: "employee", as: "record",
                        pipeline: [{
                            "$match": {
                                "$expr": { $eq: ["$monthId", monthId] },
                            }
                        }]
                    }
                },
                { $unwind: "$record" },
                { $group: { _id: "$record.company", count: { $sum: 1 }, vid: { $first: "$record._id" }, qty: { $sum: "$productPcs" }, total: { $sum: "$record.productPrice" } } },
                { $project: { vid: 1, Vendor: "$_id", qty: 1, Count: "$count", Amount: "$total", _id: 0 } },
                { $sort: { Amount: -1 } }

            ])

        } else {
            if (!req.query.vendor) {
                resp1 = await productModel.aggregate([{ $match: query }, { $group: { _id: "$company", vid: { $first: "$_id" }, qty: { $sum: "$productPcs" }, count: { $sum: 1 }, total: { $sum: "$productPrice" } } }, { $project: { vid: 1, Vendor: "$_id", _id: 0, Quantity: "$qty", Count: "$count", Amount: "$total" } }, { $sort: { "Amount": -1 } }, { $skip: (lSkip - 1) * 50 }, { $limit: 50 }]);
                resp2 = await productModel.aggregate([{ $match: query }, { $group: { _id: "$company", vid: { $first: "$_id" }, qty: { $sum: "$productPcs" }, count: { $sum: 1 }, total: { $sum: "$productPrice" } } }, { $project: { vid: 1, Vendor: "$_id", _id: 0, Quantity: "$qty", Count: "$count", Amount: "$total" } }, { $sort: { "Amount": -1 } }, { $group: { _id: null, total: { $sum: "$Amount" } } }]);
                resp3 = await productModel.aggregate([{ $match: query }, { $group: { _id: "$company", vid: { $first: "$_id" }, qty: { $sum: "$productPcs" }, count: { $sum: 1 }, total: { $sum: "$productPrice" } } }, { $project: { vid: 1, Vendor: "$_id", _id: 0, Quantity: "$qty", Count: "$count", Amount: "$total" } }, { $sort: { "Amount": -1 } }]);
            } else {
                resp1 = await productModel.aggregate([{ $match: query }, { $group: { _id: "$company", vid: { $first: "$_id" }, qty: { $sum: "$productPcs" }, count: { $sum: 1 }, total: { $sum: "$productPrice" } } }, { $project: { vid: 1, Vendor: "$_id", _id: 0, Quantity: "$qty", Count: "$count", Amount: "$total" } }, { $sort: { "Amount": -1 } }, { $limit: parseInt(req.query.vendor) }]);
                resp2 = await productModel.aggregate([{ $match: query }, { $group: { _id: "$company", vid: { $first: "$_id" }, qty: { $sum: "$productPcs" }, count: { $sum: 1 }, total: { $sum: "$productPrice" } } }, { $project: { vid: 1, Vendor: "$_id", _id: 0, Quantity: "$qty", Count: "$count", Amount: "$total" } }, { $sort: { "Amount": -1 } }, { $group: { _id: null, total: { $sum: "$Amount" } } }]);
                resp3 = await productModel.aggregate([{ $match: query }, { $group: { _id: "$company", vid: { $first: "$_id" }, qty: { $sum: "$productPcs" }, count: { $sum: 1 }, total: { $sum: "$productPrice" } } }, { $project: { vid: 1, Vendor: "$_id", _id: 0, Quantity: "$qty", Count: "$count", Amount: "$total" } }, { $sort: { "Amount": -1 } }]);
            }
        }

        let Total_Amount = 0;
        const vendorCount = resp3.length;
        const paginationCount = Math.ceil((resp3.length) / 50);

        if (resp1.length > 0) {
            Total_Amount = resp2[0].total;
        } else {
            return res.status(200).json({ status: 200, message: "Record Not Found", response: resp1, vendorCount, paginationCount, Total_Amount });
        }

        if (resp1) {
            res.status(200).json({ status: 200, message: "Vendor's List", response: resp1, vendorCount, paginationCount, Total_Amount });
        } else {
            res.status(200).json({ status: 400, message: "Vendor Not Found", response: resp1, vendorCount, paginationCount, Total_Amount });
        }

    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.GetVendorByName = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {

        const vid = req.query.vid;
        let currMonthID = await monthModel.findOne({ month: currentMonth });
        //
        // Get vendor name 
        const get_product = await productModel.findById({ _id: vid });
        const vendor = get_product.company;
        //
        const vendor_resp = await productModel.aggregate([
            { $match: { company: vendor, monthId: currMonthID._id, year: date.getFullYear(), companyid: companyId } },
            {
                $project: {
                    _id: 1, date: { $dateToString: { date: "$date", format: "%d-%m-%Y" } }, salesPerson: "$employee", vendor: "$company", product: 1, qty: "$productPcs",
                    amount: "$productPrice", average: { $divide: ["$productPrice", "$productPcs"] }
                }
            }
        ]);

        if (vendor_resp) {
            res.status(200).json({ status: 200, message: "Product Details", response: vendor_resp });
        } else {
            res.status(200).json({ status: 401, message: "Product Not Found", response: vendor_resp });
        }

    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

