// Email Service for sending verification codes
const nodemailer = require('nodemailer');

// Create transporter (use environment variables for credentials)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password',
  },
});

const sendEmail = async (email, subject, message) => {
  try {
    // If subject is actually a verification code (backward compatibility)
    if (typeof subject === 'string' && subject.match(/^\d{6}$/)) {
      const verificationCode = subject;
      const emailContent = `
        <h2>Email Verification</h2>
        <p>Your verification code is: <strong>${verificationCode}</strong></p>
        <p>This code expires in 10 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
      `;

      const mailOptions = {
        from: process.env.EMAIL_USER || 'noreply@campuscrate.com',
        to: email,
        subject: 'Email Verification - CampusCrate',
        html: emailContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✓ Verification email sent to ${email}`);
      return true;
    }

    // Regular email sending
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@campuscrate.com',
      to: email,
      subject: subject || 'CampusCrate Notification',
      html: message || 'You have received a notification from CampusCrate',
    };

    await transporter.sendMail(mailOptions);
    console.log(`✓ Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    
    // Development fallback - log to console
    console.log(`
    ================================
    EMAIL NOTIFICATION (Development)
    ================================
    To: ${email}
    Subject: ${subject}
    Message: ${message}
    ================================
    `);
    
    return false;
  }
};

const sendVerificationEmail = async (email, verificationCode) => {
  return sendEmail(email, verificationCode);
};

const sendClaimNotification = async (email, itemTitle, claimantName) => {
  const subject = 'New Claim on Your Item - CampusCrate';
  const message = `
    <h2>New Claim Received</h2>
    <p><strong>${claimantName}</strong> has claimed your item: <strong>${itemTitle}</strong></p>
    <p>Please review their claim and approve or reject it in the CampusCrate dashboard.</p>
  `;
  return sendEmail(email, subject, message);
};

const sendClaimApprovalEmail = async (email, itemTitle) => {
  const subject = 'Claim Approved - CampusCrate';
  const message = `
    <h2>Claim Approved!</h2>
    <p>Your claim for <strong>${itemTitle}</strong> has been approved by the item owner.</p>
    <p>Please contact the owner to arrange pickup or delivery.</p>
  `;
  return sendEmail(email, subject, message);
};

const generateVerificationCode = () => {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendClaimNotification,
  sendClaimApprovalEmail,
  generateVerificationCode,
  transporter,
};
