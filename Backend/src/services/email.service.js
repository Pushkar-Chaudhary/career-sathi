const nodemailer = require('nodemailer');

function isEmailConfigured() {
  return ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM']
    .every((key) => Boolean(process.env[key]?.trim()));
}

function createTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !process.env.EMAIL_FROM) {
    throw new Error('Password reset email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM.');
  }

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid port number.');
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  });
}

async function sendPasswordResetEmail({ to, resetUrl }) {
  const transport = createTransport();
  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your Career Sathi password',
    text: `We received a request to reset your Career Sathi password. Open this link within 30 minutes to choose a new password:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>We received a request to reset your Career Sathi password.</p><p><a href="${resetUrl}">Choose a new password</a></p><p>This link expires in 30 minutes and can only be used once. If you did not request this, you can ignore this email.</p>`
  });
}

module.exports = { isEmailConfigured, sendPasswordResetEmail };
