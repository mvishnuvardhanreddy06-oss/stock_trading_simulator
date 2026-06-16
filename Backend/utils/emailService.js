import nodemailer from "nodemailer";

const emailUser = process.env.EMAIL_USER || "your-email@gmail.com";
const emailPassword = (process.env.EMAIL_PASSWORD || "your-app-password").replace(/[\s-]/g, "");

// Email transporter configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPassword
  }
});

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @returns {Promise} Email sending result
 */
export async function sendOTPEmail(email, otp) {
  const mailOptions = {
    from: `"Stock Trading Simulator" <${emailUser}>`,
    to: email,
    subject: "Your Password Reset OTP - Stock Trading Simulator",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background-color: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
            .title { font-size: 22px; color: #1f2937; margin: 0; }
            .content { margin: 30px 0; }
            .otp-box { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 8px;
              margin: 20px 0;
            }
            .otp-code { font-size: 48px; font-weight: bold; letter-spacing: 10px; font-family: monospace; }
            .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 15px; opacity: 0.9; }
            .warning { color: #7c2d12; background-color: #fed7aa; padding: 12px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
            .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">📈 Stock Trading Simulator</div>
              <h1 class="title">Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hello,</p>
              <p>We received a request to reset your password. Use the OTP below to verify your identity:</p>
              
              <div class="otp-box">
                <div class="otp-label">Your One-Time Password</div>
                <div class="otp-code">${otp}</div>
              </div>
              
              <div class="warning">
                ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone. This code will expire in 1 minute. If you didn't request this reset, ignore this email.
              </div>
              
              <p>Enter this code in the verification form to proceed with your password reset.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply to this email.</p>
              <p>&copy; 2024 Stock Trading Simulator. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Verify email transporter (test connection)
 * @returns {Promise} Verification result
 */
export async function verifyEmailService() {
  return transporter.verify();
}
