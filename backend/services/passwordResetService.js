/**
 * Password Reset Service
 * Handles password reset token generation, validation, and email sending
 * Uses bcryptjs for password hashing and SendGrid for email delivery
 */

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
require("dotenv").config();

// Configuration
const RESET_TOKEN_EXPIRY_HOURS = 1;
const RESET_TOKEN_LENGTH = 32;
const BCRYPT_ROUNDS = 10;

/**
 * Generate a secure random token
 * @returns {string} Raw token (send to user via email)
 */
function generateResetToken() {
  return crypto.randomBytes(RESET_TOKEN_LENGTH).toString("hex");
}

/**
 * Hash a reset token for database storage
 * @param {string} token - Raw token from generateResetToken()
 * @returns {string} Hashed token
 */
function hashResetToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Hash a password using bcryptjs
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(BCRYPT_ROUNDS);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Verify a password against its hash
 * @param {string} password - Plain text password to verify
 * @param {string} hash - Hashed password from database
 * @returns {Promise<boolean>} True if password matches
 */
async function verifyPassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}

/**
 * Create email transporter based on configuration
 * @returns {Object} Nodemailer transporter
 */
function createEmailTransporter() {
  if (process.env.EMAIL_SERVICE === "testmail") {
    return nodemailer.createTransport({
      host: process.env.TESTMAIL_HOST || "smtp.testmail.app",
      port: parseInt(process.env.TESTMAIL_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.TESTMAIL_NAMESPACE,
        pass: process.env.TESTMAIL_API_KEY,
      },
    });
  } else if (process.env.EMAIL_SERVICE === "sendgrid") {
    return nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    // Default: Gmail or other SMTP
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
}

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} resetToken - Raw reset token (from generateResetToken)
 * @param {string} userName - User's name for personalization
 * @returns {Promise<Object>} Email send result
 */
async function sendPasswordResetEmail(email, resetToken, userName = "User") {
  try {
    const transporter = createEmailTransporter();

    // Build reset link - adjust domain based on environment
    const resetLink = `${process.env.FRONTEND_URL || "https://skin-x.app"}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `SkinX Support <${process.env.EMAIL_FROM || "noreply@skinx.com"}>`,
      to: email,
      subject: "Reset Your SkinX Password",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; }
              .footer { margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
              .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin: 15px 0; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Reset Request</h1>
              </div>
              <div class="content">
                <p>Hello ${userName},</p>
                <p>We received a request to reset your SkinX password. Click the button below to create a new password:</p>

                <a href="${resetLink}" class="button">Reset Password</a>

                <p>Or copy and paste this link in your browser:</p>
                <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                  ${resetLink}
                </p>

                <div class="warning">
                  <strong>⚠️ Security Notice:</strong> This link will expire in <strong>1 hour</strong>. If you didn't request this reset, please ignore this email and your password will remain unchanged.
                </div>

                <p>For security reasons, we never send passwords via email. If you need additional help, please contact our support team.</p>
              </div>
              <div class="footer">
                <p>© 2024 SkinX. All rights reserved.</p>
                <p>This is an automated message, please don't reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Hello ${userName},\n\nClick the link below to reset your password:\n${resetLink}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send password reset email to ${email}:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

/**
 * Send password change confirmation email
 * @param {string} email - User's email address
 * @param {string} userName - User's name
 * @returns {Promise<Object>} Email send result
 */
async function sendPasswordChangeConfirmationEmail(email, userName = "User") {
  try {
    const transporter = createEmailTransporter();

    const mailOptions = {
      from: `SkinX Support <${process.env.EMAIL_FROM || "noreply@skinx.com"}>`,
      to: email,
      subject: "Your SkinX Password Has Been Changed",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
              .success-badge { display: inline-block; background: #28a745; color: white; padding: 8px 15px; border-radius: 20px; margin: 10px 0; }
              .footer { margin-top: 20px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Password Updated Successfully</h1>
              </div>
              <div class="content">
                <p>Hello ${userName},</p>
                <p><span class="success-badge">✓ Confirmed</span></p>
                <p>Your SkinX password has been successfully changed. You can now log in with your new password.</p>

                <p><strong>What to do if you didn't make this change:</strong></p>
                <ul>
                  <li>If you did not request this password change, please <strong>contact our support team immediately</strong></li>
                  <li>Change your password again if your account may have been compromised</li>
                  <li>Review your account activity for any unauthorized access</li>
                </ul>

                <p>For security reasons, we recommend:</p>
                <ul>
                  <li>Using a strong, unique password</li>
                  <li>Not sharing your password with anyone</li>
                  <li>Logging out from other devices if needed</li>
                </ul>
              </div>
              <div class="footer">
                <p>© 2024 SkinX. All rights reserved.</p>
                <p>This is an automated message, please don't reply to this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Hello ${userName},\n\nYour SkinX password has been successfully changed. You can now log in with your new password.\n\nIf you did not make this change, please contact our support team immediately.`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password confirmation email sent to ${email}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send confirmation email to ${email}:`, error);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid, errors: [] }
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

module.exports = {
  generateResetToken,
  hashResetToken,
  hashPassword,
  verifyPassword,
  sendPasswordResetEmail,
  sendPasswordChangeConfirmationEmail,
  validatePasswordStrength,
  RESET_TOKEN_EXPIRY_HOURS,
};
