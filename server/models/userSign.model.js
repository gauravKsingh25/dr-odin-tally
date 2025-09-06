const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");

const userSignin = mongoose.Schema({
    company: {
        type: String,
    },
    username : {
        type : String
    },
    email: {
        type: String,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        trim: true,
    },
    mobile : Number,
    gstNo : {
        type : String,
        trim : true
    },
    taxationId : {
        type : String,
        trim : true
    },
    logo : {
        type : String,
        trim : true
    },

    userRole: {
        type: mongoose.Schema.Types.ObjectId,
        ref : "role"
    },
    status : {
        type : Boolean,
        default : true
    },


    //---other---//
    name : {
        type : String,
        trim : true
    },
    phone : {
        type : String,
        trim : true
    },
    emailId : {
        type : String,
        trim : true
    }
},{
    timestamps : true
})


// userSignin.pre("save", async function(next){
//     if(this.isModified("password")){
//         this.password = await bcrypt.hash(this.password,12);
//     }
//     next();
// });


const secretkey = process.env.MONGO_SECRET_KEY;
//Generate Token
userSignin.methods.generateAuthtoken = async function(){
    try{
        let token = jwt.sign({_id : this._id},secretkey);
        //
        this.tokens = this.tokens = ({token:token});
        await this.save();
        return token;
    }catch(err){
        res.status(400).json({message : err});
    }
};

const user = mongoose.model('user', userSignin)
module.exports = user;