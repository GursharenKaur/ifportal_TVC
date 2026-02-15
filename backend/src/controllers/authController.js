const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Student = require('../models/Student');
const Company = require('../models/Company');
const { sendEmail, generateOTP } = require('../utils/finalEmailService');
const { generateAndLogOTP } = require('../utils/consoleOTP');


// =============================
// Generate JWT
// =============================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


// =============================
// LOGIN USER
// =============================
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  // Check if user exists
  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check email verification
  if (!user.isVerified) {
    res.status(401);
    throw new Error('Please verify your email before login');
  }

  let profile = null;
  const role = user.role.toUpperCase();

  if (role === 'STUDENT') {
    profile = await Student.findOne({ userId: user._id });
  } else if (role === 'COMPANY') {
    profile = await Company.findOne({ userId: user._id });
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    profile,
    token: generateToken(user._id),
  });
});


// =============================
// REGISTER USER
// =============================
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, ...profileData } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    // If user exists but is not verified, delete and allow fresh registration
    if (!userExists.isVerified) {
      await User.deleteOne({ _id: userExists._id });
      console.log(`Deleted unverified user: ${email}`);
    } else {
      // User exists and is verified
      res.status(400);
      throw new Error('User already exists');
    }
  }

  // Create user (unverified by default) - NO PROFILE CREATION YET
  const user = await User.create({
    name,
    email,
    password,
    role: role.toUpperCase(),
    isVerified: false,
  });

  // Generate OTP
  const otp = generateOTP();
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 24px;">Email Verification</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 20px 0; font-size: 16px;">
          Your One-Time Password (OTP) for account verification is:
        </p>
        <div style="background: white; color: #333; font-size: 32px; font-weight: bold; 
                    padding: 20px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: rgba(255,255,255,0.8); margin: 20px 0 0 0; font-size: 14px;">
          This OTP expires in 10 minutes. Please do not share this code with anyone.
        </p>
      </div>
      <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
        <p>© 2024 Internship Portal. All rights reserved.</p>
      </div>
    </div>
  `;

  const otpResult = await sendEmail(
    user.email,
    'Verify Your Account - OTP Code',
    `Your OTP is ${otp}. It expires in 10 minutes.`,
    emailHtml
  );

  if (!otpResult.success) {
    console.error('Failed to send OTP email:', otpResult.error);
    res.status(500);
    throw new Error('Failed to send verification email. Please try again.');
  }

  // Use OTP from email service if available, otherwise use generated one
  const finalOtp = otpResult.otp || otp;
  
  // Log the final OTP for user
  console.log('==========================================');
  console.log(' FINAL OTP FOR', user.email, ':', finalOtp);
  console.log('==========================================');

  user.otp = await bcrypt.hash(finalOtp, 10);
  user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  await user.save();

  res.status(201).json({
    message: 'Registration successful. Please verify the OTP sent to your email.',
    requiresVerification: true,
    email: user.email,
  });
});


// =============================
// VERIFY OTP
// =============================
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp, profileData } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    return res.json({ message: 'User already verified' });
  }

  if (!user.otp || !user.otpExpires) {
    res.status(400);
    throw new Error('No OTP found. Please request a new one.');
  }

  if (user.otpExpires < Date.now()) {
    res.status(400);
    throw new Error('OTP expired');
  }

  // Compare hashed OTP
  const isOtpMatch = await bcrypt.compare(otp, user.otp);

  if (!isOtpMatch) {
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Mark verified and create profile NOW
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  // Create role-based profile only after verification
  let profile = null;
  const role = user.role.toUpperCase();

  if (role === 'STUDENT') {
    profile = await Student.create({
      userId: user._id,
      rollNo: profileData?.rollNo || 'N/A',
      branch: profileData?.branch || 'N/A',
      year: profileData?.year || 'N/A',
      cgpa: 0,
    });
  } else if (role === 'COMPANY') {
    profile = await Company.create({
      userId: user._id,
      name: profileData?.name || user.name,
      description: profileData?.industry || 'Tech',
      website: profileData?.website || 'http://example.com',
      verified: false,
    });
  }

  res.json({
    message: 'Account verified successfully',
    token: generateToken(user._id),
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role.toLowerCase(),
    },
    role: user.role.toLowerCase(),
    profile,
  });
});


// =============================
// RESEND OTP
// =============================
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400);
    throw new Error('User not found');
  }

  if (user.isVerified) {
    return res.json({ message: 'User already verified' });
  }

  const otp = generateOTP();

  user.otp = await bcrypt.hash(otp, 10);
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save();

  await sendEmail(
    user.email,
    'Resend OTP',
    `Your new OTP is ${otp}. It expires in 10 minutes.`,
    `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px; text-align: center;">
        <h2 style="color: white; margin: 0; font-size: 24px;">Resend OTP</h2>
        <p style="color: rgba(255,255,255,0.9); margin: 20px 0; font-size: 16px;">
          Your new One-Time Password (OTP) is:
        </p>
        <div style="background: white; color: #333; font-size: 32px; font-weight: bold; 
                    padding: 20px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: rgba(255,255,255,0.8); margin: 20px 0 0 0; font-size: 14px;">
          This OTP expires in 10 minutes.
        </p>
      </div>
    </div>`
  );

  res.json({ message: 'OTP resent successfully' });
});


module.exports = {
  loginUser,
  registerUser,
  verifyOtp,
  resendOtp,
};
