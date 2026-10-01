const interviewReportModel = require('../models/interviewReport.model');
const { generateInterviewReport, generateResumeDraft, answerCareerAssistant } = require('../services/ai.service');

const INPUT_LIMITS = {
  jobDescription: 20000,
  resume: 20000,
  selfDescription: 5000
};

const RESUME_LIMITS = {
  name: 120,
  email: 250,
  phone: 80,
  location: 120,
  targetRole: 160,
  experience: 12000,
  education: 4000,
  skills: 3000,
  jobDescription: 12000
};

function getText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

async function createInterviewReportController(req, res) {
  const jobDescription = getText(req.body?.jobDescription);
  const resume = getText(req.body?.resume);
  const selfDescription = getText(req.body?.selfDescription);
  const consentToAI = req.body?.consentToAI === true;

  if (!jobDescription || !resume) {
    return res.status(400).json({
      message: 'Add both the job description and your resume to create a report.'
    });
  }
  if (!consentToAI) {
    return res.status(400).json({ message: 'Confirm you are at least 18 and agree to send your report inputs to Google Gemini.' });
  }

  if (jobDescription.length > INPUT_LIMITS.jobDescription || resume.length > INPUT_LIMITS.resume || selfDescription.length > INPUT_LIMITS.selfDescription) {
    return res.status(400).json({
      message: 'Input is too long. Maximum lengths: job description 20,000, resume 20,000, self-description 5,000 characters.'
    });
  }

  let generated;
  try {
    generated = await generateInterviewReport({ jobDescription, resume, selfDescription });
  } catch (error) {
    return aiErrorResponse(res, 'Gemini interview report', error);
  }

  try {
    const report = await interviewReportModel.create({
      userId: req.user.id,
      jobDescription,
      resume,
      selfDescription,
      aiConsentAt: new Date(),
      ...generated
    });

    return res.status(201).json({ report });
  } catch (error) {
    console.error('Generated report could not be saved:', error);
    return res.status(500).json({
      message: 'Gemini created the report, but it could not be saved. Please try again.'
    });
  }
}

async function getInterviewReportsController(req, res) {
  try {
    const reports = await interviewReportModel
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('jobDescription matchScore summary technicalQuestions behavioralQuestions skillGaps preparationPlan createdAt');

    return res.status(200).json({ reports });
  } catch (error) {
    console.error('Interview report history lookup failed:', error);
    return res.status(500).json({ message: 'Could not load report history.' });
  }
}

async function deleteInterviewReportController(req, res) {
  try {
    const report = await interviewReportModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!report) return res.status(404).json({ message: 'Report not found.' });
    return res.status(200).json({ message: 'Report removed.' });
  } catch (error) {
    console.error('Interview report deletion failed:', error);
    return res.status(400).json({ message: 'Could not remove this report.' });
  }
}

function aiErrorResponse(res, feature, error) {
  const status = Number.isInteger(error.status) ? error.status : 502;
  const isNotConfigured = error.code === 'AI_NOT_CONFIGURED';
  const message = isNotConfigured
    ? 'Gemini is not configured on this API server. For local development, restart the backend after checking Backend/.env. For deployment, set GOOGLE_GENAI_API_KEY in the backend host environment and restart it.'
    : status === 503
      ? 'Gemini is temporarily unavailable. Please try again shortly.'
      : status === 429
        ? 'Gemini is receiving too many requests right now. Please try again shortly.'
        : 'Gemini could not complete this request. Please review your input and try again.';

  console.error(`${feature} generation failed (status ${status}, code ${error.code || 'UNKNOWN'}).`);
  return res.status(status).json({ message });
}

async function createResumeDraftController(req, res) {
  const profile = {};
  for (const field of Object.keys(RESUME_LIMITS)) profile[field] = getText(req.body?.[field]);

  if (!profile.targetRole || (!profile.experience && !profile.education && !profile.skills)) {
    return res.status(400).json({ message: 'Add a target role and at least some experience, education, or skills.' });
  }
  if (req.body?.consentToAI !== true) {
    return res.status(400).json({ message: 'Confirm you are at least 18 and agree to send these details to Google Gemini.' });
  }
  if (Object.entries(RESUME_LIMITS).some(([field, maxLength]) => profile[field].length > maxLength)) {
    return res.status(400).json({ message: 'One or more fields are too long. Shorten your details and try again.' });
  }

  profile.contact = [profile.name, profile.email, profile.phone, profile.location].filter(Boolean).join(' | ');
  try {
    const resumeDraft = await generateResumeDraft(profile);
    return res.status(200).json({ resumeDraft });
  } catch (error) {
    return aiErrorResponse(res, 'Gemini resume draft', error);
  }
}

async function answerCareerAssistantController(req, res) {
  const messages = req.body?.messages;
  if (!Array.isArray(messages) || messages.length < 1 || messages.length > 12) {
    return res.status(400).json({ message: 'Send a recent conversation with up to 12 messages.' });
  }
  const cleanMessages = messages.map((message) => ({
    role: message?.role,
    content: getText(message?.content)
  }));
  if (cleanMessages.some(({ role, content }) => !['user', 'assistant'].includes(role) || !content || content.length > 1500)
      || cleanMessages.at(-1)?.role !== 'user'
      || cleanMessages.reduce((total, message) => total + message.content.length, 0) > 8000) {
    return res.status(400).json({ message: 'The conversation is invalid or too long. Start a new chat and try again.' });
  }
  if (req.body?.consentToAI !== true) {
    return res.status(400).json({ message: 'Confirm you are at least 18 and agree to send your question to Google Gemini.' });
  }

  try {
    const answer = await answerCareerAssistant(cleanMessages);
    return res.status(200).json({ answer });
  } catch (error) {
    return aiErrorResponse(res, 'Gemini career guide', error);
  }
}

module.exports = {
  createInterviewReportController,
  getInterviewReportsController,
  deleteInterviewReportController,
  createResumeDraftController,
  answerCareerAssistantController,
  aiErrorResponse
};
