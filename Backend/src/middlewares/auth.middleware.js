const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');
const { hashSessionToken } = require('../utils/session-token');

async function authUser(req, res, next) {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            message: 'Token not provided.'
        });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return res.status(401).json({
            message: 'Invalid token'
        });
    }

    try {
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({
            $or: [
                { tokenHash: hashSessionToken(token) },
                { token }
            ]
        });

        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: 'Token is invalid'
            });
        }

        req.user = decoded;
        return next();
    } catch (err) {
        return next(err);
    }
}

module.exports = { authUser };
