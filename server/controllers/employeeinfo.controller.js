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

// --------------------- get single employee with hierarchy -----------------------
exports.getEmployeeDetail = async (req, res) => {
    try {
        const companyId = mongoose.Types.ObjectId(req.userid);
        const employeeId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ status: 400, message: "Invalid employee id" });
        }

        const nestedPopulateQuery = { path: 'rmId', populate: { path: 'designation' } };

        const employee = await empInfoModel
            .findOne({ _id: employeeId, companyid: companyId })
            .populate('designation')
            .populate('zoneId')
            .populate('city')
            .populate('state')
            .populate(nestedPopulateQuery);

        if (!employee) {
            return res.status(404).json({ status: 404, message: "Employee not found" });
        }

        // Helper to recursively get all subordinates
        async function getAllSubordinates(empId) {
            let allSubs = [];
            const directSubs = await empInfoModel.find({ rmId: empId, companyid: companyId });
            for (const sub of directSubs) {
                allSubs.push(sub);
                const subSubs = await getAllSubordinates(sub._id);
                allSubs = allSubs.concat(subSubs);
            }
            return allSubs;
        }

        // Get all subordinates (recursive)
        const allSubordinates = await getAllSubordinates(employee._id);

        // Team: names of all direct subordinates
        const directReports = await empInfoModel
            .find({ rmId: employee._id, companyid: companyId })
            .populate('designation')
            .select('empId empName designation zoneId state city status');
        const directReportsCount = directReports.length;

        // Aggregate all parties (employee + all subordinates)
        let allParties = Array.isArray(employee.party) ? [...employee.party] : [];
        console.log(`[DEBUG] Employee ${employee.empName} has parties:`, employee.party);
        
        for (const sub of allSubordinates) {
            if (Array.isArray(sub.party)) {
                allParties = allParties.concat(sub.party);
            }
        }
        // Remove duplicates and filter out empty values
        allParties = [...new Set(allParties.filter(party => party && party.trim() !== '' && party !== 'Party A' && party !== 'Party B'))];
        console.log(`[DEBUG] Total valid parties for ${employee.empName}:`, allParties.length, allParties.slice(0, 5));

        // Fetch invoices for all parties
        const TallyVoucher = require("../models/tallyVoucher.model");
        let invoices = [];
        if (allParties.length > 0) {
            // Query both party and partyledgername fields to ensure we catch all vouchers
            const rawInvoices = await TallyVoucher.find({
                companyId: companyId,
                $or: [
                    { party: { $in: allParties } },
                    { partyledgername: { $in: allParties } }
                ]
            }).sort({ date: -1 }).limit(1000); // Limit to prevent excessive data
            
            // Process invoices to add debit/credit information and transaction nature
            invoices = rawInvoices.map(invoice => {
                // Determine if this is income or expense based on voucher type and amount
                let transactionType = 'Unknown';
                let debitCreditType = 'Dr'; // Default
                
                if (invoice.voucherType === 'Sales') {
                    // For sales, positive amount typically means income (customer owes us money)
                    transactionType = invoice.amount >= 0 ? 'Income' : 'Return';
                    debitCreditType = invoice.amount >= 0 ? 'Dr' : 'Cr';
                } else if (invoice.voucherType === 'Purchase') {
                    // For purchases, positive amount typically means expense (we owe supplier money)
                    transactionType = invoice.amount >= 0 ? 'Expense' : 'Return';
                    debitCreditType = invoice.amount >= 0 ? 'Cr' : 'Dr';
                } else if (invoice.voucherType === 'Payment') {
                    transactionType = 'Payment';
                    debitCreditType = 'Cr';
                } else if (invoice.voucherType === 'Receipt') {
                    transactionType = 'Receipt';
                    debitCreditType = 'Dr';
                }
                
                // Convert to plain object and add our fields
                const invoiceObj = invoice.toObject();
                return {
                    ...invoiceObj,
                    transactionType,
                    debitCreditType,
                    // Add a computed field for display
                    displayAmount: Math.abs(invoice.amount || 0),
                    isPositive: (invoice.amount || 0) >= 0
                };
            });
            
            console.log(`[DEBUG] Found ${invoices.length} invoices for ${employee.empName}`);
            if (invoices.length > 0) {
                console.log(`[DEBUG] Sample invoice details:`, invoices.slice(0, 2).map(inv => ({
                    voucherNumber: inv.voucherNumber,
                    party: inv.party || inv.partyledgername,
                    amount: inv.amount,
                    transactionType: inv.transactionType,
                    debitCreditType: inv.debitCreditType
                })));
            }
        }

        return res.status(200).json({
            status: 200,
            message: 'Employee detail',
            response: {
                employee,
                reportingManager: employee.rmId || null,
                directReportsCount,
                directReports,
                allSubordinates: allSubordinates.map(e => ({
                    _id: e._id,
                    empId: e.empId,
                    empName: e.empName,
                    designation: e.designation,
                })),
                parties: allParties,
                invoices,
            },
        });
    } catch (error) {
        res.status(500).json({ status: 500, message: error.message });
    }
};

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
    console.log('🔍 GetZones API called');
    console.log('🔍 Company ID from token:', companyId, 'Type:', typeof companyId);
    
    try {
        if (!companyId) {
            console.error('❌ No company ID found in request');
            return res.status(400).json({ 
                status: 400, 
                message: "Authentication required - no company ID found",
                response: [] 
            });
        }

        // Convert string to ObjectId if needed for comparison
        let queryCompanyId;
        try {
            queryCompanyId = mongoose.Types.ObjectId.isValid(companyId) 
                ? new mongoose.Types.ObjectId(companyId) 
                : companyId;
        } catch (conversionError) {
            console.error('❌ Invalid company ID format:', companyId);
            return res.status(400).json({ 
                status: 400, 
                message: "Invalid company ID format",
                response: [] 
            });
        }

        console.log('� Querying zones for company:', queryCompanyId);
        
        // Query zones with the correct company ID
        const zones = await Zone.find({ companyid: queryCompanyId }).sort({ zone: 1 });
        
        console.log('📋 Query result - Found zones:', zones.length);
        
        if (zones.length > 0) {
            console.log('✅ Zones retrieved successfully');
            console.log('📋 Zone names:', zones.map(z => z.zone));
            
            return res.status(200).json({ 
                status: 200, 
                message: "Zones retrieved successfully", 
                response: zones 
            });
        } else {
            console.log('⚠️ No zones found - running diagnostics...');
            
            // Diagnostic checks
            const totalZones = await Zone.countDocuments();
            const zonesWithCompany = await Zone.countDocuments({ companyid: { $exists: true } });
            const sampleZone = await Zone.findOne();
            
            console.log('🔍 Diagnostics:');
            console.log('  - Total zones in database:', totalZones);
            console.log('  - Zones with company ID:', zonesWithCompany);
            
            if (sampleZone) {
                console.log('  - Sample zone company ID:', sampleZone.companyid, 'Type:', typeof sampleZone.companyid);
                console.log('  - Comparison (loose):', sampleZone.companyid == companyId);
                console.log('  - Comparison (strict):', sampleZone.companyid === companyId);
                console.log('  - ObjectId comparison:', sampleZone.companyid.equals(queryCompanyId));
            }
            
            return res.status(200).json({ 
                status: 200, 
                message: "No zones found for this company", 
                response: [] 
            });
        }
        
    } catch (err) {
        console.error('❌ Error in GetZones:', err.message);
        console.error('❌ Stack trace:', err.stack);
        return res.status(500).json({ 
            status: 500, 
            message: "Internal server error", 
            response: [] 
        });
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














