const { Router } = require('express');
const {
  createInterviewReportController,
  getInterviewReportsController,
  deleteInterviewReportController,
  createResumeDraftController,
  answerCareerAssistantController
} = require('../controllers/ai.controller');
const { authUser } = require('../middlewares/auth.middleware');
const { requireTrustedOrigin } = require('../middlewares/trusted-origin.middleware');
const { limitResumeDrafts, limitCareerGuide } = require('../middlewares/ai-rate-limit.middleware');

const aiRouter = Router();

aiRouter.use(authUser);
aiRouter.get('/reports', getInterviewReportsController);
aiRouter.post('/reports', requireTrustedOrigin, createInterviewReportController);
aiRouter.delete('/reports/:id', requireTrustedOrigin, deleteInterviewReportController);
aiRouter.post('/resume-draft', requireTrustedOrigin, limitResumeDrafts, createResumeDraftController);
aiRouter.post('/assistant', requireTrustedOrigin, limitCareerGuide, answerCareerAssistantController);

module.exports = aiRouter;
