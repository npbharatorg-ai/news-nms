import 'dotenv/config';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Initialize nodemailer transporter with SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    logger.warn(`Email service verification failed: ${error.message}`);
  } else {
    logger.info('Email service verified and ready to send emails');
  }
});

/**
 * HTML template for news submission email to reporter
 */
const newsSubmissionTemplate = (reporter, news) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News Submission Confirmation</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .news-details { background-color: #f5f5f5; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
    .news-details p { margin: 10px 0; }
    .label { font-weight: bold; color: #667eea; }
    .button-group { text-align: center; margin: 30px 0; }
    .button { display: inline-block; padding: 12px 30px; margin: 0 10px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.3s; }
    .button:hover { background-color: #764ba2; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
    .footer a { color: #667eea; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📰 News Submission Received</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${reporter.name || 'Reporter'}</strong>,</p>
      <p>Thank you for submitting your news to NMS (News Management System). We have received your submission and it is now under review by our editorial team.</p>
      
      <div class="news-details">
        <p><span class="label">Title:</span> ${news.title || 'N/A'}</p>
        <p><span class="label">Category:</span> ${news.category || 'N/A'}</p>
        <p><span class="label">Status:</span> <strong>Under Review</strong></p>
        <p><span class="label">Submitted on:</span> ${new Date(news.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      <p>Our team will review your submission and notify you of the outcome within 24-48 hours. If approved, you will receive a reward for your contribution!</p>
      
      <div class="button-group">
        <a href="https://nms.news/dashboard" class="button">Go to Dashboard</a>
        <a href="https://nms.news/news/${news.id}" class="button">View News</a>
      </div>
      
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br><strong>NMS Editorial Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2024 News Management System. All rights reserved.</p>
      <p><a href="https://nms.news">Visit our website</a> | <a href="https://nms.news/contact">Contact Us</a></p>
    </div>
  </div>
</body>
</html>
`;

/**
 * HTML template for news submission email to admin
 */
const newsSubmissionAdminTemplate = (reporter, news) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New News Submission</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .news-details { background-color: #f5f5f5; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
    .news-details p { margin: 10px 0; }
    .label { font-weight: bold; color: #667eea; }
    .button-group { text-align: center; margin: 30px 0; }
    .button { display: inline-block; padding: 12px 30px; margin: 0 10px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.3s; }
    .button:hover { background-color: #764ba2; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📰 New News Submission</h1>
    </div>
    <div class="content">
      <p>A new news submission has been received and requires review.</p>
      
      <div class="news-details">
        <p><span class="label">Reporter:</span> ${reporter.name || 'Unknown'}</p>
        <p><span class="label">Reporter Email:</span> ${reporter.email || 'N/A'}</p>
        <p><span class="label">Reporter Phone:</span> ${reporter.phone || 'N/A'}</p>
        <p><span class="label">Title:</span> ${news.title || 'N/A'}</p>
        <p><span class="label">Category:</span> ${news.category || 'N/A'}</p>
        <p><span class="label">Description:</span> ${news.description || 'N/A'}</p>
        <p><span class="label">Submitted on:</span> ${new Date(news.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>
      
      <div class="button-group">
        <a href="https://nms.news/admin/submissions/${news.id}" class="button">Review Submission</a>
      </div>
      
      <p>Please review this submission and take appropriate action (approve/reject).</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 News Management System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * HTML template for news approved email
 */
const newsApprovedTemplate = (reporter, news, earnings = 0) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News Approved!</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .success-badge { text-align: center; font-size: 48px; margin: 20px 0; }
    .news-details { background-color: #f5f5f5; padding: 20px; border-left: 4px solid #38ef7d; margin: 20px 0; border-radius: 4px; }
    .news-details p { margin: 10px 0; }
    .label { font-weight: bold; color: #11998e; }
    .earnings-box { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .earnings-box .amount { font-size: 32px; font-weight: bold; margin: 10px 0; }
    .button-group { text-align: center; margin: 30px 0; }
    .button { display: inline-block; padding: 12px 30px; margin: 0 10px; background-color: #11998e; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.3s; }
    .button:hover { background-color: #38ef7d; color: #11998e; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
    .footer a { color: #11998e; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Your News Has Been Approved!</h1>
    </div>
    <div class="content">
      <div class="success-badge">✅</div>
      <p>Hello <strong>${reporter.name || 'Reporter'}</strong>,</p>
      <p>Great news! Your news submission has been approved by our editorial team and is now published on NMS.</p>
      
      <div class="news-details">
        <p><span class="label">Title:</span> ${news.title || 'N/A'}</p>
        <p><span class="label">Category:</span> ${news.category || 'N/A'}</p>
        <p><span class="label">Status:</span> <strong style="color: #38ef7d;">✓ Approved</strong></p>
        <p><span class="label">Approved on:</span> ${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
      
      ${earnings > 0 ? `
      <div class="earnings-box">
        <p>You have earned a reward for this submission!</p>
        <div class="amount">₹${earnings.toFixed(2)}</div>
        <p>This amount has been credited to your wallet.</p>
      </div>
      ` : ''}
      
      <p>Your news is now live and will be shared across our social media platforms to reach a wider audience. Thank you for your contribution to NMS!</p>
      
      <div class="button-group">
        <a href="https://nms.news/news/${news.id}" class="button">View Published News</a>
        <a href="https://nms.news/dashboard" class="button">Go to Dashboard</a>
      </div>
      
      <p>Keep submitting quality news to earn more rewards!</p>
      <p>Best regards,<br><strong>NMS Editorial Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2024 News Management System. All rights reserved.</p>
      <p><a href="https://nms.news">Visit our website</a> | <a href="https://nms.news/contact">Contact Us</a></p>
    </div>
  </div>
</body>
</html>
`;

/**
 * HTML template for news rejected email
 */
const newsRejectedTemplate = (reporter, news, comments = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>News Submission Needs Revision</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .news-details { background-color: #f5f5f5; padding: 20px; border-left: 4px solid #f5576c; margin: 20px 0; border-radius: 4px; }
    .news-details p { margin: 10px 0; }
    .label { font-weight: bold; color: #f5576c; }
    .comments-box { background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px; }
    .comments-box h3 { margin-top: 0; color: #856404; }
    .comments-box p { margin: 10px 0; color: #856404; }
    .button-group { text-align: center; margin: 30px 0; }
    .button { display: inline-block; padding: 12px 30px; margin: 0 10px; background-color: #f5576c; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; transition: background-color 0.3s; }
    .button:hover { background-color: #f093fb; }
    .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; margin-top: 20px; }
    .footer a { color: #f5576c; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📝 Your News Submission Needs Revision</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${reporter.name || 'Reporter'}</strong>,</p>
      <p>Thank you for submitting your news to NMS. After careful review by our editorial team, we found that your submission needs some revisions before it can be published.</p>
      
      <div class="news-details">
        <p><span class="label">Title:</span> ${news.title || 'N/A'}</p>
        <p><span class="label">Category:</span> ${news.category || 'N/A'}</p>
        <p><span class="label">Status:</span> <strong style="color: #f5576c;">⚠ Needs Revision</strong></p>
      </div>
      
      ${comments ? `
      <div class="comments-box">
        <h3>📋 Editorial Comments:</h3>
        <p>${comments}</p>
      </div>
      ` : ''}
      
      <p>Please review the feedback above and make the necessary changes to your submission. Once revised, you can resubmit your news for another review.</p>
      
      <div class="button-group">
        <a href="https://nms.news/news/${news.id}/edit" class="button">Edit News</a>
        <a href="https://nms.news/dashboard" class="button">Go to Dashboard</a>
      </div>
      
      <p>If you have any questions about the feedback, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br><strong>NMS Editorial Team</strong></p>
    </div>
    <div class="footer">
      <p>&copy; 2024 News Management System. All rights reserved.</p>
      <p><a href="https://nms.news">Visit our website</a> | <a href="https://nms.news/contact">Contact Us</a></p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send news submission email to reporter
 * @param {Object} reporter - Reporter object with name and email
 * @param {Object} news - News object with title, description, category, etc.
 */
export const sendNewsSubmissionEmail = async (reporter, news) => {
  try {
    if (!reporter || !reporter.email) {
      logger.warn('Cannot send submission email: reporter or reporter.email is missing');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: reporter.email,
      subject: 'Your news has been submitted for review',
      html: newsSubmissionTemplate(reporter, news),
    };

    await transporter.sendMail(mailOptions);
    logger.info(`News submission email sent to ${reporter.email}`);
  } catch (error) {
    logger.error(`Failed to send news submission email to ${reporter.email}: ${error.message}`);
  }
};

/**
 * Send news submission email to admin
 * @param {Object} reporter - Reporter object with name and email
 * @param {Object} news - News object with title, description, category, etc.
 */
export const sendNewsSubmissionAdminEmail = async (reporter, news) => {
  try {
    const adminEmail = process.env.SMTP_FROM || 'info@nms.news';

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: adminEmail,
      subject: `New news submission from ${reporter.name || 'Unknown Reporter'}`,
      html: newsSubmissionAdminTemplate(reporter, news),
    };

    await transporter.sendMail(mailOptions);
    logger.info(`News submission admin email sent to ${adminEmail}`);
  } catch (error) {
    logger.error(`Failed to send news submission admin email: ${error.message}`);
  }
};

/**
 * Send news approved email to reporter
 * @param {Object} reporter - Reporter object with name and email
 * @param {Object} news - News object with title, description, category, etc.
 * @param {number} earnings - Amount earned for this news (optional)
 */
export const sendNewsApprovedEmail = async (reporter, news, earnings = 0) => {
  try {
    if (!reporter || !reporter.email) {
      logger.warn('Cannot send approval email: reporter or reporter.email is missing');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: reporter.email,
      subject: 'Your news has been approved! 🎉',
      html: newsApprovedTemplate(reporter, news, earnings),
    };

    await transporter.sendMail(mailOptions);
    logger.info(`News approved email sent to ${reporter.email}`);
  } catch (error) {
    logger.error(`Failed to send news approved email to ${reporter.email}: ${error.message}`);
  }
};

/**
 * Send news rejected email to reporter
 * @param {Object} reporter - Reporter object with name and email
 * @param {Object} news - News object with title, description, category, etc.
 * @param {string} comments - Admin comments on why the news was rejected
 */
export const sendNewsRejectedEmail = async (reporter, news, comments = '') => {
  try {
    if (!reporter || !reporter.email) {
      logger.warn('Cannot send rejection email: reporter or reporter.email is missing');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: reporter.email,
      subject: 'Your news submission needs revision',
      html: newsRejectedTemplate(reporter, news, comments),
    };

    await transporter.sendMail(mailOptions);
    logger.info(`News rejected email sent to ${reporter.email}`);
  } catch (error) {
    logger.error(`Failed to send news rejected email to ${reporter.email}: ${error.message}`);
  }
};