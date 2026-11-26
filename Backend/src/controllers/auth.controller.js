
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const tokenBlacklistModel=require("../models/blacklist.model")
const { hashSessionToken } = require('../utils/session-token');
const { createHash, randomBytes } = require('node:crypto');
const { isEmailConfigured, sendPasswordResetEmail } = require('../services/email.service');

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_DURATION_MS = 30 * 60 * 1000;

function normalizeEmail(value) {
    return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function getSessionCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        secure: isProduction,
        sameSite: 'lax',
        path: '/',
        maxAge: SESSION_DURATION_MS
    };
}

function getFrontendOrigin() {
    const configured = (process.env.FRONTEND_URL || '').split(',').map((origin) => origin.trim()).find(Boolean);
    return configured || 'http://localhost:5173';
}

async function requestPasswordResetController(req, res) {
    const email = normalizeEmail(req.body?.email);
    const genericResponse = { message: 'If an account exists for that email, a password reset link will be sent shortly.' };
    if (!email || email.length > 254) return res.status(200).json(genericResponse);
    if (!isEmailConfigured()) {
        return res.status(503).json({ message: 'Password reset email is not configured yet. Please contact the site administrator.' });
    }

    let user;
    try {
        user = await userModel.findOne({ email });
        if (!user) return res.status(200).json(genericResponse);

        const token = randomBytes(32).toString('hex');
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const expiresAt = new Date(Date.now() + PASSWORD_RESET_DURATION_MS);
        await userModel.updateOne({ _id: user._id }, {
            $set: { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: expiresAt }
        });

        const resetUrl = new URL('/reset-password', getFrontendOrigin());
        resetUrl.searchParams.set('token', token);
        await sendPasswordResetEmail({ to: user.email, resetUrl: resetUrl.toString() });
        return res.status(200).json(genericResponse);
    } catch (error) {
        if (user?._id) {
            await userModel.updateOne(
                { _id: user._id },
                { $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 } }
            ).catch(() => {});
        }
        console.error('Password reset email could not be sent:', error?.message || 'unknown error');
        return res.status(200).json(genericResponse);
    }
}

async function resetPasswordController(req, res) {
    const token = typeof req.body?.token === 'string' ? req.body.token : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!/^[a-f0-9]{64}$/i.test(token)) {
        return res.status(400).json({ message: 'This reset link is invalid or has expired. Request a new one.' });
    }
    if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
        return res.status(400).json({ message: 'Password must be at least 8 characters and no more than 72 bytes.' });
    }

    try {
        const tokenHash = createHash('sha256').update(token).digest('hex');
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await userModel.findOneAndUpdate(
            { passwordResetTokenHash: tokenHash, passwordResetExpiresAt: { $gt: new Date() } },
            {
                $set: { password: passwordHash },
                $unset: { passwordResetTokenHash: 1, passwordResetExpiresAt: 1 },
                $inc: { authVersion: 1 }
            },
            { returnDocument: 'after' }
        );
        if (!user) return res.status(400).json({ message: 'This reset link is invalid or has expired. Request a new one.' });
        return res.status(200).json({ message: 'Your password has been reset. Sign in with your new password.' });
    } catch (error) {
        console.error('Password reset failed:', error?.name || 'Error', error?.code || 'unknown');
        return res.status(500).json({ message: 'Unable to reset your password right now. Please try again.' });
    }
}
// ==================== REGISTER ====================

async function registerUserController(req, res) {
    try {
        const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
        const email = normalizeEmail(req.body?.email);
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide all the information"
            });
        }
        if (username.length < 3 || username.length > 32 || !/^[\p{L}\p{N}_.-]+$/u.test(username)) {
            return res.status(400).json({ message: 'Username must be 3 to 32 characters and use only letters, numbers, dots, dashes, or underscores.' });
        }
        if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: 'Enter a valid email address.' });
        }
        if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({ message: 'Password must be at least 8 characters and no more than 72 bytes.' });
        }

        // Check if user already exists
        const isUserAlreadyExists = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserAlreadyExists) {
            return res.status(400).json({
                message: "Account already exists with this email or username"
            });
        }

        // Hash password
        const hash = await bcrypt.hash(password, 12);

        // Create user
        const user = await userModel.create({
            username,
            email,
            password: hash
        });

        // Create JWT
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                authVersion: user.authVersion || 0
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Store token in cookie
        res.cookie("token", token, getSessionCookieOptions());

        // Send response
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        if (error?.code === 11000) {
            return res.status(409).json({ message: 'Account already exists with this email or username.' });
        }
        console.error('Account registration failed:', error?.name || 'Error', error?.code || 'unknown');

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}


// ==================== LOGIN ====================

async function loginUserController(req, res) {
    try {
        const email = normalizeEmail(req.body?.email);
        const password = typeof req.body?.password === 'string' ? req.body.password : '';

        // Check required fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        // Find user
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: user._id,
                username: user.username,
                authVersion: user.authVersion || 0
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        // Store token in cookie
        res.cookie("token", token, getSessionCookieOptions());

        // Send response
        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Account sign-in failed:', error?.name || 'Error', error?.code || 'unknown');

        return res.status(500).json({
            message: "Something went wrong"
        });
    }
}
async function logoutUserController (req,res){
    const token = req.cookies?.token
    if(token){
        const decoded = jwt.decode(token);
        if (decoded?.exp) {
            const expiresAt = new Date(decoded.exp * 1000);
            if (expiresAt > new Date()) {
                await tokenBlacklistModel.create({
                    tokenHash: hashSessionToken(token),
                    expiresAt
                });
            }
        }
    }
    const clearOptions = getSessionCookieOptions();
    delete clearOptions.maxAge;
    res.clearCookie("token", clearOptions)
    res.status(200).json({
        message:"User logged out successfully"
    })
}
async function getMeController(req,res){
const user = await userModel.findById(req.user.id)
if (!user) return res.status(404).json({ message: 'Account not found.' });
res.status(200).json({
    message:"user details fetched successfully",
    user:{
        id: user._id,
        username:user.username,
        email:user.email
    }
})
}
// ==================== EXPORT ====================

module.exports = {
    registerUserController,
    loginUserController,
    requestPasswordResetController,
    resetPasswordController,
    logoutUserController,
    getMeController
};

