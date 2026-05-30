import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import axios from "axios";
import dotenv from "dotenv";

import analyzeRoutes from "./routes/analyze.js";
import passwordResetRoutes from "./routes/passwordReset.js";
import inferenceService from "./services/inferenceService.js";
import { checkHybridJwt } from "./middleware/hybridAuth.js";
import { initializePool, initializeSchema, getPool, query } from "./db/init.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MODEL_API_URL =
  process.env.MODEL_API_URL ||
  process.env.MODEL_SERVICE_URL ||
  "http://model-api:8080";
const RAG_API_URL =
  process.env.RAG_API_URL ||
  process.env.RAG_BACKEND_URL ||
  "http://rag-backend:8000";

// Use hybrid JWT validation middleware (supports Auth0 and Firebase tokens)
// This middleware normalizes both token types to req.auth object

// Production-ready CORS configuration
const allowedOrigins = [
  "https://skin-x.app",
  "https://www.skin-x.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

// Add development origin if in dev mode
if (process.env.NODE_ENV !== "production") {
  allowedOrigins.push("http://localhost:5173");
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked origin: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(express.json());

// In-memory OTP/user stores
const otpStore = new Map();
const userStore = new Map();

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

let transporter = null;

// Initialize email transporter
function initializeTransporter() {
  if (process.env.EMAIL_SERVICE === "sendgrid") {
    transporter = nodemailer.createTransport({
      host: "smtp.sendgrid.net",
      port: 587,
      secure: false,
      auth: {
        user: "apikey",
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else if (process.env.EMAIL_SERVICE === "testmail") {
    transporter = nodemailer.createTransport({
      host: process.env.TESTMAIL_HOST || "api.testmail.app",
      port: Number(process.env.TESTMAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.TESTMAIL_NAMESPACE,
        pass: process.env.TESTMAIL_API_KEY,
      },
    });
  } else {
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT || 587),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
}

initializeTransporter();

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const sendOTPEmail = async (to, otp, purpose = "verify") => {
  const fromEmail =
    process.env.EMAIL_FROM || process.env.EMAIL_USER || "noreply@skinx.app";
  const fromName = process.env.EMAIL_FROM_NAME || "SkinX";

  const subject =
    purpose === "reset"
      ? "Your SkinX password reset code"
      : "Your SkinX verification code";

  const mailOptions = {
    from: `${fromName} <${fromEmail}>`,
    to,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2>SkinX Verification Code</h2>
        <p>Your one-time verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; margin: 20px 0;">${otp}</div>
        <p>This code will expire in ${OTP_EXPIRY_MINUTES} minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
    text: `Your SkinX verification code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
  };

  const result = await transporter.sendMail(mailOptions);
  return result;
};

const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (data.expires <= now) {
      otpStore.delete(email);
    }
  }
};

// Health/status endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SkinX backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "SkinX backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Registration endpoint
app.post("/api/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Use database if enabled
    const USE_DATABASE = process.env.USE_DATABASE === "true";

    if (USE_DATABASE) {
      try {
        // Check for resend cooldown from database
        const recentOtpResult = await query(
          "SELECT created_at FROM otp_verifications WHERE email = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1",
          [email, "register"]
        );

        if (recentOtpResult.rows.length > 0) {
          const timeSinceLastSend = Date.now() - new Date(recentOtpResult.rows[0].created_at).getTime();
          if (timeSinceLastSend < RESEND_COOLDOWN_SECONDS * 1000) {
            return res.status(429).json({
              success: false,
              message: `Please wait ${Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - timeSinceLastSend) / 1000)} seconds before requesting another OTP`,
            });
          }
        }

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const passwordHash = await bcrypt.hash(password, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Store OTP data in database
        await query(
          "INSERT INTO otp_verifications (email, purpose, otp_hash, full_name, password_hash, expires_at, attempts) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [email, "register", otpHash, fullName, passwordHash, expiresAt, 0]
        );

        const emailResult = await sendOTPEmail(email, otp, "verify");

        console.log(`📧 OTP sent for registration: ${email}`);

        return res.status(200).json({
          success: true,
          message: "OTP sent successfully",
          details: {
            accepted: emailResult.accepted,
            rejected: emailResult.rejected,
          },
          expiresIn: OTP_EXPIRY_MINUTES * 60,
        });
      } catch (dbError) {
        console.error("Database registration error:", dbError);
        return res.status(500).json({
          success: false,
          message: "Failed to save registration data",
          error: dbError.message,
        });
      }
    } else {
      // Fallback to in-memory storage
      cleanupExpiredOTPs();

      const existingData = otpStore.get(email);
      const timeSinceLastSend = existingData
        ? Date.now() - existingData.lastSent
        : Infinity;

      if (existingData && timeSinceLastSend < RESEND_COOLDOWN_SECONDS * 1000) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - timeSinceLastSend) / 1000)} seconds before requesting another OTP`,
        });
      }

      const otp = generateOTP();
      const expires = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;
      const passwordHash = await bcrypt.hash(password, 10);

      otpStore.set(email, {
        otp,
        expires,
        attempts: 0,
        fullName,
        passwordHash,
        lastSent: Date.now(),
      });

      const emailResult = await sendOTPEmail(email, otp, "verify");

      return res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        details: {
          accepted: emailResult.accepted,
          rejected: emailResult.rejected,
        },
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      });
    }
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
});

