const { validate } = require('../validation/joi');
const userModel = require('../models/userSign.model');
const { accessToken } = require('../middlewares/jwt.auth');
const bcrypt = require('bcryptjs');
const userRoleModel = require("../models/role.model");
const fs = require("fs");
const path = require('path');


//--------------------- Admin ------------------------

const register = async (req, res) => {
    try {

        const result = await validate.validateAsync(req.body);
        const findMail = await userModel.findOne({ email: result.email });
        if (findMail) {
            return res.status(200).json({ status: 401, message: "Already Exists" });
        }
        // Hashed Password
        const hashedPassword = await bcrypt.hash(result.password, 12);

        const user = await userModel({
            username: result.username,
            email: result.email,
            password: hashedPassword
        });

        const userSaved = await user.save();

        return res.status(200).json({ status: 200, response: userSaved });

    } catch (error) {
        res.status(400).json({ status: 400, message: error.message });
    }
}

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        let existingUser = await userModel.findOne({ email: email });
        if (!existingUser) {
            return res.status(200).json({ status: 401, message: "User Not Found" });
        }

        // Match Password
        let matchPassword = await bcrypt.compare(password, existingUser.password);

        if (!matchPassword) {
            return res.status(200).json({ status: 401, message: "Invalid Password" });
        }
        //
        if (existingUser && matchPassword) {
            const accesstoken = await accessToken(existingUser);
            return res.status(200).json({ status: 200, message: 'logged successfully', accessToken: accesstoken });
        } else {
          return  res.status(200).json({ status: 401, message: 'User Not Found' });
        }

    } catch (error) {
        res.status(400).json({ status: 400, message: error.message })
    }
}

const userValidate = async (req, res) => {
    try {
        const validUser = await userModel.findById({ _id: req.userid });
        res.status(200).json({ status: 200, message: "Authorized", response: validUser });
    } catch (err) {
        res.status(400).json({ status: 400, response: err.message })
    }
}

//--------------------- Company ----------------------

const CreateCompany = async (req, res) => {
    const data = req.body;

    try {

        const emailExist = await userModel.findOne({ email: { $regex: data.email, $options: "i" } });
        if (emailExist) {   //check email
            return res.status(200).json({ status: 401, message: "Company Email Already Exists" });
        }

        const userNameExist = await userModel.findOne({ username: { $regex: data.username, $options: "i" } });
        if (userNameExist) {    //check username
            return res.status(200).json({ status: 401, message: "Company Username Already Exists" });
        } else {
            const roleId = await userRoleModel.findOne({ name: "company" });
            // Hashed Password
            const hashedPassword = await bcrypt.hash(data.password, 12);

            const company = await userModel({
                company: data.company,
                username: data.username,
                mobile: data.mobile,
                email: data.email,
                password: hashedPassword,
                userRole: roleId._id,
                gstNo: data.gstNo,
                taxationId: data.taxationId,
                logo: req.file.filename,
                //optional fields
                name: data.name,
                phone: data.phone || '',
                emailId: data.emailId
            });

            const companySaved = await company.save();
            if (companySaved) {
                res.status(200).json({ status: 200, message: "Successfully Created", response: companySaved });
            } else {
                res.status(200).json({ status: 401, message: "Not Created", response: companySaved });
            }
        }

    } catch (err) {
        res.status(400).json({ status: 400, message: err.message });
    }
};

