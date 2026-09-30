const { Router } = require('express');
const { authUser } = require('../middlewares/auth.middleware');
const { requireTrustedOrigin } = require('../middlewares/trusted-origin.middleware');
const {
  listApplicationsController,
  createApplicationController,
  updateApplicationController,
  deleteApplicationController
} = require('../controllers/application.controller');

const applicationRouter = Router();
applicationRouter.use(authUser);
applicationRouter.get('/', listApplicationsController);
applicationRouter.post('/', requireTrustedOrigin, createApplicationController);
applicationRouter.patch('/:id', requireTrustedOrigin, updateApplicationController);
applicationRouter.delete('/:id', requireTrustedOrigin, deleteApplicationController);

module.exports = applicationRouter;
