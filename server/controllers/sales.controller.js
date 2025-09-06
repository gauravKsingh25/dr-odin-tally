
const sales = require('../models/sales.model');
// const employe = require('../models/employe.model');
const company = require('../models/company.model');
const product = require('../models/product.model');

exports.createSalesData = async (req, res) => {
    let data = req.body;
    for (let element of data) {
        if (element.particulars.length == element.am.length) {
            element.particulars.push(element.particulars[element.particulars.length - 1])
            element.particulars.push(element.particulars[element.particulars.length - 1])
            element.particulars[1] = null
        }

        if (element.particulars.length == element.am.length + 1) {
            element.particulars.splice(1, 0, null)
        }

        for (let i = 0; i < element.am.length; i++) {
            let obj = {
                date: element.date[0],
                company: element.particulars[0],
                employe: element.particulars[1],
                product: element.particulars[i + 2],
                invoice: element.one[0],
                amount: element.am[i],
                totalPsc: element.psc[i],
                amountPerPsc: element.two[i],
            }
            const sale = await sales.findOne({ date: obj.date, company: obj.company, employe: obj.employe, product: obj.product, invoice: obj.invoice, amount: obj.amount });
            if (!sale) {
                const emp = await employe.findOne({ name: obj.employe });
                if (emp) {
                    emp.totalSales += 1;
                    emp.totalSalesAmount += parseInt(obj.amount);
                    await employe.findByIdAndUpdate({ _id: emp._id }, emp)
                } else {
                    let newEmp = {
                        name: obj.employe,
                        totalSales: 1,
                        totalSalesAmount: parseInt(obj.amount),
                    }
                    await new employe(newEmp).save();
                }

                const camp = await company.findOne({ name: obj.company });
                if (camp) {
                    camp.totalSales += 1;
                    camp.totalSalesAmount += parseInt(obj.amount);
                    await company.findByIdAndUpdate({ _id: camp._id }, camp)
                } else {
                    let newEmp = {
                        name: obj.company,
                        totalSales: 1,
                        totalSalesAmount: parseInt(obj.amount),
                    }
                    await new company(newEmp).save();
                }

                const prod = await product.findOne({ name: obj.product });
                if (prod) {
                    prod.totalSales += 1;
                    prod.totalSalesAmount += parseInt(obj.amount);
                    await product.findByIdAndUpdate({ _id: prod._id }, prod)
                } else {
                    let newEmp = {
                        name: obj.product,
                        totalSales: 1,
                        totalSalesAmount: parseInt(obj.amount),
                    }
                    await new product(newEmp).save();
                }

                await new sales(obj).save();
            }
        }
    }
    res.status(200).json(data);
}



exports.totalCount = async (req, res) => {
    try {
        const empCount = await employe.find().countDocuments();
        const prodCount = await product.find().countDocuments();
        const salesCount = await sales.find().countDocuments();
        const compCount = await company.find().countDocuments();
        res.status(200).json({ empCount, prodCount, salesCount, compCount });
    }
    catch (error) {
    }
}




exports.ProductData = async (req, res) => {
    try {
        const prodData = await product.find().limit(req.query.limitNo).skip(req.query.pageNo * req.query.limitNo);
        const prodCount = await product.find().countDocuments();
        if (!prodData) {
            res.status(400).json({ message: "Data Not Found", status: 400 })
        }
        else {
            res.status(200).json({ prodData, prodCount })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Invalid Data", status: 500 })
    }
}




exports.vendorData = async (req, res) => {
    try {
        const vendorData = await company.find().limit(req.query.limitNo).skip(req.query.pageNo * req.query.limitNo);
        const vendorCount = await company.find().countDocuments();
        if (!vendorData) {
            res.status(400).json({ message: "Data Not Found", status: 400 })
        }
        else {
            res.status(200).json({ vendorData, vendorCount })
        }
    }
    catch (error) {
        res.status(500).json({ message: "Invalid Data", status: 500 })
    }
}




exports.employeeData = async (req, res) => {
    try {
        const empData = await employe.find().limit(req.query.limitNo).skip(req.query.pageNo * req.query.limitNo);
        const empCount = await employe.find().countDocuments();
        if (!empData) {
            res.status(400).json({ message: "Data Not Found", status: 400 });
        }
        else {
            res.status(200).json({ empData, empCount });
        }
    }
    catch (error) {
        res.status(500).json({ message: "Invalid Data", status: 500 });
    }
}