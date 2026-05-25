const nodemailer = require("nodemailer");
require("dotenv").config();

console.log("\n" + "=".repeat(60));
console.log("🔍 SkinX Backend Connection Test");
console.log("=".repeat(60) + "\n");

// 1. Check Environment Variables
console.log("📋 Step 1: Checking Environment Variables...\n");

const emailService = process.env.EMAIL_SERVICE || "gmail";
console.log(`  📧 Email Service: ${emailService}\n`);

let checks = {
  PORT: process.env.PORT || "5000 (default)",
  EMAIL_SERVICE: emailService,
};

// Add service-specific checks
if (emailService === "testmail") {
  checks.TESTMAIL_NAMESPACE = process.env.TESTMAIL_NAMESPACE || "❌ NOT SET";
  checks.TESTMAIL_API_KEY = process.env.TESTMAIL_API_KEY
    ? "✅ SET (hidden)"
    : "❌ NOT SET";
  checks.TESTMAIL_HOST =
    process.env.TESTMAIL_HOST || "smtp.testmail.app (default)";
  checks.TESTMAIL_PORT = process.env.TESTMAIL_PORT || "587 (default)";
} else if (emailService === "sendgrid") {
  checks.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
    ? "✅ SET (hidden)"
    : "❌ NOT SET";
} else {
  checks.EMAIL_USER = process.env.EMAIL_USER || "❌ NOT SET";
  checks.EMAIL_PASS = process.env.EMAIL_PASS ? "✅ SET (hidden)" : "❌ NOT SET";
}

Object.entries(checks).forEach(([key, value]) => {
  const status = value.includes("❌") ? "❌" : "✅";
  console.log(`  ${status} ${key}: ${value}`);
});

console.log("\n");

// 2. Validate Configuration
console.log("📧 Step 2: Testing Email Configuration...\n");

let credentialsValid = false;
let transporter;

