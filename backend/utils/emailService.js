// Email Service for sending verification codes
// Using Node.js built-in or simple email library

const sendEmail = async (email, verificationCode) => {
  try {
    // TODO: Implement with actual email service (Nodemailer, SendGrid, AWS SES, etc.)
    // For now, logging to console for development
    console.log(`
    ================================
    EMAIL VERIFICATION
    ================================
    To: ${email}
    Code: ${verificationCode}
    Expires: 10 minutes
    ================================
    `);

    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

const generateVerificationCode = () => {
  // Generate a 6-digit code
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendEmail,
  generateVerificationCode,
};
