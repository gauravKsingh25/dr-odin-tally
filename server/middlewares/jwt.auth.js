const jwt = require('jsonwebtoken');
const dotenv = require('dotenv').config();


const accessToken = (userId) => {

    return new Promise((resolve, reject) => {

        const payload = {
            aud: userId
        };

        const options = {
            issuer: "dr_odin",
            expiresIn: "1d",
        };

        const secret = `$2a$08$hVQ5qjUJSzg6o.k31s8jA.FLHl4FHcEm1jZ6OBMhQu8pUB0UODFkC`;
        jwt.sign(payload, secret, options, (err, token) => {
            if (err) reject(err)
            resolve(token)
        })
    })
}


const verifyToken = async (req, res, next) => {

    try {
        let token = req.headers.authorization;
        if (token) {
            token = token.split(" ")[1];
            let user = jwt.verify(token, `$2a$08$hVQ5qjUJSzg6o.k31s8jA.FLHl4FHcEm1jZ6OBMhQu8pUB0UODFkC`);
            req.userid = user.aud._id;
        } else {
            res.status(400).json({ message: "Unauthorized User" });
        }
        next();
    } catch (err) {
        res.status(400).json({ message: "Unauthorized User" });
    }
    // try {    
    //     const headerTokn = req.headers['authorization'];
    //     if (!headerTokn || headerTokn === undefined) {
    //         return res.status(401).json({ message: 'jwt token is required' });
    //     }

    //     const bearerToken = headerTokn.split(' ');
    //     const token = bearerToken[1];

    //     jwt.verify(token, `$2a$08$hVQ5qjUJSzg6o.k31s8jA.FLHl4FHcEm1jZ6OBMhQu8pUB0UODFkC`, (err, user) => {
    //         if (err) throw new Error(err.message)
    //         req.user = user.aud;
    //     })
    //     next();
    // } catch (error) {
    //     res.status(404).json({ message: error.message });

    // }
}


const verifyAdmin = async (req, res, next) => {
    try {
        verifyToken(req, res, () => {
            if (req.user.isAdmin === true) {
                next()
            } else {
                res.status(403).json({ message: "not allowed to do that" })
            }
        })
    } catch (error) {
        res.status(404).json({ message: error.message })

    }
}


const refreshTken = (userId) => {
    return new Promise((resolve, reject) => {
        const payload = {
            aud: userId
        };
        const secret = process.env.SECRET_REFRESH_TOKEN;
        const options = {
            issuer: 'dr_odin',
            expiresIn: '1d'
        };
        jwt.sign(payload, secret, options, (err, token) => {
            if (err) reject(err);
            resolve(token);
        })
    })
}


const verifyRefreahToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        jwt.verify(refreshToken, process.env.SECRET_REFRESH_TOKEN, (err, payload) => {
            if (err) reject(err);
            const userid = payload.aud;
            resolve(userid);
        })
    })
}



module.exports = { accessToken, verifyToken, refreshTken, verifyRefreahToken, verifyAdmin }