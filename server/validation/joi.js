const joi = require('joi');

const validate = joi.object({
    username: joi.string().required(),
    email: joi.string().required().email(),
    password: joi.string().required()

})

module.exports = { validate }