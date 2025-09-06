const mongoose = require("mongoose");


//@ Schema for EmployeesInfo
const employeeSchema = mongoose.Schema({
    empId : {
        type : String,
        required : true,
    },
    empName : {
        type : String,
        required : true,
        trim : true
    },
    designation : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "designation",
        required : true
    },
    rmId:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "employeeInfo"
    },
    rm : {
        type : String,
        trim : true
    },
    doj : {
        type : String,
        trim : true
    },
    zoneId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Zone"
    },
    city : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "City"
        },
    state:{
        type : mongoose.Schema.Types.ObjectId,
        ref : "State"
        },
    status : {
        type : Boolean,
        default : true
    },
    mnthtarget : {
        type : Number,
    },
    yrlytarget : {
        type : Number,
    },
    empLeftDate:{
       type : String,
        trim : true
    },
    companyid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user"
    },
    monthsTarget : [
        {
            monthid : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "month"
            },
            mtarget : Number
        }
    ],
    totalAmount : {
        type : String
    },
    achivement : {
        type : Number
    },
    expenses : {
        type : String
    },
    ctc : {
        type : Number
    },
    totExpns : {
        type : Number
    },
    percent : {
        type : Number
    },
    color : String,
    sort:Number
},{
    timestamps:true
});

const employeeInfo = mongoose.model("employeeInfo",employeeSchema);
module.exports = employeeInfo;;