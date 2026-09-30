const applicationModel = require('../models/application.model');

const VALID_STATUSES = ['saved', 'applied', 'interviewing', 'offer', 'rejected'];

async function listApplicationsController(req, res) {
  const applications = await applicationModel
    .find({ userId: req.user.id })
    .sort({ updatedAt: -1 })
    .limit(100);
  return res.status(200).json({ applications });
}

async function createApplicationController(req, res) {
  const role = typeof req.body?.role === 'string' ? req.body.role.trim() : '';
  const company = typeof req.body?.company === 'string' ? req.body.company.trim() : '';
  const jobUrl = typeof req.body?.jobUrl === 'string' ? req.body.jobUrl.trim() : '';
  const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim() : '';
  const status = req.body?.status || 'saved';

  if (!role || !company) {
    return res.status(400).json({ message: 'Job title and company are required.' });
  }
  if (role.length > 160 || company.length > 160 || jobUrl.length > 2000 || notes.length > 3000) {
    return res.status(400).json({ message: 'One or more application fields exceed the allowed length.' });
  }
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Choose a valid application status.' });
  }
  if (jobUrl) {
    let parsedUrl;
    try {
      parsedUrl = new URL(jobUrl);
    } catch {
      return res.status(400).json({ message: 'Enter a valid job link.' });
    }
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || !parsedUrl.hostname) {
      return res.status(400).json({ message: 'Job link must be a valid HTTP or HTTPS address.' });
    }
  }

  const application = await applicationModel.create({
    userId: req.user.id,
    role,
    company,
    jobUrl,
    notes,
    status,
    appliedAt: status === 'saved' ? undefined : new Date()
  });

  return res.status(201).json({ application });
}

async function updateApplicationController(req, res) {
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Choose a valid application status.' });
  }

  const application = await applicationModel.findOne({ _id: req.params.id, userId: req.user.id });
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  application.status = status;
  if (status !== 'saved' && !application.appliedAt) application.appliedAt = new Date();
  await application.save();
  return res.status(200).json({ application });
}

async function deleteApplicationController(req, res) {
  const application = await applicationModel.findOneAndDelete({
    _id: req.params.id,
    userId: req.user.id
  });
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  return res.status(200).json({ message: 'Application removed.' });
}

module.exports = {
  listApplicationsController,
  createApplicationController,
  updateApplicationController,
  deleteApplicationController
};