// OTP verification endpoint
app.post("/api/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const USE_DATABASE = process.env.USE_DATABASE === "true";

    if (USE_DATABASE) {
      try {
        // Get latest OTP record
        const otpResult = await query(
          "SELECT * FROM otp_verifications WHERE email = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1",
          [email, "register"]
        );

        if (otpResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No OTP found. Please register again.",
          });
        }

        const otpRecord = otpResult.rows[0];

        // Check expiration
        if (new Date() > new Date(otpRecord.expires_at)) {
          // Delete expired OTP
          await query("DELETE FROM otp_verifications WHERE id = $1", [otpRecord.id]);
          return res.status(400).json({
            success: false,
            message: "OTP has expired. Please register again.",
          });
        }

        // Check attempts
        if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
          await query("DELETE FROM otp_verifications WHERE id = $1", [otpRecord.id]);
          return res.status(429).json({
            success: false,
            message: "Maximum OTP attempts exceeded. Please register again.",
          });
        }

        // Verify OTP
        const isValidOtp = await bcrypt.compare(otp, otpRecord.otp_hash);
        if (!isValidOtp) {
          // Increment attempts
          await query(
            "UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1",
            [otpRecord.id]
          );
          const attemptsLeft = MAX_OTP_ATTEMPTS - otpRecord.attempts - 1;
          return res.status(400).json({
            success: false,
            message: `Invalid OTP. ${attemptsLeft} attempts remaining.`,
            attemptsLeft,
          });
        }

        // Create user
        const userResult = await query(
          "INSERT INTO users (email, full_name, password_hash, email_verified, auth_method) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name",
          [email, otpRecord.full_name, otpRecord.password_hash, true, "email"]
        );

        const user = userResult.rows[0];

        // Delete OTP record
        await query("DELETE FROM otp_verifications WHERE id = $1", [otpRecord.id]);

        const token = crypto.randomUUID();

        console.log(`✅ User registered and verified: ${email}`);

        return res.status(200).json({
          success: true,
          message: "Email verified successfully",
          token,
          name: user.full_name,
          email: user.email,
        });
      } catch (dbError) {
        console.error("Database OTP verification error:", dbError);
        return res.status(500).json({
          success: false,
          message: "Failed to verify OTP",
          error: dbError.message,
        });
      }
    } else {
      // Fallback to in-memory storage
      const storedData = otpStore.get(email);

      if (!storedData) {
        return res.status(400).json({
          success: false,
          message: "No OTP found. Please register again.",
        });
      }

      if (storedData.expires <= Date.now()) {
        otpStore.delete(email);
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please register again.",
        });
      }

      if (storedData.attempts >= MAX_OTP_ATTEMPTS) {
        otpStore.delete(email);
        return res.status(429).json({
          success: false,
          message: "Maximum OTP attempts exceeded. Please register again.",
        });
      }

      if (storedData.otp !== otp) {
        storedData.attempts += 1;
        const attemptsLeft = MAX_OTP_ATTEMPTS - storedData.attempts;
        return res.status(400).json({
          success: false,
          message: `Invalid OTP. ${attemptsLeft} attempts remaining.`,
          attemptsLeft,
        });
      }

      const userData = {
        fullName: storedData.fullName,
        email,
        passwordHash: storedData.passwordHash,
        verified: true,
        createdAt: new Date().toISOString(),
      };

      userStore.set(email, userData);
      otpStore.delete(email);

      const token = crypto.randomUUID();

      return res.status(200).json({
        success: true,
        message: "Email verified successfully",
        token,
        name: userData.fullName,
        email,
      });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
});