const UpdateCompany = async (req, res) => {
    const data = req.body;
    let company;
    try {
        const emailExist = await userModel.findOne({ email: { $regex: data.email, $options: "i" } });
        if (emailExist && emailExist._id != req.body.cid) {   //check email exists or not
            return res.status(200).json({ status: 401, message: "Company already exists with this email id" });
        }

        const userNameExist = await userModel.findOne({ username: { $regex: data.username, $options: "i" } });
        if (userNameExist && userNameExist.username != req.body.username) {    //check username exists or not
            return res.status(200).json({ status: 401, message: "Company  already exists with this username" });
        }


        if (req.body.cid && req.body.status == undefined) {

            const roleId = await userRoleModel.findOne({ name: "company" });
            // Hashed Password
            const hashedPassword = await bcrypt.hash(data.password, 12);

            if (req.file) {
                company = {
                    company: data.company,
                    username: data.username,
                    mobile: data.mobile,
                    email: data.email,
                    password: hashedPassword,
                    userRole: roleId._id,
                    gstNo: data.gstNo,
                    taxationId: data.taxationId,
                    logo: req.file.filename,
                    //optional fields
                    name: data.name,
                    phone: data.phone,
                    emailId: data.emailId
                };
            } else {
                company = {
                    company: data.company,
                    username: data.username,
                    mobile: data.mobile,
                    email: data.email,
                    password: hashedPassword,
                    userRole: roleId._id,
                    gstNo: data.gstNo,
                    taxationId: data.taxationId,
                    //optional fields
                    name: data.name,
                    phone: data.phone,
                    emailId: data.emailId
                };
            }

            // Delete previous logo
            if (req.file) {
                const isLogo = await userModel.findById({ _id: data.cid });
                const logoPath = path.join(__dirname, "../uploads", isLogo.logo);
                if (isLogo.logo) {
                    fs.unlink(logoPath, (err) => {
                        if (err) {
                            return res.status(200).json({ status: 401, message: err.message + "Logo not exist" });
                        }
                    });
                }
            }

            const update_company = await userModel.findByIdAndUpdate({ _id: data.cid }, company, { new: true });
            if (update_company) {
                return res.status(200).json({ status: 200, message: "Successfully Updated", response: update_company });
            } else {
                return res.status(200).json({ status: 401, message: "Not Updated" });
            }
        }

        // status update Active/Inactive
        if (req.body.status == true || req.body.status == false) {
            let obj = { status: req.body.status }
            const update_status = await userModel.findByIdAndUpdate({ _id: req.body.cid }, obj, { new: true });
            if (update_status) {
                res.status(200).json({ status: 200, message: "Status Update", response: update_status });
            } else {
                res.status(200).json({ status: 401, message: "Not Updated" });
            }
        }

    } catch (err) {
        res.status(400).json({ status: 400, message: err.message });
    }
};

const GetCompany = async (req, res) => {

    const active = req.query.active;
    let get_resp;
    let activeCount;

    try {
        if (active == 1) {
            get_resp = await userModel.aggregate([{ $match: { username: { $ne: "admin" }, status: { $eq: true } } }, { $project: { _id: 1, company: 1, username: 1, email: 1, gstNo: 1, taxationId: 1, status: 1, mobile: 1, logo: { $concat: ["http://103.185.212.115:7010/uploads/", "$logo"] }, name: 1, phone: 1, emailId: 1, password: 1 } }]);
            activeCount = get_resp.length;
        } else if (active == 0) {
            get_resp = await userModel.aggregate([{ $match: { username: { $ne: "admin" }, status: { $eq: false } } }, { $project: { _id: 1, company: 1, username: 1, email: 1, gstNo: 1, taxationId: 1, status: 1, mobile: 1, logo: { $concat: ["http://103.185.212.115:7010/uploads/", "$logo"] }, name: 1, phone: 1, emailId: 1, password: 1 } }]);
        }

        //Count 
        const companyCount = await userModel.countDocuments({ username: { $ne: "admin" } });

        if (get_resp) {
            res.status(200).json({ status: 200, message: "Companies List", response: get_resp, companyCount, activeCount });
        } else {
            res.status(200).json({ status: 401, message: "Not Found", response: get_resp });
        }

    } catch (err) {
        res.status(400).json({ status: 400, message: err.message });
    }
};

const CompanyLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        let isExist = await userModel.findOne({ username: username });

        if (!isExist) {
            return res.status(200).json({ status: 401, message: "User Not Found" });
        }
        // Match Password
        let matchPassword = await bcrypt.compare(password, isExist.password);

        if (!matchPassword) {
            return res.status(200).json({ status: 401, message: "Invalid Password" });
        }
        //
        let tokenCrdsal = {
            _id: isExist._id,
            username: isExist.username,
            email: isExist.email
        }

        if (isExist.status == true && matchPassword) {
            const accesstoken = await accessToken(tokenCrdsal);
            return res.status(200).json({ status: 200, message: 'Logged Successfully', accessToken: accesstoken });
        } else if (isExist.status == false && matchPassword) {
            return res.status(200).json({ status: 401, message: 'Company is Inactive' });
        } else {
          return  res.status(200).json({ status: 401, message: 'User Not Found' });
        }
    } catch (err) {
        res.status(400).json({ status: 400, message: err.message });
    }
};

// User Role
const CreateUserRole = async (req, res) => {
    try {
        const resp = await userRoleModel.create(req.body);
        if (resp) {
            res.status(200).json({ status: 200, message: "Successfully Created", response: resp });
        } else {
            res.status(200).json({ status: 401, message: "Not Created", response: resp });
        }
    } catch (err) {
        res.status(400).json({ status: 400, message: err.message });
    }
};

module.exports = { register, login, userValidate, CreateCompany, GetCompany, CreateUserRole, UpdateCompany, CompanyLogin }