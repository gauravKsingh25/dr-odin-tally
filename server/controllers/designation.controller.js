const designationModel = require("../models/designation.model");
const statesModel = require("../models/state.model");
const cityModel = require("../models/city.model");
const zoneModel = require("../models/zone.model");
const { default: mongoose } = require("mongoose");
const employeeInfo = require("../models/employeeinfo.model");


// ---------------------- Designation ----------------------
exports.GetDesignations = async (req, res) => {
     const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        const search=req.query.search;
        const dsgnCount = await designationModel.countDocuments({ companyid: companyId });

        if(search){
            const findDsgn = { designation: { $regex: search, $options: "i" }, companyid: companyId };
            const resp= await designationModel.find(findDsgn);
            return res.status(200).json({ status: 200, message: "All Designations", response: resp, dsgnCount });
         }
        const resp = await designationModel.find({ companyid: companyId }).populate("rmdsgn");
        if (resp) {
          return  res.status(200).json({ status: 200, message: "All Designations", response: resp, dsgnCount });
        } else {
           return res.status(200).json({ status: 400, message: "Empty" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.DeleteDesignation = async (req, res) => {
    try {
        const resp = await designationModel.findByIdAndDelete({ _id: req.query.id });
        if (resp) {
            res.status(200).json({ status: 200, message: "Successfully Deleted", response: resp });
        } else {
            res.status(200).json({ status: 400, message: "Not Deleted" });
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
}

exports.InsertDesignations = async (req, res) => {
    // console.log("here creating designations")
    const data = req.body; let payload;
    // console.log(data,"Here Designation")
    const companyId = mongoose.Types.ObjectId(req.userid);

    try {
        const HisExist = await designationModel.findOne({ isHead: true, companyid: companyId });
        if (HisExist && data.isHead == true) { //check company HEAD
            return res.status(200).json({ status: 401, message: "Company Head Already Created" });
        }

        const MisExist = await designationModel.findOne({ isManager: true, companyid: companyId });
        if (MisExist && data.isManager == true) { // check Zone HEAD
            return res.status(200).json({ status: 401, message: "Zone Head Already Created" });
        }

        //check designation
        const designationExist = await designationModel.findOne({ companyid: companyId, designation: { $regex: data.designation, $options: "i" } });
        if (designationExist) {
            return res.status(200).json({ status: 401, message: "Already Created" });
        }

        if (!data.rmdsgn) {
            payload = {
                designation: data.designation,
                isHead: data.isHead,
                companyid: companyId
            }
        } else {
            payload = {
                designation: data.designation,
                rmdsgn: data.rmdsgn,
                isManager: data.isManager,
                isBDE: data.isBDE,
                companyid: companyId
            }
        }

        const resp = await designationModel.create(payload);
        if (resp) {
           return res.status(200).json({ status: 200, message: "Successfully Created", response: resp });
        } else {
            return  res.status(200).json({ status: 400, message: "Not Created" });
        }
    } catch (err) {
        return  res.status(400).json({ status: 400, response: err.message });
    }
};

exports.UpdateDesignations = async (req, res) => {
    const id = req.body.designationId; let obj; let resp;
    try {
        const Hcheck = await await designationModel.findById({ _id: id });
        if (Hcheck.isHead) {
            obj = { designation: req.body.designation };
            resp = await designationModel.findByIdAndUpdate({ _id: id }, obj, { new: true });
        } else {
            obj = { designation: req.body.designation, rmdsgn: req.body.rmdsgn };
            resp = await designationModel.findByIdAndUpdate({ _id: id }, obj, { new: true });
        }
        //
        if (resp) {
            res.status(200).json({ status: 200, message: "Successfully Updated", response: resp });
        } else {
            res.status(200).json({ status: 400, message: "Not Updated" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message })
    }
};



// ------------------------ State ---------------------------
exports.createState = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        const stateExist = await statesModel.find({ companyid: companyId });
        if (stateExist.length < 40) {
            const data = {
                zoneId: req.body.zoneId,
                state: req.body.state,
                companyid: companyId
            }
            const sameState = await statesModel.findOne({ state: { $regex: req.body.state, $options: 'i' }, companyid: companyId });
            if (!sameState) {
                const resp = await statesModel.create(data);
                if (resp) {
                    res.status(200).json({ status: 200, message: "Successfully Create", response: resp });
                } else {
                    res.status(200).json({ status: 400, message: "Not Created" });
                }
            }
            else {
                res.status(200).json({ status: 400, message: "Already Created" });
            }
        }
        else {
            res.status(200).json({ status: 400, message: "Only 40 States Allow" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.GetStates = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        const stateCount = await statesModel.countDocuments({ companyid: companyId });
        const state = await statesModel.find({ companyid: companyId });

        if (state) {
            res.status(200).json({ status: 200, message: "All States", response: state, stateCount });
        } else {
            res.status(200).json({ status: 400, message: "Empty" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.UpdateStates = async (req, res) => {
    const id = req.body.id;
    const data = {
        state: req.body.state,
        zoneId: req.body.zoneId
    }
    try {

        // const resp = await statesModel.updateOne({ _id: id, companyid : companyId }, {$set : data}, { new: true });
        const state_update = await statesModel.findByIdAndUpdate({ _id: id }, data, { new: true });
        if (state_update) {
            res.status(200).json({ status: 200, message: "Successfully Updated", response: state_update });
        } else {
            res.status(200).json({ status: 400, message: "Not Updated" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message })
    }
};

exports.DeleteState = async (req, res) => {
    try {
         const resp = await statesModel.findByIdAndDelete({ _id: req.query.id });
        await cityModel.deleteMany({stateId:req.query.id});
        await employeeInfo.deleteMany({state:req.query.id});
        if (resp) {
            res.status(200).json({ status: 200, message: "Successfully Deleted", response: resp });
        } else {
            res.status(200).json({ status: 400, message: "Not Deleted" });
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
}

exports.GetZoneWiseState = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        const zoneFind = await zoneModel.findOne({ _id: req.query.zoneId, companyid: companyId });
        const state = await statesModel.find({ zoneId: zoneFind._id, companyid: companyId }).populate('zoneId');
        if (state) {
            res.status(200).json({ status: 200, message: "All States", response: state })
        } else {
            res.status(200).json({ status: 400, message: "Empty" })
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};



//--------------------------- City ---------------------------
exports.createCity = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        const city = await cityModel.find({ stateId: req.body.stateId, companyid: companyId });

        if (city.length < 50) {
            const data = { stateId: req.body.stateId, city: req.body.city, companyid: companyId };
            const isExist = await cityModel.findOne({ city: { $regex: req.body.city, $options: 'i' }, companyid: companyId });

            if (!isExist) {
                const resp = await cityModel.create(data);
                if (resp) {
                    res.status(200).json({ status: 200, message: "Successfully Created", response: resp });
                } else {
                    res.status(200).json({ status: 400, message: "Not Created" });
                }
            } else {
                res.status(200).json({ status: 400, message: "Already Created" });
            }
        }
        else {
            res.status(200).json({ status: 400, message: "Only 50 Cities Allow" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.GetCitiesWithState = async (req, res) => {
    const companyId = mongoose.Types.ObjectId(req.userid);
    try {
        const lSkip = req.query.skip;

        if (req.query.stateId && lSkip) {
            const cityCount = await cityModel.countDocuments({ stateId: req.query.stateId, companyid: companyId });
            const city = await cityModel.find({ stateId: req.query.stateId, companyid: companyId }).populate('stateId').limit(20).skip((lSkip - 1) * 20);
            const paginationCount = Math.ceil(cityCount / 20);

            if (city) {
                return res.status(200).json({ status: 200, message: "All Cities", response: city, cityCount, paginationCount });
            } else {
                return res.status(200).json({ status: 400, message: "Empty" });
            }
        };

        if (lSkip && !req.query.stateId) {
            const cityCount = await cityModel.countDocuments({ companyid: companyId });
            const city = await cityModel.find({ companyid: companyId }).populate('stateId').limit(20).skip((lSkip - 1) * 20);
            const paginationCount = Math.ceil(cityCount / 20);

            if (city) {
                return res.status(200).json({ status: 200, message: "All Cities", response: city, cityCount, paginationCount });
            } else {
                return res.status(200).json({ status: 400, message: "Empty" });
            }
        };

        if (!lSkip && !req.query.stateId) {
            const cityCount = await cityModel.countDocuments({ companyid: companyId });
            const city = await cityModel.find({ companyid: companyId }).populate('stateId');

            if (city) {
                return res.status(200).json({ status: 200, message: "All Cities", response: city, cityCount });
            } else {
                return res.status(200).json({ status: 400, message: "Empty" });
            }
        }

    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.GetStateCity = async (req, res) => {
    try {
        const city = await cityModel.find({ stateId: req.query.stateId }).populate('stateId');
        if (city) {
            res.status(200).json({ status: 200, message: "All Cities", response: city })
        } else {
            res.status(200).json({ status: 400, message: "Empty" })
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.GetStateNameCity = async (req, res) => {
    try {
        const stateFind = await statesModel.findOne({ state: { $regex: req.query.stateId, $options: "i" } });
        const city = await cityModel.find({ stateId: stateFind._id }).populate('stateId');
        if (city) {
            res.status(200).json({ status: 200, message: "All Cities", response: city })
        } else {
            res.status(200).json({ status: 400, message: "Empty" })
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
};

exports.UpdateCity = async (req, res) => {
    const id = req.body.id;
    try {
        const data = { city: req.body.city, stateId: req.body.stateId };
        const update_resp = await cityModel.findByIdAndUpdate({ _id: id }, data, { new: true });
        if (update_resp) {
            res.status(200).json({ status: 200, message: "Successfully Updated", response: update_resp });
        } else {
            res.state(200).json({ status: 400, message: "Not Updated" })
        }
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
}

exports.DeleteCity = async (req, res) => {
    try {
        const resp = await cityModel.findByIdAndDelete({ _id: req.query.id });
        if (resp) {
            res.status(200).json({ status: 200, message: "Successfully Deleted", response: resp });
        } else {
            res.status(200).json({ status: 400, message: "Not Deleted" });
        }
    }
    catch (err) {
        res.status(400).json({ status: 400, response: err.message });
    }
}