// Resend OTP endpoint
app.post("/api/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const USE_DATABASE = process.env.USE_DATABASE === "true";

    if (USE_DATABASE) {
      try {
        // Check for existing OTP record
        const existingOtpResult = await query(
          "SELECT * FROM otp_verifications WHERE email = $1 AND purpose = $2 ORDER BY created_at DESC LIMIT 1",
          [email, "register"]
        );

        if (existingOtpResult.rows.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No registration found for this email",
          });
        }

        const existingOtp = existingOtpResult.rows[0];
        const timeSinceLastSend = Date.now() - new Date(existingOtp.created_at).getTime();

        if (timeSinceLastSend < RESEND_COOLDOWN_SECONDS * 1000) {
          return res.status(429).json({
            success: false,
            message: `Please wait ${Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - timeSinceLastSend) / 1000)} seconds before requesting another OTP`,
          });
        }

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

        // Delete old OTP and create new one
        await query("DELETE FROM otp_verifications WHERE id = $1", [existingOtp.id]);
        await query(
          "INSERT INTO otp_verifications (email, purpose, otp_hash, full_name, password_hash, expires_at, attempts) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [email, "register", otpHash, existingOtp.full_name, existingOtp.password_hash, expiresAt, 0]
        );

        const emailResult = await sendOTPEmail(email, otp, "verify");

        console.log(`📧 OTP resent for: ${email}`);

        return res.status(200).json({
          success: true,
          message: "OTP resent successfully",
          details: {
            accepted: emailResult.accepted,
            rejected: emailResult.rejected,
          },
          expiresIn: OTP_EXPIRY_MINUTES * 60,
        });
      } catch (dbError) {
        console.error("Database resend OTP error:", dbError);
        return res.status(500).json({
          success: false,
          message: "Failed to resend OTP",
          error: dbError.message,
        });
      }
    } else {
      // Fallback to in-memory storage
      const existingData = otpStore.get(email);
      if (!existingData) {
        return res.status(400).json({
          success: false,
          message: "No registration found for this email",
        });
      }

      const timeSinceLastSend = Date.now() - existingData.lastSent;
      if (timeSinceLastSend < RESEND_COOLDOWN_SECONDS * 1000) {
        return res.status(429).json({
          success: false,
          message: `Please wait ${Math.ceil((RESEND_COOLDOWN_SECONDS * 1000 - timeSinceLastSend) / 1000)} seconds before requesting another OTP`,
        });
      }

      const otp = generateOTP();
      const expires = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000;

      otpStore.set(email, {
        ...existingData,
        otp,
        expires,
        attempts: 0,
        lastSent: Date.now(),
      });

      const emailResult = await sendOTPEmail(email, otp, "verify");

      return res.status(200).json({
        success: true,
        message: "OTP resent successfully",
        details: {
          accepted: emailResult.accepted,
          rejected: emailResult.rejected,
        },
        expiresIn: OTP_EXPIRY_MINUTES * 60,
      });
    }
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: error.message,
    });
  }
});

// Backend login endpoint
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const USE_DATABASE = process.env.USE_DATABASE === "true";

    if (USE_DATABASE) {
      try {
        // Get user from database
        const userResult = await query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (userResult.rows.length === 0) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        const user = userResult.rows[0];

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: "Invalid email or password",
          });
        }

        // Update last login
        await query(
          "UPDATE users SET updated_at = NOW() WHERE id = $1",
          [user.id]
        );

        const token = crypto.randomUUID();

        console.log(`✅ User logged in: ${email}`);

        return res.status(200).json({
          success: true,
          message: "Login successful",
          token,
          name: user.full_name,
          email: user.email,
        });
      } catch (dbError) {
        console.error("Database login error:", dbError);
        return res.status(500).json({
          success: false,
          message: "Login failed",
          error: dbError.message,
        });
      }
    } else {
      // Fallback to in-memory storage
      const user = userStore.get(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      const token = crypto.randomUUID();

      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        name: user.fullName,
        email,
      });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// Password change endpoint
app.post("/api/change-password", async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;

    if (!email || !oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, old password, and new password are required",
      });
    }

    const USE_DATABASE = process.env.USE_DATABASE === "true";

    if (USE_DATABASE) {
      try {
        // Get user from database
        const userResult = await query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (userResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        const user = userResult.rows[0];

        // Verify old password
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password_hash);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            message: "Old password is incorrect",
          });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await query(
          "UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2",
          [hashedPassword, user.id]
        );

        console.log(`✅ Password changed for: ${email}`);

        return res.status(200).json({
          success: true,
          message: "Password changed successfully",
        });
      } catch (dbError) {
        console.error("Database password change error:", dbError);
        return res.status(500).json({
          success: false,
          message: "Failed to change password",
          error: dbError.message,
        });
      }
    } else {
      // Fallback to in-memory storage
      const user = userStore.get(email);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Old password is incorrect",
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      userStore.set(email, {
        ...user,
        passwordHash: hashedPassword,
      });

      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    }
  } catch (error) {
    console.error("Password change error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password",
      error: error.message,
    });
  }
});

