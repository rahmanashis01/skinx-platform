#!/usr/bin/env node

/**
 * SendGrid Email Test Script
 *
 * This script tests your SendGrid configuration by sending a test email.
 *
 * Usage:
 *   node test-sendgrid.js your-email@example.com
 *
 * Or with npm:
 *   npm run test-sendgrid your-email@example.com
 */

require("dotenv").config();
const nodemailer = require("nodemailer");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) =>
    console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

// Get test email from command line argument
const testEmail = process.argv[2];

if (!testEmail) {
  console.log(`
${colors.red}Error: No test email provided${colors.reset}

Usage:
  node test-sendgrid.js your-email@example.com

Example:
  node test-sendgrid.js test@gmail.com
  `);
  process.exit(1);
}

// Email validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(testEmail)) {
  log.error(`Invalid email format: ${testEmail}`);
  process.exit(1);
}

log.header("SendGrid Email Test");
console.log("");

// Check environment variables
log.info("Checking configuration...");

const checks = [
  {
    name: "EMAIL_SERVICE",
    value: process.env.EMAIL_SERVICE,
    expected: "sendgrid",
  },
  {
    name: "SENDGRID_API_KEY",
    value: process.env.SENDGRID_API_KEY,
    secret: true,
  },
  { name: "EMAIL_FROM", value: process.env.EMAIL_FROM },
  { name: "EMAIL_FROM_NAME", value: process.env.EMAIL_FROM_NAME },
];

let configValid = true;

checks.forEach((check) => {
  if (!check.value) {
    log.error(`${check.name} is not set in .env file`);
    configValid = false;
  } else if (check.expected && check.value !== check.expected) {
    log.error(
      `${check.name} should be "${check.expected}", got "${check.value}"`,
    );
    configValid = false;
  } else {
    const displayValue = check.secret
      ? `${check.value.substring(0, 10)}...${check.value.substring(check.value.length - 4)}`
      : check.value;
    log.success(`${check.name}: ${displayValue}`);
  }
});

if (!configValid) {
  log.error("\nConfiguration check failed. Please update your .env file.");
  process.exit(1);
}

console.log("");
log.info("Creating SendGrid transporter...");

let transporter;
try {
  transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY,
    },
  });
  log.success("Transporter created successfully");
} catch (error) {
  log.error(`Failed to create transporter: ${error.message}`);
  process.exit(1);
}

console.log("");
log.info("Verifying SendGrid connection...");

// Verify transporter
transporter
  .verify()
  .then(() => {
    log.success("SendGrid connection verified!");
    console.log("");
    return sendTestEmail();
  })
  .catch((error) => {
    log.error(`SendGrid verification failed: ${error.message}`);
    console.log("");
    log.warning("Common issues:");
    console.log("  1. Invalid API key");
    console.log('  2. API key doesn\'t have "Mail Send" permission');
    console.log("  3. Network/firewall issues");
    console.log("");
    log.info("Please check:");
    console.log("  - Your SendGrid API key in .env file");
    console.log("  - API key permissions in SendGrid dashboard");
    console.log("  - Your internet connection");
    process.exit(1);
  });

async function sendTestEmail() {
  log.info(`Sending test email to: ${testEmail}`);

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to: testEmail,
    subject: "✅ SendGrid Test Email - SkinX",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Success!</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
          <h2 style="color: #1f2937; margin-top: 0;">SendGrid is Working!</h2>

          <p style="color: #4b5563; line-height: 1.6;">
            Great news! Your SendGrid configuration is working correctly.
            This test email confirms that your SkinX backend can successfully send emails.
          </p>

          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <h3 style="color: #059669; margin-top: 0; font-size: 16px;">✅ Configuration Details</h3>
            <ul style="color: #6b7280; padding-left: 20px; line-height: 1.8;">
              <li><strong>Service:</strong> SendGrid</li>
              <li><strong>From:</strong> ${process.env.EMAIL_FROM}</li>
              <li><strong>From Name:</strong> ${process.env.EMAIL_FROM_NAME}</li>
              <li><strong>To:</strong> ${testEmail}</li>
              <li><strong>Test Date:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>

          <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1e40af; margin: 0; font-size: 14px;">
              <strong>💡 Next Steps:</strong><br>
              Your email system is ready! You can now use it for:
            </p>
            <ul style="color: #1e3a8a; margin: 10px 0 0 0; padding-left: 20px;">
              <li>User registration (OTP verification)</li>
              <li>Password reset requests</li>
              <li>Account notifications</li>
            </ul>
          </div>

          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            This is an automated test email from SkinX backend.<br>
            If you received this unexpectedly, you can safely ignore it.
          </p>
        </div>
      </div>
    `,
    text: `
SendGrid Test Email - SUCCESS!

Your SendGrid configuration is working correctly.

Configuration Details:
- Service: SendGrid
- From: ${process.env.EMAIL_FROM}
- From Name: ${process.env.EMAIL_FROM_NAME}
- To: ${testEmail}
- Test Date: ${new Date().toLocaleString()}

Next Steps:
Your email system is ready! You can now use it for:
- User registration (OTP verification)
- Password reset requests
- Account notifications

This is an automated test email from SkinX backend.
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("");
    log.success("Email sent successfully!");
    console.log("");
    console.log(`${colors.bright}Email Details:${colors.reset}`);
    console.log(`  Message ID: ${info.messageId}`);
    console.log(`  Response: ${info.response}`);
    console.log("");
    log.success(`Check your inbox: ${testEmail}`);
    console.log("");
    log.info("If you don't see the email:");
    console.log("  1. Check your spam/junk folder");
    console.log("  2. Check SendGrid Activity dashboard");
    console.log("  3. Wait a few minutes (delivery can take 1-2 minutes)");
    console.log("");

    console.log(
      `${colors.green}${colors.bright}✓ SendGrid Test Completed Successfully!${colors.reset}\n`,
    );
    process.exit(0);
  } catch (error) {
    console.log("");
    log.error("Failed to send email");
    console.log("");
    console.log(`${colors.bright}Error Details:${colors.reset}`);
    console.log(`  ${error.message}`);

    if (error.response) {
      console.log(`  Response: ${error.response}`);
    }

    console.log("");
    log.warning("Common issues:");
    console.log("  1. Sender email not verified in SendGrid");
    console.log('  2. Invalid "From" email address');
    console.log("  3. API key permissions issue");
    console.log("  4. SendGrid account suspended/limited");
    console.log("");
    log.info("Please check:");
    console.log("  - SendGrid → Settings → Sender Authentication");
    console.log("  - EMAIL_FROM in .env matches verified email");
    console.log("  - SendGrid Activity dashboard for errors");
    console.log("");
    process.exit(1);
  }
}
