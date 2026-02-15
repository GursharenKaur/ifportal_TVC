const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Fallback email service using working Gmail or console
const sendEmail = async (to, subject, text, html = null) => {
  try {
    // Generate OTP for console display
    const otp = generateOTP();
    console.log('==========================================');
    console.log('🔐 YOUR OTP IS:', otp);
    console.log('📧 EMAIL:', to);
    console.log('⏰ TIME:', new Date().toLocaleTimeString());
    console.log('==========================================');
    
    // Try Gmail with working credentials
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      console.log('📧 Trying Gmail service...');
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
              user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: `"Internship Portal" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          text,
          html: html || text,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Gmail sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId, otp, service: 'Gmail' };
      } catch (gmailError) {
        console.log('⚠️ Gmail failed:', gmailError.message);
        // Continue to fallback
      }
    }
    
    // Fallback to Ethereal for testing
    console.log('📧 Using Ethereal test service...');
    const testAccount = await nodemailer.createTestAccount();
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailOptions = {
      from: `"Internship Portal" <${testAccount.user}>`,
      to,
      subject,
      text,
      html: html || text,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Ethereal sent successfully:', result.messageId);
    console.log('📧 Preview URL:', nodemailer.getTestMessageUrl(result));
    
    return { 
      success: true, 
      messageId: result.messageId, 
      otp: otp,
      service: 'Ethereal',
      previewUrl: nodemailer.getTestMessageUrl(result)
    };
    
  } catch (error) {
    console.error('❌ Email failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail, generateOTP };
