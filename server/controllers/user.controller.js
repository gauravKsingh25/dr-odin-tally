const multer = require('multer');
const path = require('path');
const userModel = require('../models/user.model')

exports.getProfileDetails = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.userId })
        res.status(200).json(user);
    } catch (error) {
    }
};



exports.userBoard = (req, res) => {
    res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
    res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
    res.status(200).send("Moderator Content.");
};

// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, path.join(__dirname, '../../client/src/assets/upladed/'))
//     },
//     filename: async function(req, file, cb) {
//         let fileName = req.userId + file.originalname
//         cb(null, fileName)
//     }
// });
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../client/src/assets/uploaded/'));
    },
    filename: async function (req, file, cb) {
        try {
            let fileName = req.userId + file.originalname;
            cb(null, fileName);
        } catch (error) {
            cb(error);
        }
    }
});

exports.upload = multer({ storage: storage });



exports.upload = multer({ storage: storage })