if (emailService === "testmail") {
  if (!process.env.TESTMAIL_NAMESPACE || !process.env.TESTMAIL_API_KEY) {
    console.error("❌ Testmail.app credentials not configured!");
    console.error("\nTo fix this:");
    console.error("1. Login to https://testmail.app/dashboard");
    console.error("2. Copy your namespace (e.g., skinx.12abc)");
    console.error("3. Get your API key from API section");
    console.error("4. Open backend/.env file");
    console.error("5. Set TESTMAIL_NAMESPACE=your-namespace");
    console.error("6. Set TESTMAIL_API_KEY=your-api-key\n");
    process.exit(1);
  }

  transporter = nodemailer.createTransport({
    host: process.env.TESTMAIL_HOST || "smtp.testmail.app",
    port: parseInt(process.env.TESTMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.TESTMAIL_NAMESPACE,
      pass: process.env.TESTMAIL_API_KEY,
    },
  });
  credentialsValid = true;
} else if (emailService === "sendgrid") {
  if (!process.env.SENDGRID_API_KEY) {
    console.error("❌ SendGrid API key not configured!");
    console.error("\nTo fix this:");
    console.error("1. Login to https://app.sendgrid.com");
    console.error("2. Go to Settings > API Keys");
    console.error("3. Create API Key");
    console.error("4. Open backend/.env file");
    console.error("5. Set SENDGRID_API_KEY in backend/.env\n");
    process.exit(1);
  }

  transporter = nodemailer.createTransport({
    host: "smtp.sendgrid.net",
    port: 587,
    secure: false,
    auth: {
      user: "apikey",
      pass: process.env.SENDGRID_API_KEY,
    },
  });
  credentialsValid = true;
} else {
  // Gmail or other services
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email credentials not configured!");
    console.error("\nTo fix this:");
    console.error("1. Open backend/.env file");
    console.error("2. Set EMAIL_USER=your-email@gmail.com");
    console.error("3. Set EMAIL_PASS=your-app-password");
    console.error("\nFor Gmail:");
    console.error(
      "• Generate App Password at: https://myaccount.google.com/apppasswords",
    );
    console.error("• Make sure 2-Factor Authentication is enabled\n");
    process.exit(1);
  }

  transporter = nodemailer.createTransport({
    service: emailService,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  credentialsValid = true;
}

console.log("  Testing email server connection...");

transporter
  .verify()
  .then(() => {
    console.log("  ✅ Email server connection successful!\n");

    // 3. Send Test Email
    console.log("📨 Step 3: Sending test email...\n");

    let testEmail;
    let fromEmail;
    let fromName = "SkinX Test";

    if (emailService === "testmail") {
      testEmail = `test@${process.env.TESTMAIL_NAMESPACE}.testmail.app`;
      fromEmail =
        process.env.EMAIL_FROM ||
        `noreply@${process.env.TESTMAIL_NAMESPACE}.testmail.app`;
      console.log(`  Sending to: ${testEmail}`);
      console.log(`  Check https://testmail.app/inbox for the email\n`);
    } else if (emailService === "sendgrid") {
      testEmail = process.env.EMAIL_FROM || "test@example.com";
      fromEmail = process.env.EMAIL_FROM || "noreply@skinx.com";
      console.log(`  Sending to: ${testEmail}\n`);
    } else {
      testEmail = process.env.EMAIL_USER;
      fromEmail = process.env.EMAIL_USER;
      console.log(`  Sending to: ${testEmail}\n`);
    }

    return transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: testEmail,
      subject: "SkinX Backend Test - Success!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #364a6b;">✅ Email Configuration Successful!</h2>
          <p>Your SkinX backend is configured correctly and can send emails.</p>
          <p><strong>Test Details:</strong></p>
          <ul>
            <li>Email Service: ${emailService}</li>
            <li>From: ${fromEmail}</li>
            <li>To: ${testEmail}</li>
            <li>Test Time: ${new Date().toLocaleString()}</li>
          </ul>
          <p>You're ready to start accepting registrations!</p>
          ${emailService === "testmail" ? '<p><strong>Note:</strong> Check your inbox at <a href="https://testmail.app/inbox">testmail.app/inbox</a></p>' : ""}
        </div>
      `,
      text: `Your SkinX backend email configuration is working correctly!\n\nService: ${emailService}\nTest Time: ${new Date().toLocaleString()}`,
    });
  })
  .then((info) => {
    console.log("  ✅ Test email sent successfully!\n");

    if (emailService === "testmail") {
      console.log("  📬 Check your inbox at: https://testmail.app/inbox\n");
      console.log(
        `  Look for email sent to: test@${process.env.TESTMAIL_NAMESPACE}.testmail.app\n`,
      );
    } else {
      console.log("  📬 Check your inbox for confirmation email\n");
    }

    console.log("=".repeat(60));
    console.log("🎉 All Tests Passed!");
    console.log("=".repeat(60));
    console.log("\nYour backend is ready to use. Start it with:");
    console.log("  PORT=5001 npm run dev\n");
  })
  .catch((error) => {
    console.error("\n❌ Email Test Failed!\n");
    console.error("Error:", error.message);
    console.error("\n🔧 Troubleshooting:\n");

    if (emailService === "testmail") {
      console.error("  • Check TESTMAIL_NAMESPACE is correct (no typos)");
      console.error("  • Check TESTMAIL_API_KEY is correct");
      console.error("  • Make sure there are no extra spaces in .env file");
      console.error(
        "  • Verify your namespace at: https://testmail.app/dashboard",
      );
      console.error("  • Try regenerating your API key");
    } else if (emailService === "sendgrid") {
      console.error("  • Check SENDGRID_API_KEY is correct");
      console.error('  • Verify API key has "Mail Send" permissions');
      console.error("  • Make sure sender is verified in SendGrid");
    } else if (error.message.includes("Invalid login")) {
      console.error("  • Check your EMAIL_USER is correct");
      console.error(
        "  • For Gmail, you need an App Password, not your regular password",
      );
      console.error(
        "  • Generate App Password at: https://myaccount.google.com/apppasswords",
      );
      console.error(
        "  • Make sure 2-Factor Authentication is enabled on your Google account",
      );
    } else if (error.message.includes("ECONNREFUSED")) {
      console.error("  • Check your internet connection");
      console.error("  • Your firewall may be blocking SMTP connections");
      console.error(
        "  • Try port 2525 instead of 587 (update TESTMAIL_PORT in .env)",
      );
    } else if (error.message.includes("ETIMEDOUT")) {
      console.error("  • Connection timeout - check your internet connection");
      console.error("  • Try a different network");
    } else {
      console.error("  • Verify your credentials in .env file");
      console.error("  • Make sure there are no extra spaces");
      console.error("  • Check the EMAIL_SERVICE value is correct");
    }

    console.error("\n");
    process.exit(1);
  });
