const empInfoModel = require("../models/employeeinfo.model");
const monthModel = require("../models/month.model");
const slryExpnsModel = require("../models/salary+expenses.model");
const Zone = require("../models/zone.model");
const tallyModel = require("../models/tally.model");
const mongoose = require("mongoose");
const designationModel = require("../models/designation.model");


var date = new Date();
var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

var currMonth = monthNames[date.getMonth()];
let count = 0;


async function empAmtUpdate(rm_id) {
    //------------------------ target update -------------------------
    let upDateObj = {};
    const mnth_yrly = await empInfoModel.aggregate([
        { $match: { rmId: rm_id } },
        { $group: { _id: null, totYtrgt: { $sum: "$yrlytarget" }, totMtrgt: { $sum: "$mnthtarget" } } }
    ]);

    (mnth_yrly.length > 0) ? `${upDateObj.yrlytarget = mnth_yrly[0].totYtrgt, upDateObj.mnthtarget = mnth_yrly[0].totMtrgt}` : `${upDateObj.yrlytarget = 1, upDateObj.mnthtarget = 1}`;
    var trgtUpdate = await empInfoModel.findByIdAndUpdate({ _id: rm_id }, upDateObj, { new: true });
    if (trgtUpdate.rmId === null) { return false } else { return trgtUpdate.rmId };
}


// ---------------------- Employee ------------------------
exports.CreateEmployee = async (req, res) => {
     const data = req.body;
    let rmName;
    const companyId = mongoose.Types.ObjectId(req.userid);
    let insert_resp;

    try {
        //check empid
        const empID = await empInfoModel.findOne({ empId: req.body.empId, companyid: companyId });
        if (empID) {
            return res.status(200).json({ status: 401, message: "Employee ID Already Exists" });
        } else {

            const Head = await designationModel.findById({ _id: req.body.designation, companyid: companyId });
            if (Head.isHead == true) {
                try {
                    const empObj = {
                        empId: data.empId,
                        empName: data.empName,
                        designation: data.designation,
                        doj: data.doj,
                        status: data.status,
                        mnthtarget: data.mnthtarget || 0,
                        yrlytarget: data.yrlytarget || 0,
                        empLeftDate: data.empLeftDate,
                        companyid: companyId
                    };

                    const isExist = await empInfoModel.findOne({ designation: req.body.designation });

                    if (!isExist) {
                        insert_resp = await empInfoModel.create(empObj);
                        res.status(200).json({ status: 200, message: "Successfully Created", response: insert_resp });
                    } else {
                        res.status(200).json({ status: 401, message: "Already Exists" });
                    }
                } catch (error) {
                    console.error("Error:", error);
                    res.status(500).json({ status: 500, message: "Internal Server Error" });
                }
            } else if (Head.isHead == false && Hget.isHead) {
                const dsgn = await designationModel.findById({ _id: req.body.designation, companyid: companyId });
                // const Hget = await designationModel.findById({ _id: dsgn.rmdsgn }); // get rm NAME
                if (Hget.isHead) {
                    // rmName = await empInfoModel.findById({ _id: req.body.rmId });
                    const empObj = {
                        empId: data.empId,
                        empName: data.empName,
                        designation: data.designation,
                        rmId: data.rmId,
                        // rm: rmName.empName,
                        zoneId: data.zoneId,
                        doj: data.doj,
                        status: data.status,
                        mnthtarget: data.mnthtarget || 0,
                        yrlytarget: data.yrlytarget || 0,
                        empLeftDate: data.empLeftDate,
                        companyid: companyId
                    }
                    //check according ZONE
                    const isExist = await empInfoModel.findOne({ zoneId: req.body.zoneId, designation: req.body.designation, companyid: companyId });
                    if (!isExist) {
                        insert_resp = await empInfoModel.create(empObj);
                        res.status(200).json({ status: 200, message: "Successfully Created", response: insert_resp });
                    } else {
                        res.status(200).json({ status: 401, message: "Already Exists" });
                    }
                }
            } 
            else {
                if(req.body.rmId){
                    rmName = await empInfoModel.findById({ _id: req.body.rmId });
                    console.log(rmName);
                    const empObj = {
                        empId: data.empId,
                        empName: data.empName,
                        designation: data.designation,
                        rmId: data.rmId,
                        rm: rmName.empName,
                        zoneId: data.zoneId,
                        state: data.state,
                        city: data.city,
                        doj: data.doj,
                        status: data.status,
                        mnthtarget: data.mnthtarget || 0,
                        yrlytarget: data.yrlytarget || 0,
                        empLeftDate: data.empLeftDate,
                        companyid: companyId
                    }
                    insert_resp = await empInfoModel.create(empObj);
                    if (insert_resp) {
                      return  res.status(200).json({ status: 200, message: "Successfully Created", response: insert_resp });
                    } else {
                        res.status(200).json({ status: 401, message: "Not Created" });
                    }
                }
                else{
                    const empObj = {
                        empId: data.empId,
                        empName: data.empName,
                        designation: data.designation,
                         
                        zoneId: data.zoneId,
                        state: data.state,
                        city: data.city,
                        doj: data.doj,
                        status: data.status,
                        mnthtarget: data.mnthtarget || 0,
                        yrlytarget: data.yrlytarget || 0,
                        empLeftDate: data.empLeftDate,
                        companyid: companyId
                    }
                    insert_resp = await empInfoModel.create(empObj);
                    if (insert_resp) {
                       return res.status(200).json({ status: 200, message: "Successfully Created", response: insert_resp });
                    } 
                    else {
                        res.status(200).json({ status: 401, message: "Not Created" });
                    }
                 }
              
            }
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.stack });
    }
};


