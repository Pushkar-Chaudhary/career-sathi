
const { Router } = require("express");

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireTrustedOrigin } = require('../middlewares/trusted-origin.middleware');
const { createRateLimit } = require('../middlewares/ai-rate-limit.middleware');
const { createHash } = require('node:crypto');

const authRouter = Router();
const clientKey = (req) => createHash('sha256').update(req.ip || 'unknown').digest('hex');
const limitLoginAttempts = createRateLimit({
    action: 'auth-login',
    keyFromRequest: clientKey,
    maxRequests: 10,
    windowMs: 15 * 60 * 1000,
    message: 'Too many sign-in attempts. Please wait before trying again.'
});
const limitRegistrations = createRateLimit({
    action: 'auth-register',
    keyFromRequest: clientKey,
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
    message: 'Too many account creation attempts. Please try again later.'
});

authRouter.post(
    "/register",
    requireTrustedOrigin,
    limitRegistrations,
    authController.registerUserController
);

authRouter.post(
    "/login",
    requireTrustedOrigin,
    limitLoginAttempts,
    authController.loginUserController
);

authRouter.post("/logout", requireTrustedOrigin, authMiddleware.authUser, authController.logoutUserController);
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController);

module.exports = authRouter;