// Scan endpoints, analysis routes, password reset routes
// Mount password reset routes at both /api and /api/auth for frontend compatibility
app.use("/api", passwordResetRoutes);
app.use("/api/auth", passwordResetRoutes);
app.use("/api/analyze-photo", analyzeRoutes);

const handleAskProxy = async (req, res) => {
  const question = req.body?.question || req.body?.message || req.body?.query;

  if (!question || !String(question).trim()) {
    return res.status(400).json({
      success: false,
      error: "A non-empty question, message, or query field is required.",
    });
  }

  try {
    const response = await axios.post(
      `${RAG_API_URL}/ask`,
      { ...req.body, question: String(question).trim() },
      {
        timeout: 35000,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    return res.status(200).json(response.data);
  } catch (error) {
    console.error("RAG ask error:", error.message);
    return res.status(502).json({
      success: false,
      error: "Failed to reach RAG backend",
      details:
        process.env.NODE_ENV === "development"
          ? error.response?.data || error.message
          : undefined,
    });
  }
};

app.post("/api/ask", handleAskProxy);
app.post("/ask", handleAskProxy);

// Example external health check / proxy logic
app.get("/api/rag-health", async (_req, res) => {
  try {
    const response = await axios.get(`${RAG_API_URL}/health`, {
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error("RAG health error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to reach RAG backend",
      error: error.message,
    });
  }
});

app.listen(PORT, async () => {
  // Initialize database if enabled
  if (process.env.USE_DATABASE === "true") {
    try {
      initializePool();
      await initializeSchema();
      console.log("✅ Auth storage: PostgreSQL");
    } catch (error) {
      console.error("❌ Database initialization failed:", error.message);
      console.error("Server startup halted - database is required in production");
      process.exit(1);
    }
  } else {
    console.log("ℹ️  Auth storage: In-memory (development only)");
  }

  console.log("\n" + "=".repeat(50));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📧 Email service: ${process.env.EMAIL_SERVICE || "gmail"}`);
  console.log(`🤖 Model service: ${MODEL_API_URL}`);
  console.log(`💬 RAG backend: ${RAG_API_URL}`);

  // Initialize inference service
  try {
    await inferenceService.initialize();
  } catch (error) {
    console.error("⚠️  Failed to initialize inference service:", error.message);
  }

  // Check different email service configurations
  if (process.env.EMAIL_SERVICE === "testmail") {
    console.log(`🔐 Auth0 configured: ✅`);
    console.log(
      `👤 Testmail namespace: ${process.env.TESTMAIL_NAMESPACE ? "✅ Configured" : "❌ Not configured"}`,
    );
    console.log(
      `🔑 Testmail API key: ${process.env.TESTMAIL_API_KEY ? "✅ Configured" : "❌ Not configured"}`,
    );
  } else if (process.env.EMAIL_SERVICE === "sendgrid") {
    console.log(
      `🔑 SendGrid API key: ${process.env.SENDGRID_API_KEY ? "✅ Configured" : "❌ Not configured"}`,
    );
  } else {
    console.log(
      `👤 Email user: ${process.env.EMAIL_USER ? "✅ Configured" : "❌ Not configured"}`,
    );
    console.log(
      `🔑 Email pass: ${process.env.EMAIL_PASS ? "✅ Configured" : "❌ Not configured"}`,
    );
  }

  console.log(`⏰ OTP expiry: ${OTP_EXPIRY_MINUTES} minutes`);
  console.log(`🔒 Max attempts: ${MAX_OTP_ATTEMPTS}`);
  console.log(`⏱️  Resend cooldown: ${RESEND_COOLDOWN_SECONDS} seconds`);
  console.log("=".repeat(50) + "\n");

  // Check if email credentials are configured based on service
  const credentialsConfigured =
    (process.env.EMAIL_SERVICE === "testmail" &&
      process.env.TESTMAIL_NAMESPACE &&
      process.env.TESTMAIL_API_KEY) ||
    (process.env.EMAIL_SERVICE === "sendgrid" &&
      process.env.SENDGRID_API_KEY) ||
    (process.env.EMAIL_USER && process.env.EMAIL_PASS);

  if (!credentialsConfigured) {
    console.error("⚠️  WARNING: Email credentials not configured!");
    console.error(
      "Please set the appropriate email credentials in your .env file\n",
    );
  }
});
