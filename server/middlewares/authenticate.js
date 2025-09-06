require("dotenv").config();
const jwt = require("jsonwebtoken");
const employeesModel = require("../models/employees.model");
const secrecKey = process.env.MONGO_SECRET_KEY;

const authenticate = async(req,res,next) => {
    try{
        const bearerHeader = req.headers.authorization;
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];
        const verifytoken = jwt.verify(token,secrecKey);

        const employee = await employeesModel.find({_id : verifytoken._id});

        if(!employee){
            throw new Error("User not found");
        }

        req.token = token;
        req.customer = employee;
        req.employeeid = verifytoken._id;

    }catch(err){
        res.status(400).json({message : "Unauthorized user"});
    }
};


module.exports = authenticate