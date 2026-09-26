const jwt = require("jsonwebtoken");
const tokenBlacklistModel=require("../models/blacklist.model")
function authUser(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: "Token not provided."
        });
    }
const isTokenBlacklisted = tokenBlacklistModel.findOne({
    token
})
if (isTokenBlacklisted){
    return res.status(401).json({
        message:"token is invalid"
    })
}
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token"
        });
    }
}

module.exports = { authUser };