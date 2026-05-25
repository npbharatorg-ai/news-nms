import 'dotenv/config';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

// Initialize nodemailer transporter with SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
  if (error) {
    logger.warn(`Registration email service verification failed: ${error.message}`);
  } else {
    logger.info('Registration email service verified and ready to send emails');
  }
});

/**
 * HTML template for registration confirmation email
 */
const registrationConfirmationTemplate = (registration, userId) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Confirmation</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .success-badge { text-align: center; font-size: 48px; margin: 20px 0; }
    .details-box { background-color: #f5f5f5; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; border-radius: 4px; }
    .details-box p { margin: 10px 0; }
    .label { font-weight: bold; color: #667eea; }
    .user-id-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .user-id-box .id { font-size: 28px; font-weight: bold; margin: 10px 0; font-family: monospace; }
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
      <h1>✅ Registration Successful!</h1>
    </div>
    <div class="content">
      <div class="success-badge">🎉</div>
      <p>Hello <strong>${registration.full_name}</strong>,</p>
      <p>Congratulations! Your registration with NMS (News Management System) has been successfully completed and your payment has been verified.</p>
      
      <div class="user-id-box">
        <p>Your NMS Reporter User ID:</p>
        <div class="id">${userId}</div>
        <p style="font-size: 12px; margin-top: 10px;">Please save this ID for future reference</p>
      </div>
      
      <div class="details-box">
        <p><span class="label">Name:</span> ${registration.full_name}</p>
        <p><span class="label">Email:</span> ${registration.email}</p>
        <p><span class="label">Phone:</span> ${registration.phone_number}</p>
        <p><span class="label">Status:</span> <strong style="color: #667eea;">✓ Active</strong></p>
      </div>
      
      <p>You can now log in to your NMS account and start submitting news stories. Your contributions will be reviewed by our editorial team and you'll earn rewards for approved submissions.</p>
      
      <div class="button-group">
        <a href="https://nms.news/login" class="button">Login to Dashboard</a>
        <a href="https://nms.news/submit-news" class="button">Submit News</a>
      </div>
      
      <p><strong>Next Steps:</strong></p>
      <ul>
        <li>Complete your profile with additional details</li>
        <li>Review our news submission guidelines</li>
        <li>Start submitting quality news stories</li>
        <li>Earn rewards for approved submissions</li>
      </ul>
      
      <p>If you have any questions, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br><strong>NMS Team</strong></p>
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
 * HTML template for approval email
 */
const approvalTemplate = (registration, userId) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Approved</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .success-badge { text-align: center; font-size: 48px; margin: 20px 0; }
    .details-box { background-color: #f5f5f5; padding: 20px; border-left: 4px solid #38ef7d; margin: 20px 0; border-radius: 4px; }
    .details-box p { margin: 10px 0; }
    .label { font-weight: bold; color: #11998e; }
    .user-id-box { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .user-id-box .id { font-size: 28px; font-weight: bold; margin: 10px 0; font-family: monospace; }
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
      <h1>✅ Registration Approved!</h1>
    </div>
    <div class="content">
      <div class="success-badge">🎉</div>
      <p>Hello <strong>${registration.full_name}</strong>,</p>
      <p>Great news! Your registration with NMS has been approved by our admin team. Your account is now fully activated and ready to use.</p>
      
      <div class="user-id-box">
        <p>Your NMS Reporter User ID:</p>
        <div class="id">${userId}</div>
        <p style="font-size: 12px; margin-top: 10px;">Use this ID for all your submissions</p>
      </div>
      
      <div class="details-box">
        <p><span class="label">Name:</span> ${registration.full_name}</p>
        <p><span class="label">Email:</span> ${registration.email}</p>
        <p><span class="label">Status:</span> <strong style="color: #38ef7d;">✓ Approved</strong></p>
      </div>
      
      <p>You can now access all features of your NMS Reporter account and start submitting news stories immediately.</p>
      
      <div class="button-group">
        <a href="https://nms.news/dashboard" class="button">Go to Dashboard</a>
        <a href="https://nms.news/submit-news" class="button">Submit News</a>
      </div>
      
      <p>Thank you for joining the NMS community. We look forward to your contributions!</p>
      <p>Best regards,<br><strong>NMS Admin Team</strong></p>
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
 * HTML template for rejection email
 */
const rejectionTemplate = (registration, reason = '') => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Registration Status Update</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; }
    .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { background-color: white; padding: 30px; border-radius: 0 0 8px 8px; }
    .details-box { background-color: #f5f5f5; padding: 20px; border-left: 4px solid #f5576c; margin: 20px 0; border-radius: 4px; }
    .details-box p { margin: 10px 0; }
    .label { font-weight: bold; color: #f5576c; }
    .reason-box { background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107; margin: 20px 0; border-radius: 4px; }
    .reason-box h3 { margin-top: 0; color: #856404; }
    .reason-box p { margin: 10px 0; color: #856404; }
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
      <h1>⚠️ Registration Status Update</h1>
    </div>
    <div class="content">
      <p>Hello <strong>${registration.full_name}</strong>,</p>
      <p>Thank you for your interest in joining NMS (News Management System). After careful review of your registration, we regret to inform you that your application has not been approved at this time.</p>
      
      <div class="details-box">
        <p><span class="label">Name:</span> ${registration.full_name}</p>
        <p><span class="label">Email:</span> ${registration.email}</p>
        <p><span class="label">Status:</span> <strong style="color: #f5576c;">⚠ Not Approved</strong></p>
      </div>
      
      ${reason ? `
      <div class="reason-box">
        <h3>📋 Reason for Rejection:</h3>
        <p>${reason}</p>
      </div>
      ` : ''}
      
      <p>If you believe this decision was made in error or if you have any questions, please don't hesitate to contact our support team. We may be able to help you address any issues and reapply in the future.</p>
      
      <div class="button-group">
        <a href="https://nms.news/contact" class="button">Contact Support</a>
      </div>
      
      <p>We appreciate your understanding and hope to work with you in the future.</p>
      <p>Best regards,<br><strong>NMS Admin Team</strong></p>
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
 * Send registration confirmation email
 * @param {Object} registration - Registration object
 * @param {string} userId - Generated User ID
 */
export const sendRegistrationConfirmationEmail = async (registration, userId) => {
  try {
    if (!registration || !registration.email) {
      logger.warn('Cannot send confirmation email: registration or registration.email is missing');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: registration.email,
      subject: 'Welcome to NMS - Registration Confirmed!',
      html: registrationConfirmationTemplate(registration, userId),
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Registration confirmation email sent to ${registration.email}`);
  } catch (error) {
    logger.error(`Failed to send registration confirmation email to ${registration.email}: ${error.message}`);
  }
};

/**
 * Send approval email
 * @param {Object} registration - Registration object
 * @param {string} userId - Generated User ID
 */
export const sendApprovalEmail = async (registration, userId) => {
  try {
    if (!registration || !registration.email) {
      logger.warn('Cannot send approval email: registration or registration.email is missing');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: registration.email,
      subject: 'Your NMS Registration Has Been Approved!',
      html: approvalTemplate(registration, userId),
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Approval email sent to ${registration.email}`);
  } catch (error) {
    logger.error(`Failed to send approval email to ${registration.email}: ${error.message}`);
  }
};

/**
 * Send rejection email
 * @param {Object} registration - Registration object
 * @param {string} reason - Rejection reason
 */
export const sendRejectionEmail = async (registration, reason = '') => {
  try {
    if (!registration || !registration.email) {
      logger.warn('Cannot send rejection email: registration or registration.email is missing');
      return;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to: registration.email,
      subject: 'NMS Registration Status Update',
      html: rejectionTemplate(registration, reason),
    };

    await transporter.sendMail(mailOptions);
    logger.info(`Rejection email sent to ${registration.email}`);
  } catch (error) {
    logger.error(`Failed to send rejection email to ${registration.email}: ${error.message}`);
  }
};