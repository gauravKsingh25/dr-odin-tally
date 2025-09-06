const { default: mongoose } = require("mongoose");
const creditModel = require("../models/credit.model");
const monthModel = require("../models/month.model");

const date = new Date();

const UploadCreditReport = async (req, res) => {

    const data = req.body;
    let crReport = [];
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
                if (!data[i].Vch) {
                    return res.status(400).json({ status: 400, message: "Upload Correct File" });
                } else {

                    //TRF IGST
                    let trf_split = 0; let STOCK_TRF_IGST = 0;
                    trf_split = data[i].STOCK_TRF_IGST.split(" ");
                    STOCK_TRF_IGST = trf_split[0];
                    // IGST
                    let split_igst = 0; let IGST_OUTPUT = 0;
                    split_igst = data[i].IGST_OUTPUT.split(" ");
                    IGST_OUTPUT = split_igst[0];

                    //date
                    let dateformat;
                    dateformat = new Date(data[i].Date);
                    dateformat.setDate(dateformat.getDate() + 1);

                    let creditObj = {
                        "Date": dateformat,
                        "Vendor": data[i].Vendor,
                        "SalesPerson": data[i].SalesPerson,
                        "STOCK_TRF_IGST": STOCK_TRF_IGST,
                        "IGST_OUTPUT": IGST_OUTPUT,
                        "Credit_Note": data[i].Credit_Note,
                        "Vch": data[i].Vch,
                        "companyid": companyId,
                        "monthId": data[i].monthId,
                        "year": date.getFullYear()
                    }

                    let check = {
                        $and: [
                            { Date: dateformat },
                            { Vendor: data[i].Vendor },
                            { SalesPerson: data[i].SalesPerson },
                            { Vch: data[i].Vch },
                            { companyid: companyId },
                            { monthId: data[i].monthId },
                            { year: date.getFullYear() }
                        ]
                    };

                    var credit_resp = await creditModel.updateOne(check, { $set: creditObj }, { upsert: true });
                    if (credit_resp) { crReport.push(credit_resp); }
                }
                if (data.length - 1 == i) {
                    return res.status(200).json({ status: 200, message: "Successfully Uploaded", response: crReport });
                }
            }
        } else {
            return res.status(200).json({ status: 400, message: "Not Uploaded" })
        }
    } catch (error) {
        res.status(404).json({ status: 400, message: error.message });
    }
}

module.exports = { UploadCreditReport }