exports.UpdateEmployee = async (req, res) => {
     const data = req.body;
      let rmName;
    try {
         const Head = await designationModel.findById({ _id: req.body.designation, companyid: req.body.companyId });
        // if (Head.isHead == true) {
            const empObj = {
                empId: data.empId,
                empName: data.empName,
                designation: data.designation,
                doj: data.doj,
                status: data.status,
                mnthtarget: data.mnthtarget || 0,
                yrlytarget: data.yrlytarget || 0,
                empLeftDate: data.empLeftDate,
                companyid: data?.companyId,
                state:data?.state,
                city:data?.city,
                zoneId:data.zoneId,
                rmId:data?.rmId,
                
            }

            const insert_resp = await empInfoModel.findByIdAndUpdate({ _id: data.employId }, empObj, { new: true });
            if (insert_resp) {
                res.status(200).json({ status: 200, message: "Successfully Updated", response: insert_resp });
            } else {
                res.status(200).json({ status: 401, message: "Not Updated" });
            }

        // } else {
        //     console.log(data)
        //     const empObj = {
        //         empId: data.empId,
        //         empName: data.empName,
        //         designation: data.designation,
        //         doj: data.doj,
        //         status: data.status,
        //         mnthtarget: data.mnthtarget || 0,
        //         yrlytarget: data.yrlytarget || 0,
        //         empLeftDate: data.empLeftDate,
        //         companyid: data?.companyId
        //     }

        //     const insert_resp = await empInfoModel.findByIdAndUpdate({ _id: data.employId }, empObj, { new: true });
        //     if (insert_resp) {
        //         res.status(200).json({ status: 200, message: "Successfully Updated", response: insert_resp });
        //     } else {
        //         res.status(200).json({ status: 401, message: "Not Updated" });
        //     }
        // }

    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.DeleteEmployee = async (req, res) => {
    try{
        
    }
    catch(err){
        res.status(400).json({ status: 400, response: err.message });

    }
}

exports.ReportingManager = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
     try {
     let search=req.query.search;
     if(search){
        const findEmp = { empName: { $regex: search, $options: "i" }, companyid: companyId };

        const reporting_manager = await empInfoModel.find(findEmp);
        return res.status(200).json({ status: 200, message: "reporting manager", response: reporting_manager });

     }
     else{
        const reporting_manager = await empInfoModel.find({companyid: companyId }).populate("designation");
        return res.status(200).json({ status: 200, message: "reporting manager", response: reporting_manager });

     }
        // const data = req.query;
         //check first
        // const dsgn = await designationModel.findById({ _id: data.designationId, companyid: companyId });
        // if (dsgn.isHead) {
        //      return res.status(200).json({ status: 401, message: "Head's RM Not Exists" });
        // }
        // // reporting manager
        // const rmDsgn = await designationModel.findById({ _id: dsgn.rmdsgn, companyid: companyId });
        //   if (rmDsgn) {
            // const reporting_manager = await empInfoModel.find({companyid: companyId }).populate("designation");
        //     res.status(200).json({ status: 200, message: "reporting manager", response: reporting_manager });
        // } else if (rmDsgn)  {
        //     console.log(rmDsgn);
        //      const reporting_manager = await empInfoModel.find({ designation: rmDsgn._id, zoneId: data.zoneId, companyid: companyId }).populate("designation");
            // return res.status(200).json({ status: 200, message: "reporting manager", response: reporting_manager });
             
        // } else {
        //     res.status(200).json({ status: 401, message: "Not Found" });
        // }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};


exports.getEmployee = async (req, res) => {
    let findActiveEmp = 0; let findLeftEmp = 0; let ActiveEmpPagination = 0; let LeftEmpPagination = 0;
    let ActiveEmp = 0; let LeftEmp = 0;
    //Active/Inactive filter
    const Askip = req.query.Askip;
    const Lskip = req.query.Lskip;

    const companyId = req.userid;

    try {
        const search = req.query.name;
        const active = { empName: { $regex: new RegExp(search, 'i') }, status: true, companyid: companyId };
        const inactive = { empName: { $regex: new RegExp(search, 'i') }, status: false, companyid: companyId };
        const nestedPopulateQuery = { path: 'rmId', populate: { path: 'designation' } };

        if (!search) {
            findActiveEmp = await empInfoModel.find({ status: true, companyid: companyId }).sort({ createdAt: -1 }).populate('designation').populate('zoneId').populate('city').populate('state').populate(nestedPopulateQuery).limit(50).skip((Askip - 1) * 50);
            findLeftEmp = await empInfoModel.find({ status: false, companyid: companyId }).sort({ createdAt: -1 }).populate('designation').populate('zoneId').populate('city').populate('state').populate(nestedPopulateQuery).limit(50).skip((Lskip - 1) * 50);
            //Pagination
            ActiveEmp = await empInfoModel.find({ status: true, companyid: companyId }).sort({ createdAt: -1 }).populate('designation').populate('zoneId').populate('city').populate('state');
            LeftEmp = await empInfoModel.find({ status: false, companyid: companyId }).sort({ createdAt: -1 }).populate('designation').populate('zoneId').populate('city').populate('state');

            ActiveEmpPagination = Math.ceil(ActiveEmp.length / 50);
            LeftEmpPagination = Math.ceil(LeftEmp.length / 50);
            let activeCount = ActiveEmp.length;
            let leftCount = LeftEmp.length;

            return res.status(200).json({ status: 200, response: { findActiveEmp }, findLeftEmp, ActiveEmpPagination, activeCount, LeftEmpPagination, leftCount });

        } else if (search) {

            findActiveEmp = await empInfoModel.find(active).sort({ createdAt: -1 }).populate('designation').populate('zoneId').populate('city').populate('state').populate(nestedPopulateQuery).limit(50).skip((Askip - 1) * 50);
            findLeftEmp = await empInfoModel.find(inactive).sort({ createdAt: -1 }).populate('designation').populate('zoneId').populate('city').populate('state').populate(nestedPopulateQuery).limit(50).skip((Lskip - 1) * 50);
            // Pagination
            ActiveEmp = await empInfoModel.find(active).sort({ createdAt: -1 }).populate('designation').populate('zoneId').populate('city').populate('state');
            LeftEmp = await empInfoModel.find(inactive).sort({ createdAt: -1 }).populate('designation').populate('zoneId').populate('city').populate('state');

            ActiveEmpPagination = Math.ceil(ActiveEmp.length / 50);
            LeftEmpPagination = Math.ceil(LeftEmp.length / 50);
            let activeCount = ActiveEmp.length;
            let leftCount = LeftEmp.length;

            return res.status(200).json({ status: 200, response: { findActiveEmp }, findLeftEmp, ActiveEmpPagination, activeCount, LeftEmpPagination, leftCount });
        }
    } catch (error) {
        res.status(400).json({ status: 400, response: error.message });
    }
}

// --------------------- get user by state -----------------------
exports.getStateUser = async (req, res) => {
    const companyId = req.userid;
    try {
        const activeStateUser = await empInfoModel.find({ state: req.query.stateId, status: true, companyid: companyId }).populate('state').populate('zoneId').populate('designation').populate('city');
        const inactiveStateUser = await empInfoModel.find({ state: req.query.stateId, status: false, companyid: companyId }).populate('state').populate('zoneId').populate('designation').populate('city');
        res.status(200).json({ status: 200, response: { activeStateUser }, inactiveStateUser })
    } catch (error) {
        res.status(400).json({ status: 400, response: err.message });
    }
};



// -------------------- Create Zone ------------------------
exports.createZone = async (req, res) => {
    const companyId = req.userid;
    try {
        const data = {
            zone: req.body.zone,
            companyid: companyId
        }
        const isExist = await Zone.findOne({ zone: { $regex: req.body.zone, $options: "i" }, companyid: companyId });

        if (!isExist) {
            const resp = await Zone.create(data);
            if (resp) {
                res.status(200).json({ status: 200, message: "Successfully Created", response: resp });
            } else {
                res.status(200).json({ status: 400, message: "Not Created" });
            }
        } else {
            res.status(200).json({ status: 400, message: "Already Exists" })
        }
    }
    catch (error) {
        res.status(400).json({ status: 400, response: error.message });
    }
};

exports.GetZones = async (req, res) => {
    const companyId = req.userid;
    try {
        const resp = await Zone.find({ zone: { $exists: true }, companyid: companyId }).sort({ _id: 1 });
        if (resp) {
            res.status(200).json({ status: 200, message: "Get Successfully", response: resp });
        } else {
            res.status(200).json({ status: 400, message: "Zone Not Available", response: resp });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.DeleteZone = async (req, res) => {
    try {
        const resp = await Zone.findByIdAndDelete({ _id: req.params.id });
        if (resp) {
            res.status(200).json({ status: 200, message: "Successfully Deleted", response: resp });
        } else {
            res.status(200).json({ status: 400, message: "Not Deleted" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.UpdateZone = async (req, res) => {
    const data = { zone: req.body.zone };
    try {
        const resp = await Zone.findByIdAndUpdate({ _id: req.body.id }, data, { new: true });
        if (resp) {
            res.status(200).json({ status: 200, message: "Successfully Updated", response: resp, });
        } else {
            res.status(200).json({ status: 400, message: "Not Updated" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
}


// ------------------------ Months ----------------------------
exports.GetMonths = async (req, res) => {
    try {
        const resp = await monthModel.find({});
        res.status(200).json({ status: 200, response: resp });
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};


// else if (Head.isHead == false) {
//     const dsgn = await designationModel.findById({ _id: req.body.designation, companyid: req.body.companyId });
//     console.log(dsgn, "dsgn???");
//     const Hget = await designationModel.findById({ _id: dsgn.rmdsgn });
//     console.log(Hget, "Hget???");
//     if (Hget.isHead) {
//         rmName = await empInfoModel.findById({ _id: req.body.rmId });
//         const empObj = {
//             empId: data.empId,
//             empName: data.empName,
//             designation: data.designation,
//             rmId: data.rmId,
//             rm: rmName.empName,
//             zoneId: data.zoneId,
//             doj: data.doj,
//             status: data.status,
//             mnthtarget: data.mnthtarget || 0,
//             yrlytarget: data.yrlytarget || 0,
//             empLeftDate: data.empLeftDate,
//             companyid: data?.companyId
//         }
//         //check according ZONE
//         const isExist = await empInfoModel.findOne({ zoneId: req.body.zoneId, designation: req.body.designation, companyid: req.body.companyId, });
//         if (!isExist) {
//             insert_resp = await empInfoModel.create(empObj);
//             res.status(200).json({ status: 200, message: "Successfully Created", response: insert_resp });
//         } else {
//             res.status(200).json({ status: 401, message: "Already Exists" });
//         }
//     }
// } else {
//     rmName = await empInfoModel.findById({ _id: req.body.rmId });
//     const empObj = {
//         empId: data.empId,
//         empName: data.empName,
//         designation: data.designation,
//         rmId: data.rmId,
//         rm: rmName.empName,
//         zoneId: data.zoneId,
//         state: data.state,
//         city: data.city,
//         doj: data.doj,
//         status: data.status,
//         mnthtarget: data.mnthtarget || 0,
//         yrlytarget: data.yrlytarget || 0,
//         empLeftDate: data.empLeftDate,
//         companyid: data?.companyId
//     }
//     insert_resp = await empInfoModel.create(empObj);
//     if (insert_resp) {
//         res.status(200).json({ status: 200, message: "Successfully Created", response: insert_resp });
//     } else {
//         res.status(200).json({ status: 401, message: "Already Exists" });
//     }
// }














