const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

// HTML-only emails (no text/plain part) are a well-known spam-score signal,
// and none of the template call sites ever pass `text` explicitly. Rather
// than touch every call site, derive a plain-text part from the HTML here
// so every outgoing email gets one automatically.
const htmlToText = (html) =>
  html.
  replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').
  replace(/<br\s*\/?>/gi, '\n').
  replace(/<\/(p|div|tr|h[1-6]|table)>/gi, '\n').
  replace(/<[^>]+>/g, '').
  replace(/&nbsp;/g, ' ').
  replace(/&middot;/g, '·').
  replace(/&rarr;/g, '->').
  replace(/&times;/g, 'x').
  replace(/&amp;/g, '&').
  replace(/[ \t]+/g, ' ').
  replace(/\n{3,}/g, '\n\n').
  trim();

/**
 * Sends a transactional email. Failures are logged but never thrown up to
 * the caller so a broken mail server can't block booking/payment flows.
 * Reply-To is pointed at the monitored company inbox (rather than the
 * no-reply sending address) so replies land somewhere a human reads them —
 * spam filters also weight a real, reachable Reply-To favorably.
 */
const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  try {
    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      replyTo: env.COMPANY.email || env.EMAIL_FROM,
      subject,
      html,
      text: text || (html ? htmlToText(html) : undefined),
      attachments,
    });
    logger.info(`Email sent to ${to}: ${subject}`);
  } catch (err) {
    logger.error(`Failed to send email to ${to}: ${err.message}`);
  }
};

module.exports = { sendEmail };
