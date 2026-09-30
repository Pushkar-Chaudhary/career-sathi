
const { Router } = require("express");

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { requireTrustedOrigin } = require('../middlewares/trusted-origin.middleware');

const authRouter = Router();

authRouter.post(
    "/register",
    requireTrustedOrigin,
    authController.registerUserController
);

authRouter.post(
    "/login",
    requireTrustedOrigin,
    authController.loginUserController
);

authRouter.post("/logout", requireTrustedOrigin, authMiddleware.authUser, authController.logoutUserController);
authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController);

module.exports = authRouter;

