const tallyModel = require("../models/tally.model");
const monthModel = require("../models/month.model");
const RateDiffModel = require("../models/rateDifference.model");
const ChqBounceModel = require("../models/chequeBounce.model");
const { default: mongoose } = require("mongoose");

const date = new Date();


exports.CreateTallyReport = async (req, res) => {
    const data = req.body;
    const companyId = mongoose.Types.ObjectId(mongoose.Types.ObjectId(req.userid));
    var tallyData = [];

    try {
        if (data.length > 0) {

            for (var i = 0; i < data.length; i++) {

                if (data[i].product.length > 0) {
                    for (let j = 0; j < data[i].product.length; j++) {

                        // pcs
                        let pcs_split = 0; productPcs = 0;
                        pcs_split = data[i].totalPcs[j].split(" ");
                        productPcs = pcs_split[0];

                        //netAmount
                        let nAmt_split = 0; let netAmount = 0;
                        nAmt_split = data[i].tax[0].split(" ");
                        netAmount = nAmt_split[0];

                        //tax
                        let tax_split = 0; let tax = 0;
                        tax_split = data[i].tax[1].split(" ");
                        tax = tax_split[0];

                        //date  
                        let dateformat;
                        dateformat = new Date(data[i]?.date[0]);
                        dateformat.setDate(dateformat.getDate() + 1);

                        const tallyObj = {
                            date: dateformat,
                            company: data[i]?.company[0],
                            product: data[i]?.product[j],
                            employee: data[i]?.employee[0],
                            invoice: data[i]?.invoice[0],
                            totalPcs: data[i]?.totalPcs[j],
                            productPcs: productPcs,
                            productPrice: data[i]?.productPrize[j],
                            totalAmount: data[i]?.netAmount[0],
                            tax: tax,
                            netAmount: netAmount,
                            companyid: companyId,
                            monthId: data[i]?.monthId[0],
                            year: date.getFullYear()
                        }


                        let check = {
                            $and: [
                                { date: dateformat },
                                { invoice: data[i].invoice[0] },
                                { company: data[i].company[0] },
                                { employee: data[i].employee[0] },
                                { product: data[i]?.product[j] },
                                { companyid: companyId },
                                { monthId: data[i].monthId[0] },
                                { year: date.getFullYear() }
                            ]
                        };

                        var tally_resp = await tallyModel.updateOne(check, { $set: tallyObj }, { upsert: true });
                        if (tally_resp) { tallyData.push(tally_resp); }
                    }
                    if (data.length - 1 == i) {
                        res.status(200).json({ status: 201, message: "Successfully Uploaded", response: tallyData });
                    }
                } else { return res.status(200).json({ status: 401, message: "Upload Correct File" }) }
            }
        }
        else {
            return res.status(200).json({ status: 401, message: "Not Uploaded", response: tallyData });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};


// ------------ Rate Difference --------------------
exports.RateDifference = async (req, res) => {
    let rateDiff = [];
    const data = req.body;
    const companyId = mongoose.Types.ObjectId(req.userid);

    try {
        if (data.length > 0) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].vchNo[0].length > 0) {
                    // igst
                    let igst_split = 0; let igst = 0;
                    igst_split = data[i].igst[0].split(" ");
                    igst = igst_split[0];

                    // igst_purchase
                    let igstP_split = 0; let igstP = 0;
                    igstP_split = data[i].igstPurchase[0].split(" ");
                    igstP = igstP_split[0];

                    // date
                    let dateformat;
                    dateformat = new Date(data[i]?.date[0]);
                    dateformat.setDate(dateformat.getDate() + 1);


                    const obj = {
                        date: dateformat,
                        vendor: data[i].vendor[0],
                        employee: data[i].employee[0],
                        vchNo: data[i].vchNo[0],
                        totalAmt: data[i].totalAmt[0],
                        igstPurchase: igstP,
                        igst: igst,
                        companyid: companyId,
                        monthId: data[i].monthId[0],
                        year: date.getFullYear()
                    }

                    const check = {
                        $and: [
                            { date: dateformat },
                            { vendor: data[i].vendor },
                            { employee: data[i].employee },
                            { vchNo: data[i].vchNo },
                            { monthId: data[i].monthId },
                            { companyid: companyId },
                            { year: date.getFullYear() }
                        ]
                    }

                    const rateDiff_resp = await RateDiffModel.updateOne(check, { $set: obj }, { upsert: true });
                    if (rateDiff_resp) { rateDiff.push(rateDiff_resp); }

                    if (data.length - 1 == i) {
                        return res.status(200).json({ status: 200, message: "Successfully Uploaded", response: rateDiff });
                    }
                } else {
                    return res.status(200).json({ status: 401, message: "Upload Correct File" });
                }
            }
        } else {
            return res.status(200).json({ status: 401, message: "Not Uploaded" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};


// -------------- Cheque Bounce ------------------
exports.ChequeBounce = async (req, res) => {
    let cqBounce = [];
    const data = req.body;
    const companyId = mongoose.Types.ObjectId(req.userid);

    try {
        for (var i = 0; i < data.length; i++) {

            let dateformat;
            dateformat = new Date(data[i].date);
            dateformat.setDate(dateformat.getDate() + 1);

            if (data[i].vchNo) {
                const obj = {
                    date: dateformat,
                    seller: data[i].seller,
                    vchNo: data[i].vchNo,
                    vchType: data[i].vchType,
                    debit: data[i].debit,
                    credit: data[i].credit,
                    companyid: companyId,
                    monthId: data[i].monthId,
                    year: date.getFullYear()
                }

                let check = {
                    $and: [
                        { date: dateformat },
                        { seller: data[i].seller },
                        { vchNo: data[i].vchNo },
                        { vchType: data[i].vchType },
                        { companyid: companyId }
                    ]
                }

                const cqBounce_resp = await ChqBounceModel.updateOne(check, { $set: obj }, { upsert: true });
                if (cqBounce_resp) { cqBounce.push(cqBounce_resp); }

                if (data.length - 1 == i) {
                    return res.status(200).json({ status: 200, message: "Successfully Upload", response: cqBounce });
                }
            } else {
                res.status(200).json({ status: 401, message: "Upload Correct File" });
            }
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
}



