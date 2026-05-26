/**
 * Password Reset Routes
 * Handles forgot-password and reset-password endpoints
 */

const express = require("express");
const crypto = require("crypto");
const router = express.Router();
const {
  generateResetToken,
  hashResetToken,
  hashPassword,
  verifyPassword,
  sendPasswordResetEmail,
  sendPasswordChangeConfirmationEmail,
  validatePasswordStrength,
  RESET_TOKEN_EXPIRY_HOURS,
} = require("../services/passwordResetService");

/**
 * POST /api/forgot-password
 * Request a password reset email
 * Body: { email: string }
 */
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email || typeof email !== "string") {
      return res.status(400).json({
        success: false,
        message: "Email address is required",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address format",
      });
    }

    // Check if email exists in database
    // NOTE: This is a placeholder - replace with actual database query
    // For production, you'll need a database connection (PostgreSQL pool)
    const user = null; // await db.query('SELECT * FROM users WHERE email = $1', [email]);

    if (!user) {
      // For security: don't reveal if email exists or not
      // Return success even if user doesn't exist
      return res.status(200).json({
        success: true,
        message: "If an account exists with that email, a reset link has been sent",
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const tokenHash = hashResetToken(resetToken);

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + RESET_TOKEN_EXPIRY_HOURS);

    // Store token in database
    // NOTE: This is a placeholder - replace with actual database query
    // await db.query(
    //   'INSERT INTO password_resets (user_id, token_hash, expires_at, ip_address, user_agent) VALUES ($1, $2, $3, $4, $5)',
    //   [user.id, tokenHash, expiresAt, req.ip, req.get('user-agent')]
    // );

    // Send reset email
    await sendPasswordResetEmail(
      email,
      resetToken,
      user.full_name || "User"
    );

    // Log the reset request
    console.log(`🔐 Password reset requested for: ${email}`);

    return res.status(200).json({
      success: true,
      message: "If an account exists with that email, a reset link has been sent",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while processing your request",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/validate-reset-token
 * Validate a password reset token before showing the reset form
 * Body: { token: string }
 */
router.post("/validate-reset-token", async (req, res) => {
  try {
    const { token } = req.body;

    // Validate input
    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    // Hash the token for lookup
    const tokenHash = hashResetToken(token);

    // Look up token in database
    // NOTE: This is a placeholder - replace with actual database query
    // const result = await db.query(
    //   'SELECT * FROM password_resets WHERE token_hash = $1 AND is_used = FALSE AND expires_at > NOW()',
    //   [tokenHash]
    // );

    // if (result.rows.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid or expired reset token",
    //   });
    // }

    // const resetRecord = result.rows[0];
    // const user = await db.query('SELECT email, full_name FROM users WHERE id = $1', [resetRecord.user_id]);

    return res.status(200).json({
      success: true,
      message: "Token is valid",
      email: "user@example.com", // Replace with actual user email from DB
    });
  } catch (error) {
    console.error("❌ Token validation error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while validating the token",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/reset-password
 * Reset password using a valid reset token
 * Body: { token: string, password: string }
 */
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate inputs
    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!password || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Password does not meet security requirements",
        errors: passwordValidation.errors,
      });
    }

    // Hash the token for lookup
    const tokenHash = hashResetToken(token);

    // Look up and validate token in database
    // NOTE: This is a placeholder - replace with actual database query
    // const result = await db.query(
    //   'SELECT * FROM password_resets WHERE token_hash = $1 AND is_used = FALSE AND expires_at > NOW()',
    //   [tokenHash]
    // );

    // if (result.rows.length === 0) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid or expired reset token",
    //   });
    // }

    // const resetRecord = result.rows[0];

    // Check if token has already been used
    // if (resetRecord.is_used) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This reset token has already been used",
    //   });
    // }

    // Check if token is expired
    // if (new Date() > new Date(resetRecord.expires_at)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "This reset token has expired",
    //   });
    // }

    // Get user information
    // const userResult = await db.query(
    //   'SELECT id, email, full_name FROM users WHERE id = $1',
    //   [resetRecord.user_id]
    // );

    // if (userResult.rows.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "User not found",
    //   });
    // }

    // const user = userResult.rows[0];

    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    // await db.query(
    //   'UPDATE users SET password_hash = $1, auth_method = $2, updated_at = NOW() WHERE id = $3',
    //   [hashedPassword, 'email', resetRecord.user_id]
    // );

    // Mark token as used
    // await db.query(
    //   'UPDATE password_resets SET is_used = TRUE, used_at = NOW() WHERE id = $1',
    //   [resetRecord.id]
    // );

    // Send confirmation email
    // await sendPasswordChangeConfirmationEmail(user.email, user.full_name || "User");

    // Log the password reset
    console.log(`✅ Password reset completed for: user@example.com`);

    return res.status(200).json({
      success: true,
      message: "Your password has been successfully reset. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while resetting your password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * POST /api/change-password
 * Change password for authenticated users
 * Requires: Authorization header with valid JWT
 * Body: { currentPassword: string, newPassword: string }
 */
router.post("/change-password", async (req, res) => {
  try {
    // This endpoint requires authentication
    const userId = req.user?.sub; // From JWT token
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Validate inputs
    if (!currentPassword || typeof currentPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "Current password is required",
      });
    }

    if (!newPassword || typeof newPassword !== "string") {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }

    // Get user from database
    // NOTE: This is a placeholder - replace with actual database query
    // const result = await db.query(
    //   'SELECT id, email, full_name, password_hash FROM users WHERE id = $1',
    //   [userId]
    // );

    // if (result.rows.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "User not found",
    //   });
    // }

    // const user = result.rows[0];

    // Verify current password
    // const passwordValid = await verifyPassword(currentPassword, user.password_hash);
    // if (!passwordValid) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Current password is incorrect",
    //   });
    // }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "New password does not meet security requirements",
        errors: passwordValidation.errors,
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password in database
    // await db.query(
    //   'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    //   [hashedPassword, userId]
    // );

    // Send confirmation email
    // await sendPasswordChangeConfirmationEmail(user.email, user.full_name || "User");

    console.log(`✅ Password changed for user: ${userId}`);

    return res.status(200).json({
      success: true,
      message: "Your password has been successfully changed",
    });
  } catch (error) {
    console.error("❌ Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while changing your password",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

module.exports = router;
